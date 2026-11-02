import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing, CalendarClock, Heart, Music2, Save, Share2, Sparkles } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import type { AdminInvitationSettings } from "../../types";
import { AdminButton, Alert, Badge, Field, LoadingScreen, PageHeader, Panel, Toggle } from "../components/AdminUI";
import { MediaField } from "../components/MediaPicker";
import { useToast } from "../AdminProviders";
import { cn } from "../../lib/utils";

type TabKey = "rsvp" | "countdown" | "vivah" | "invitation";

const tabs: Array<{ key: TabKey; label: string; icon: typeof BellRing }> = [
  { key: "rsvp", label: "RSVP", icon: BellRing },
  { key: "countdown", label: "Countdown & Music", icon: CalendarClock },
  { key: "vivah", label: "Vivah Sanskar", icon: Sparkles },
  { key: "invitation", label: "Invitation & Sharing", icon: Share2 }
];

interface SettingsForm {
  introEnabled: boolean;
  rsvpEnabled: boolean;
  rsvpRequirePhone: boolean;
  rsvpAllowGuestCount: boolean;
  rsvpMaxGuests: string;
  rsvpClosingDate: string;
  rsvpTitle: string;
  rsvpDescription: string;
  rsvpSuccessMessage: string;
  rsvpDeclineMessage: string;
  rsvpNotifyEmail: string;
  notifyOnRsvp: boolean;
  countdownEventId: string;
  activeMusicTrackId: string;
  musicEnabled: boolean;
  defaultVolume: string;
  vivahTitle: string;
  vivahMuhurat: string;
  vivahDate: string;
  vivahTime: string;
  vivahDescription: string;
  vivahImageUrl: string;
  shareMessage: string;
}

function toForm(settings: AdminInvitationSettings): SettingsForm {
  return {
    introEnabled: settings.introEnabled,
    rsvpEnabled: settings.rsvpEnabled,
    rsvpRequirePhone: settings.rsvpRequirePhone,
    rsvpAllowGuestCount: settings.rsvpAllowGuestCount,
    rsvpMaxGuests: String(settings.rsvpMaxGuests),
    rsvpClosingDate: settings.rsvpClosingDate ?? "",
    rsvpTitle: settings.rsvpTitle,
    rsvpDescription: settings.rsvpDescription ?? "",
    rsvpSuccessMessage: settings.rsvpSuccessMessage,
    rsvpDeclineMessage: settings.rsvpDeclineMessage,
    rsvpNotifyEmail: settings.rsvpNotifyEmail ?? "",
    notifyOnRsvp: settings.notifyOnRsvp,
    countdownEventId: settings.countdownEventId ?? "",
    activeMusicTrackId: settings.activeMusicTrackId ?? "",
    musicEnabled: settings.musicEnabled,
    defaultVolume: String(settings.defaultVolume),
    vivahTitle: settings.vivahTitle,
    vivahMuhurat: settings.vivahMuhurat ?? "",
    vivahDate: settings.vivahDate ?? "",
    vivahTime: settings.vivahTime ?? "",
    vivahDescription: settings.vivahDescription ?? "",
    vivahImageUrl: settings.vivahImageUrl ?? "",
    shareMessage: settings.shareMessage ?? ""
  };
}

function nullable(value: string) {
  return value.trim() ? value.trim() : null;
}

export function SettingsPage() {
  const weddingQuery = useQuery({ queryKey: ["admin", "wedding"], queryFn: api.admin.wedding });
  const eventsQuery = useQuery({ queryKey: ["admin", "events"], queryFn: api.admin.events });
  const musicQuery = useQuery({ queryKey: ["admin", "music"], queryFn: api.admin.music });
  const queryClient = useQueryClient();
  const toast = useToast();
  const [tab, setTab] = useState<TabKey>("rsvp");
  const [form, setForm] = useState<SettingsForm | null>(null);
  const [snapshot, setSnapshot] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!weddingQuery.data?.settings) return;
    const next = toForm(weddingQuery.data.settings);
    setForm(next);
    setSnapshot(JSON.stringify(next));
  }, [weddingQuery.data?.settings?.id]);

  const dirty = form ? JSON.stringify(form) !== snapshot : false;
  const events = useMemo(() => (eventsQuery.data ?? []).filter((event) => !event.archived), [eventsQuery.data]);
  const tracks = useMemo(() => (musicQuery.data ?? []).filter((track) => track.visible), [musicQuery.data]);
  const wedding = weddingQuery.data;

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.admin.updateSettings(payload),
    onSuccess: () => {
      if (form) setSnapshot(JSON.stringify(form));
      queryClient.invalidateQueries({ queryKey: ["admin", "wedding"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["public-site"] });
      toast.success("Invitation settings saved.");
    },
    onError: (caught) => {
      const message = caught instanceof ApiError ? caught.message : "The settings could not be saved.";
      setError(message);
      toast.error(message);
    }
  });

  const set = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const submit = () => {
    if (!form) return;
    setError("");
    if (!form.rsvpTitle.trim()) {
      setError("The RSVP section needs a title.");
      setTab("rsvp");
      return;
    }
    if (!form.rsvpSuccessMessage.trim() || !form.rsvpDeclineMessage.trim()) {
      setError("Both RSVP response messages are required.");
      setTab("rsvp");
      return;
    }
    const maxGuests = Number(form.rsvpMaxGuests);
    if (!Number.isInteger(maxGuests) || maxGuests < 1 || maxGuests > 50) {
      setError("Maximum guests must be a whole number between 1 and 50.");
      setTab("rsvp");
      return;
    }
    const volume = Number(form.defaultVolume);
    if (!Number.isInteger(volume) || volume < 0 || volume > 100) {
      setError("Default volume must be between 0 and 100.");
      setTab("countdown");
      return;
    }
    if (!form.vivahTitle.trim()) {
      setError("The Vivah Sanskar section needs a title.");
      setTab("vivah");
      return;
    }
    if (form.rsvpNotifyEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.rsvpNotifyEmail.trim())) {
      setError("Enter a valid notification email address.");
      setTab("rsvp");
      return;
    }
    save.mutate({
      introEnabled: form.introEnabled,
      rsvpEnabled: form.rsvpEnabled,
      rsvpRequirePhone: form.rsvpRequirePhone,
      rsvpAllowGuestCount: form.rsvpAllowGuestCount,
      rsvpMaxGuests: maxGuests,
      rsvpClosingDate: nullable(form.rsvpClosingDate),
      rsvpTitle: form.rsvpTitle.trim(),
      rsvpDescription: nullable(form.rsvpDescription),
      rsvpSuccessMessage: form.rsvpSuccessMessage.trim(),
      rsvpDeclineMessage: form.rsvpDeclineMessage.trim(),
      rsvpNotifyEmail: nullable(form.rsvpNotifyEmail),
      notifyOnRsvp: form.notifyOnRsvp,
      countdownEventId: form.countdownEventId || null,
      activeMusicTrackId: form.activeMusicTrackId || null,
      musicEnabled: form.musicEnabled,
      defaultVolume: volume,
      vivahTitle: form.vivahTitle.trim(),
      vivahMuhurat: nullable(form.vivahMuhurat),
      vivahDate: nullable(form.vivahDate),
      vivahTime: nullable(form.vivahTime),
      vivahDescription: nullable(form.vivahDescription),
      vivahImageUrl: nullable(form.vivahImageUrl),
      shareMessage: nullable(form.shareMessage)
    });
  };

  if (weddingQuery.isLoading || !form) return <LoadingScreen label="Loading invitation settings" />;
  if (weddingQuery.isError || !wedding) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="font-display text-2xl text-red-800">Settings could not be loaded</h1>
        <AdminButton className="mt-4" variant="danger" onClick={() => weddingQuery.refetch()}>Try again</AdminButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Studio"
        title="Invitation settings"
        description="Fine-tune how guests respond, which celebration leads the countdown, and what they read."
        actions={
          <>
            <Badge tone={dirty ? "warning" : "success"}>{dirty ? "Unsaved changes" : "Saved"}</Badge>
            <AdminButton variant="outline" disabled={!dirty} onClick={() => { setForm(JSON.parse(snapshot) as SettingsForm); setError(""); }}>
              Discard
            </AdminButton>
            <AdminButton onClick={submit} loading={save.isPending} disabled={!dirty}>
              <Save className="h-3.5 w-3.5" />
              Save settings
            </AdminButton>
          </>
        }
      />

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-[#e7dccd] bg-white p-1.5">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-[0.64rem] font-medium uppercase tracking-[0.1em] transition",
                tab === item.key ? "bg-[#762f43] text-white" : "text-[#8a776a] hover:bg-[#faf4eb] hover:text-[#49372f]"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {error ? <Alert tone="danger">{error}</Alert> : null}

      {tab === "rsvp" ? (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <Panel title="RSVP availability" description="Control when and how guests can respond.">
              <div className="space-y-5">
                <Toggle checked={form.rsvpEnabled} onChange={(value) => set("rsvpEnabled", value)} label="Accept RSVP responses" description="When disabled, the form is replaced with a gentle closed message." />
                <Toggle checked={form.rsvpRequirePhone} onChange={(value) => set("rsvpRequirePhone", value)} label="Require a mobile number" description="Ask every guest for a contact number." />
                <Toggle checked={form.rsvpAllowGuestCount} onChange={(value) => set("rsvpAllowGuestCount", value)} label="Allow guest count" description="Guests can tell you how many people are attending." />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Maximum guests" htmlFor="rsvp-max" hint="Per response, between 1 and 50.">
                    <input id="rsvp-max" type="number" min={1} max={50} className="admin-input" value={form.rsvpMaxGuests} onChange={(event) => set("rsvpMaxGuests", event.target.value)} />
                  </Field>
                  <Field label="RSVP closing date" htmlFor="rsvp-closing" hint="Responses close at the end of this day.">
                    <input id="rsvp-closing" type="date" className="admin-input" value={form.rsvpClosingDate} onChange={(event) => set("rsvpClosingDate", event.target.value)} />
                  </Field>
                </div>
              </div>
            </Panel>

            <Panel title="RSVP copy" description="The words guests see before and after responding.">
              <div className="space-y-4">
                <Field label="Section title" htmlFor="rsvp-title" required>
                  <input id="rsvp-title" className="admin-input" value={form.rsvpTitle} onChange={(event) => set("rsvpTitle", event.target.value)} />
                </Field>
                <Field label="Introduction" htmlFor="rsvp-description">
                  <textarea id="rsvp-description" className="admin-input min-h-[5rem]" value={form.rsvpDescription} onChange={(event) => set("rsvpDescription", event.target.value)} />
                </Field>
                <Field label="Message after attending" htmlFor="rsvp-success" required>
                  <textarea id="rsvp-success" className="admin-input min-h-[4rem]" value={form.rsvpSuccessMessage} onChange={(event) => set("rsvpSuccessMessage", event.target.value)} />
                </Field>
                <Field label="Message after declining" htmlFor="rsvp-decline" required>
                  <textarea id="rsvp-decline" className="admin-input min-h-[4rem]" value={form.rsvpDeclineMessage} onChange={(event) => set("rsvpDeclineMessage", event.target.value)} />
                </Field>
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title="Notifications" description="Receive an email whenever a guest responds.">
              <div className="space-y-5">
                <Toggle checked={form.notifyOnRsvp} onChange={(value) => set("notifyOnRsvp", value)} label="Email me on new responses" description="Requires a verified email provider in the API environment." />
                <Field label="Notification email" htmlFor="rsvp-email" hint="Leave blank to disable email notifications.">
                  <input id="rsvp-email" type="email" className="admin-input" value={form.rsvpNotifyEmail} onChange={(event) => set("rsvpNotifyEmail", event.target.value)} placeholder="you@example.com" />
                </Field>
                <div className="rounded-lg border border-[#e7dccd] bg-[#faf4eb] p-3 text-[0.68rem] leading-relaxed text-[#8a776a]">
                  <p className="flex items-center gap-2 font-medium text-[#49372f]"><BellRing className="h-3.5 w-3.5 text-[#b89555]" /> A note on email</p>
                  <p className="mt-1.5">Notifications are sent through the SMTP settings configured for the API. If email is not configured, responses are still saved and visible here.</p>
                </div>
              </div>
            </Panel>

            <Panel title="Guest experience" description="A small welcome before the invitation opens.">
              <Toggle checked={form.introEnabled} onChange={(value) => set("introEnabled", value)} label="Show the curtain intro" description="A floral velvet curtain opens automatically as the invitation loads." />
            </Panel>
          </div>
        </div>
      ) : null}

      {tab === "countdown" ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Countdown" description="Choose the moment the countdown leads toward.">
            <div className="space-y-4">
              <Field label="Countdown event" htmlFor="countdown-event" hint="Leave blank to count down to the wedding ceremony itself.">
                <select id="countdown-event" className="admin-input" value={form.countdownEventId} onChange={(event) => set("countdownEventId", event.target.value)}>
                  <option value="">The wedding ceremony · {wedding.weddingDate}</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>{event.name} · {event.eventDate} {event.startTime}</option>
                  ))}
                </select>
              </Field>
              <div className="rounded-lg bg-[#faf4eb] p-3 text-[0.68rem] leading-relaxed text-[#8a776a]">
                The countdown is timezone-aware and uses the wedding timezone: <span className="font-medium text-[#49372f]">{wedding.timezone}</span>. It recalculates live on every guest's device.
              </div>
            </div>
          </Panel>

          <Panel title="Music" description="The soundtrack that accompanies the invitation.">
            <div className="space-y-5">
              <Toggle checked={form.musicEnabled} onChange={(value) => set("musicEnabled", value)} label="Music enabled" description="Show the music player and allow playback." />
              <Field label="Opening track" htmlFor="settings-track">
                <select id="settings-track" className="admin-input" value={form.activeMusicTrackId} onChange={(event) => set("activeMusicTrackId", event.target.value)}>
                  <option value="">No opening track</option>
                  {tracks.map((track) => (
                    <option key={track.id} value={track.id}>{track.title}{track.artist ? ` — ${track.artist}` : ""}</option>
                  ))}
                </select>
              </Field>
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="settings-volume" className="admin-label mb-0">Default volume</label>
                  <span className="text-[0.7rem] font-medium text-[#762f43]">{form.defaultVolume}%</span>
                </div>
                <input
                  id="settings-volume"
                  type="range"
                  min={0}
                  max={100}
                  value={Number(form.defaultVolume) || 0}
                  onChange={(event) => set("defaultVolume", event.target.value)}
                  className="mt-2 w-full accent-[#762f43]"
                />
              </div>
              <p className="flex items-center gap-2 text-[0.66rem] leading-relaxed text-[#8a776a]">
                <Music2 className="h-3.5 w-3.5 shrink-0 text-[#b89555]" />
                Manage the full soundtrack and upload audio in the Music section.
              </p>
            </div>
          </Panel>
        </div>
      ) : null}

      {tab === "vivah" ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Panel title="Vivah Sanskar" description="The sacred ceremony section of the invitation.">
            <div className="space-y-4">
              <Field label="Section title" htmlFor="vivah-title" required>
                <input id="vivah-title" className="admin-input" value={form.vivahTitle} onChange={(event) => set("vivahTitle", event.target.value)} />
              </Field>
              <Field label="Muhurat" htmlFor="vivah-muhurat" hint="A short auspicious-time note shown beneath the title.">
                <input id="vivah-muhurat" className="admin-input" value={form.vivahMuhurat} onChange={(event) => set("vivahMuhurat", event.target.value)} placeholder="Auspicious Muhurat · 8:45 PM" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Ceremony date" htmlFor="vivah-date">
                  <input id="vivah-date" type="date" className="admin-input" value={form.vivahDate} onChange={(event) => set("vivahDate", event.target.value)} />
                </Field>
                <Field label="Ceremony time" htmlFor="vivah-time">
                  <input id="vivah-time" type="time" className="admin-input" value={form.vivahTime} onChange={(event) => set("vivahTime", event.target.value)} />
                </Field>
              </div>
              <Field label="Description" htmlFor="vivah-description">
                <textarea id="vivah-description" className="admin-input min-h-[7rem]" value={form.vivahDescription} onChange={(event) => set("vivahDescription", event.target.value)} />
              </Field>
            </div>
          </Panel>
          <Panel title="Ceremony image" description="A portrait image for the Vivah Sanskar section.">
            <MediaField label="Ceremony photograph" value={form.vivahImageUrl} onChange={(value) => set("vivahImageUrl", value ?? "")} hint="Falls back to the venue photograph when empty." />
            {form.vivahImageUrl ? (
              <div className="mt-5 overflow-hidden rounded-lg border border-[#e7dccd]">
                <img src={form.vivahImageUrl} alt="Vivah Sanskar preview" className="aspect-[3/4] w-full object-cover" />
              </div>
            ) : null}
          </Panel>
        </div>
      ) : null}

      {tab === "invitation" ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Sharing" description="The message that appears when your invitation is shared.">
            <div className="space-y-4">
              <Field label="Share message" htmlFor="share-message" hint="Used in link previews and the invitation's meta description.">
                <textarea id="share-message" className="admin-input min-h-[6rem]" value={form.shareMessage} onChange={(event) => set("shareMessage", event.target.value)} />
              </Field>
              <div className="rounded-lg border border-[#e7dccd] bg-[#faf4eb] p-3">
                <p className="text-[0.56rem] uppercase tracking-[0.16em] text-[#a08e80]">Invitation address</p>
                <p className="mt-1 break-all text-[0.72rem] text-[#6f5c4f]">{window.location.origin}/</p>
              </div>
              <AdminButton
                variant="outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.origin);
                    toast.success("Invitation link copied.");
                  } catch {
                    toast.error("The link could not be copied.");
                  }
                }}
              >
                <Share2 className="h-3.5 w-3.5" />
                Copy invitation link
              </AdminButton>
            </div>
          </Panel>

          <Panel title="Wedding summary" description="A quick reference for the invitation.">
            <div className="space-y-4">
              <div className="rounded-lg bg-[#762f43] p-5 text-center text-white">
                <p className="text-[0.48rem] uppercase tracking-[0.32em] text-[#e8cf9b]">The Wedding of</p>
                <p className="mt-2 font-display text-3xl leading-tight">{wedding.brideName}</p>
                <p className="my-1 font-script text-2xl text-[#e8cf9b]">&amp;</p>
                <p className="font-display text-3xl leading-tight">{wedding.groomName}</p>
                <p className="mt-3 text-[0.54rem] uppercase tracking-[0.2em] text-[#e8cf9b]">{wedding.weddingDate} · {wedding.weddingTime} · {wedding.timezone}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-[#f0e6d8] p-3">
                  <p className="text-[0.54rem] uppercase tracking-[0.16em] text-[#a08e80]">Venue</p>
                  <p className="mt-1 text-[0.76rem] text-[#49372f]">{wedding.venueName ?? "Not set"}</p>
                  <p className="text-[0.62rem] text-[#8a776a]">{[wedding.city, wedding.state].filter(Boolean).join(", ")}</p>
                </div>
                <div className="rounded-lg border border-[#f0e6d8] p-3">
                  <p className="text-[0.54rem] uppercase tracking-[0.16em] text-[#a08e80]">Family contact</p>
                  <p className="mt-1 text-[0.76rem] text-[#49372f]">{wedding.familyContactName ?? "Not set"}</p>
                  <p className="text-[0.62rem] text-[#8a776a]">{wedding.familyContactPhone ?? ""}</p>
                </div>
              </div>
              <p className="flex items-center gap-2 text-[0.64rem] leading-relaxed text-[#a08e80]">
                <Heart className="h-3.5 w-3.5 shrink-0 text-[#b89555]" />
                Update names, dates, and venue details in Wedding Details.
              </p>
            </div>
          </Panel>
        </div>
      ) : null}

      {dirty ? (
        <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-xl border border-[#d9cbb9] bg-white/95 px-4 py-3 shadow-[0_20px_50px_-30px_rgba(73,55,47,0.6)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.72rem] text-[#8a776a]">You have unsaved invitation settings.</p>
          <div className="flex gap-2">
            <AdminButton variant="ghost" size="sm" onClick={() => { setForm(JSON.parse(snapshot) as SettingsForm); setError(""); }}>Discard</AdminButton>
            <AdminButton size="sm" onClick={submit} loading={save.isPending}>
              <Save className="h-3.5 w-3.5" />
              Save settings
            </AdminButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
