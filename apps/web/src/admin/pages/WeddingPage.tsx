import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Save } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import type { AdminWedding } from "../../types";
import { AdminButton, Alert, Badge, Field, LoadingScreen, PageHeader, Panel } from "../components/AdminUI";
import { MediaField } from "../components/MediaPicker";
import { useToast } from "../AdminProviders";
import { cn } from "../../lib/utils";

type FormState = Record<string, string>;
type TabKey = "couple" | "story" | "day" | "venue" | "contacts";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "couple", label: "The Couple" },
  { key: "story", label: "Story & Invitation" },
  { key: "day", label: "Wedding Day" },
  { key: "venue", label: "The Venue" },
  { key: "contacts", label: "Contacts" }
];

const nullableKeys = new Set([
  "tagline",
  "invitationMessage",
  "brideShortName",
  "groomShortName",
  "coupleInitials",
  "brideIntro",
  "groomIntro",
  "familyIntro",
  "weddingEndTime",
  "city",
  "state",
  "pinCode",
  "venueName",
  "venueAddress",
  "venueLandmark",
  "venueParking",
  "venueMapsUrl",
  "venueDescription",
  "venuePhotoUrl",
  "venueContactName",
  "venueContactPhone",
  "familyContactName",
  "familyContactPhone",
  "familyContactEmail",
  "heroImageUrl",
  "bridePortraitUrl",
  "groomPortraitUrl",
  "familyPhotoUrl",
  "brideFamilyPhotoUrl",
  "groomFamilyPhotoUrl"
]);

const timezones = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Australia/Sydney",
  "Pacific/Auckland",
  "UTC"
];

function toForm(wedding: AdminWedding): FormState {
  const fields = [
    "title",
    "tagline",
    "invitationMessage",
    "brideName",
    "groomName",
    "brideShortName",
    "groomShortName",
    "coupleInitials",
    "brideIntro",
    "groomIntro",
    "familyIntro",
    "weddingDate",
    "weddingTime",
    "weddingEndTime",
    "timezone",
    "city",
    "state",
    "pinCode",
    "venueName",
    "venueAddress",
    "venueLandmark",
    "venueParking",
    "venueMapsUrl",
    "venueDescription",
    "venuePhotoUrl",
    "venueContactName",
    "venueContactPhone",
    "familyContactName",
    "familyContactPhone",
    "familyContactEmail",
    "heroImageUrl",
    "bridePortraitUrl",
    "groomPortraitUrl",
    "familyPhotoUrl",
    "brideFamilyPhotoUrl",
    "groomFamilyPhotoUrl"
  ] as const;
  const result: FormState = {};
  for (const field of fields) {
    result[field] = (wedding[field] as string | null | undefined) ?? "";
  }
  return result;
}

export function WeddingPage() {
  const query = useQuery({ queryKey: ["admin", "wedding"], queryFn: api.admin.wedding });
  const queryClient = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState<FormState>({});
  const [snapshot, setSnapshot] = useState("");
  const [tab, setTab] = useState<TabKey>("couple");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query.data) return;
    const next = toForm(query.data);
    setForm(next);
    setSnapshot(JSON.stringify(next));
  }, [query.data?.id]);

  const dirty = useMemo(() => Object.keys(form).length > 0 && JSON.stringify(form) !== snapshot, [form, snapshot]);
  const timezoneOptions = useMemo(() => {
    const current = form.timezone;
    return current && !timezones.includes(current) ? [current, ...timezones] : timezones;
  }, [form.timezone]);

  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.admin.updateWedding(payload),
    onSuccess: () => {
      setSnapshot(JSON.stringify(form));
      queryClient.invalidateQueries({ queryKey: ["admin", "wedding"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["public-site"] });
      toast.success("Wedding details saved.");
    },
    onError: (caught) => {
      const message = caught instanceof ApiError ? caught.message : "The changes could not be saved.";
      setError(message);
      toast.error(message);
    }
  });

  const save = () => {
    setError("");
    if (!form.title?.trim() || !form.brideName?.trim() || !form.groomName?.trim()) {
      setError("The wedding title and both names are required.");
      return;
    }
    if (!form.weddingDate || !form.weddingTime || !form.timezone) {
      setError("The wedding date, time, and timezone are required.");
      return;
    }
    const payload: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(form)) {
      const trimmed = value.trim();
      payload[key] = nullableKeys.has(key) ? (trimmed ? trimmed : null) : trimmed;
    }
    mutation.mutate(payload);
  };

  if (query.isLoading) return <LoadingScreen label="Loading wedding details" />;
  if (query.isError || !query.data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="font-display text-2xl text-red-800">Wedding details could not be loaded</h1>
        <AdminButton className="mt-4" variant="danger" onClick={() => query.refetch()}>Try again</AdminButton>
      </div>
    );
  }

  const text = (key: string) => form[key] ?? "";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="The Invitation"
        title="Wedding details"
        description="The names, dates, and words that shape your public invitation."
        actions={
          <>
            <Badge tone={dirty ? "warning" : "success"}>{dirty ? "Unsaved changes" : "Saved"}</Badge>
            <Link to="/" target="_blank" rel="noreferrer">
              <AdminButton variant="outline">
                <ExternalLink className="h-3.5 w-3.5" />
                Preview
              </AdminButton>
            </Link>
            <AdminButton onClick={save} loading={mutation.isPending} disabled={!dirty}>
              <Save className="h-3.5 w-3.5" />
              Save changes
            </AdminButton>
          </>
        }
      />

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-[#e7dccd] bg-white p-1.5">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              "shrink-0 rounded-lg px-4 py-2.5 text-[0.66rem] font-medium uppercase tracking-[0.12em] transition",
              tab === item.key ? "bg-[#762f43] text-white" : "text-[#8a776a] hover:bg-[#faf4eb] hover:text-[#49372f]"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? <Alert tone="danger">{error}</Alert> : null}

      {tab === "couple" ? (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Panel title="The couple" description="Names as they should appear throughout the invitation.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Wedding title" htmlFor="title" required className="sm:col-span-2">
                <input id="title" className="admin-input" value={text("title")} onChange={(event) => set("title", event.target.value)} placeholder="The wedding title" />
              </Field>
              <Field label="Bride's full name" htmlFor="brideName" required>
                <input id="brideName" className="admin-input" value={text("brideName")} onChange={(event) => set("brideName", event.target.value)} />
              </Field>
              <Field label="Groom's full name" htmlFor="groomName" required>
                <input id="groomName" className="admin-input" value={text("groomName")} onChange={(event) => set("groomName", event.target.value)} />
              </Field>
              <Field label="Bride's short name" htmlFor="brideShortName" hint="Used in the hero and script accents.">
                <input id="brideShortName" className="admin-input" value={text("brideShortName")} onChange={(event) => set("brideShortName", event.target.value)} />
              </Field>
              <Field label="Groom's short name" htmlFor="groomShortName">
                <input id="groomShortName" className="admin-input" value={text("groomShortName")} onChange={(event) => set("groomShortName", event.target.value)} />
              </Field>
              <Field label="Monogram initials" htmlFor="coupleInitials" hint="Shown in the navigation and footer.">
                <input id="coupleInitials" className="admin-input" value={text("coupleInitials")} onChange={(event) => set("coupleInitials", event.target.value)} placeholder="A & M" />
              </Field>
            </div>
          </Panel>

          <div className="space-y-6">
            <Panel title="Portraits" description="Choose refined portraits for each profile.">
              <div className="space-y-5">
                <MediaField label="Bride's portrait" value={form.bridePortraitUrl} onChange={(value) => set("bridePortraitUrl", value ?? "")} />
                <MediaField label="Groom's portrait" value={form.groomPortraitUrl} onChange={(value) => set("groomPortraitUrl", value ?? "")} />
              </div>
            </Panel>
            <Panel title="Family photographs" description="Warm group portraits for the family section.">
              <div className="space-y-5">
                <MediaField label="Family portrait" value={form.familyPhotoUrl} onChange={(value) => set("familyPhotoUrl", value ?? "")} />
                <MediaField label="Bride's family" value={form.brideFamilyPhotoUrl} onChange={(value) => set("brideFamilyPhotoUrl", value ?? "")} />
                <MediaField label="Groom's family" value={form.groomFamilyPhotoUrl} onChange={(value) => set("groomFamilyPhotoUrl", value ?? "")} />
              </div>
            </Panel>
          </div>
        </div>
      ) : null}

      {tab === "story" ? (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <Panel title="Invitation words" description="The first words your guests will read.">
              <div className="space-y-4">
                <Field label="Tagline" htmlFor="tagline" hint="A short romantic line beneath the names.">
                  <input id="tagline" className="admin-input" value={text("tagline")} onChange={(event) => set("tagline", event.target.value)} placeholder="Two souls, one sacred journey" />
                </Field>
                <Field label="Invitation message" htmlFor="invitationMessage">
                  <textarea id="invitationMessage" className="admin-input min-h-[7rem]" value={text("invitationMessage")} onChange={(event) => set("invitationMessage", event.target.value)} />
                </Field>
              </div>
            </Panel>
            <Panel title="The couple's story" description="Personal introductions for the bride and groom.">
              <div className="space-y-4">
                <Field label="Bride's introduction" htmlFor="brideIntro">
                  <textarea id="brideIntro" className="admin-input min-h-[7rem]" value={text("brideIntro")} onChange={(event) => set("brideIntro", event.target.value)} />
                </Field>
                <Field label="Groom's introduction" htmlFor="groomIntro">
                  <textarea id="groomIntro" className="admin-input min-h-[7rem]" value={text("groomIntro")} onChange={(event) => set("groomIntro", event.target.value)} />
                </Field>
                <Field label="Family introduction" htmlFor="familyIntro">
                  <textarea id="familyIntro" className="admin-input min-h-[7rem]" value={text("familyIntro")} onChange={(event) => set("familyIntro", event.target.value)} />
                </Field>
              </div>
            </Panel>
          </div>
          <Panel title="Hero image" description="The cinematic photograph behind your names.">
            <MediaField label="Hero photograph" value={form.heroImageUrl} onChange={(value) => set("heroImageUrl", value ?? "")} hint="Use a landscape image, ideally 2000px wide or more." />
            {form.heroImageUrl ? (
              <div className="mt-5 overflow-hidden rounded-lg border border-[#e7dccd]">
                <img src={form.heroImageUrl} alt="Hero preview" className="aspect-[4/3] w-full object-cover" />
              </div>
            ) : null}
          </Panel>
        </div>
      ) : null}

      {tab === "day" ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Date & time" description="All times are interpreted in the wedding timezone.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Wedding date" htmlFor="weddingDate" required>
                <input id="weddingDate" type="date" className="admin-input" value={text("weddingDate")} onChange={(event) => set("weddingDate", event.target.value)} />
              </Field>
              <Field label="Timezone" htmlFor="timezone" required>
                <select id="timezone" className="admin-input" value={text("timezone")} onChange={(event) => set("timezone", event.target.value)}>
                  {timezoneOptions.map((zone) => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </Field>
              <Field label="Start time" htmlFor="weddingTime" required>
                <input id="weddingTime" type="time" className="admin-input" value={text("weddingTime")} onChange={(event) => set("weddingTime", event.target.value)} />
              </Field>
              <Field label="End time" htmlFor="weddingEndTime">
                <input id="weddingEndTime" type="time" className="admin-input" value={text("weddingEndTime")} onChange={(event) => set("weddingEndTime", event.target.value)} />
              </Field>
            </div>
            <Alert tone="info" className="mt-4">
              The countdown, calendar files, and event times all use this timezone. Choose the city where the wedding is taking place.
            </Alert>
          </Panel>
          <Panel title="Location summary" description="The city and region shown across the invitation.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City" htmlFor="city">
                <input id="city" className="admin-input" value={text("city")} onChange={(event) => set("city", event.target.value)} />
              </Field>
              <Field label="State / region" htmlFor="state">
                <input id="state" className="admin-input" value={text("state")} onChange={(event) => set("state", event.target.value)} />
              </Field>
              <Field label="PIN / postal code" htmlFor="pinCode">
                <input id="pinCode" className="admin-input" value={text("pinCode")} onChange={(event) => set("pinCode", event.target.value)} />
              </Field>
            </div>
          </Panel>
        </div>
      ) : null}

      {tab === "venue" ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Panel title="Venue details" description="Where the celebration will take place.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Venue name" htmlFor="venueName" className="sm:col-span-2">
                <input id="venueName" className="admin-input" value={text("venueName")} onChange={(event) => set("venueName", event.target.value)} />
              </Field>
              <Field label="Street address" htmlFor="venueAddress" className="sm:col-span-2">
                <input id="venueAddress" className="admin-input" value={text("venueAddress")} onChange={(event) => set("venueAddress", event.target.value)} />
              </Field>
              <Field label="Landmark" htmlFor="venueLandmark">
                <input id="venueLandmark" className="admin-input" value={text("venueLandmark")} onChange={(event) => set("venueLandmark", event.target.value)} />
              </Field>
              <Field label="Google Maps link" htmlFor="venueMapsUrl">
                <input id="venueMapsUrl" className="admin-input" value={text("venueMapsUrl")} onChange={(event) => set("venueMapsUrl", event.target.value)} placeholder="https://maps.google.com/…" />
              </Field>
              <Field label="Parking information" htmlFor="venueParking" className="sm:col-span-2">
                <textarea id="venueParking" className="admin-input min-h-[5rem]" value={text("venueParking")} onChange={(event) => set("venueParking", event.target.value)} />
              </Field>
              <Field label="Venue description" htmlFor="venueDescription" className="sm:col-span-2">
                <textarea id="venueDescription" className="admin-input min-h-[6rem]" value={text("venueDescription")} onChange={(event) => set("venueDescription", event.target.value)} />
              </Field>
            </div>
          </Panel>
          <Panel title="Venue photograph" description="A beautiful image of the setting.">
            <MediaField label="Venue image" value={form.venuePhotoUrl} onChange={(value) => set("venuePhotoUrl", value ?? "")} />
            {form.venuePhotoUrl ? (
              <div className="mt-5 overflow-hidden rounded-lg border border-[#e7dccd]">
                <img src={form.venuePhotoUrl} alt="Venue preview" className="aspect-[4/3] w-full object-cover" />
              </div>
            ) : null}
          </Panel>
        </div>
      ) : null}

      {tab === "contacts" ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Family contact" description="The person guests can reach for help.">
            <div className="space-y-4">
              <Field label="Contact name" htmlFor="familyContactName">
                <input id="familyContactName" className="admin-input" value={text("familyContactName")} onChange={(event) => set("familyContactName", event.target.value)} />
              </Field>
              <Field label="Contact phone" htmlFor="familyContactPhone">
                <input id="familyContactPhone" className="admin-input" value={text("familyContactPhone")} onChange={(event) => set("familyContactPhone", event.target.value)} />
              </Field>
              <Field label="Contact email" htmlFor="familyContactEmail">
                <input id="familyContactEmail" type="email" className="admin-input" value={text("familyContactEmail")} onChange={(event) => set("familyContactEmail", event.target.value)} />
              </Field>
            </div>
          </Panel>
          <Panel title="Venue concierge" description="On-site assistance for the celebration.">
            <div className="space-y-4">
              <Field label="Concierge name" htmlFor="venueContactName">
                <input id="venueContactName" className="admin-input" value={text("venueContactName")} onChange={(event) => set("venueContactName", event.target.value)} />
              </Field>
              <Field label="Concierge phone" htmlFor="venueContactPhone">
                <input id="venueContactPhone" className="admin-input" value={text("venueContactPhone")} onChange={(event) => set("venueContactPhone", event.target.value)} />
              </Field>
            </div>
          </Panel>
        </div>
      ) : null}

      {dirty ? (
        <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-xl border border-[#d9cbb9] bg-white/95 px-4 py-3 shadow-[0_20px_50px_-30px_rgba(73,55,47,0.6)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.72rem] text-[#8a776a]">You have unsaved changes to your invitation.</p>
          <div className="flex gap-2">
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={() => {
                const next = toForm(query.data);
                setForm(next);
                setSnapshot(JSON.stringify(next));
                setError("");
              }}
            >
              Discard
            </AdminButton>
            <AdminButton size="sm" onClick={save} loading={mutation.isPending}>
              <Save className="h-3.5 w-3.5" />
              Save changes
            </AdminButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
