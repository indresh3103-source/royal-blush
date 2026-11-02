import { useState } from "react";
import { CalendarPlus, Check, Heart, Loader2, Send, X } from "lucide-react";
import type { SiteData } from "../../types";
import { api, ApiError } from "../../lib/api";
import type { RsvpResult } from "../../lib/api";
import { OrnamentDivider } from "../decor/Ornament";
import { Mandala } from "../decor/Mandala";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { cn, formatDateLong, formatDateShort, formatTime, idempotencyKey } from "../../lib/utils";
import { googleCalendarUrl } from "../../lib/calendar";
import { downloadIcs, weddingIcsUrl } from "../../lib/api";

interface RsvpSectionProps {
  site: SiteData;
}

function responseKey(weddingId: string) {
  const key = `rb_rsvp_key_${weddingId}`;
  if (typeof window === "undefined") return idempotencyKey();
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;
  const created = idempotencyKey();
  window.sessionStorage.setItem(key, created);
  return created;
}

export function RsvpSection({ site }: RsvpSectionProps) {
  const { wedding, settings, events, theme, rsvpOpen } = site;
  const [attendance, setAttendance] = useState<"ATTENDING" | "DECLINED">("ATTENDING");
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [selectedEvents, setSelectedEvents] = useState<string[]>(() => events.map((event) => event.id));
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [result, setResult] = useState<RsvpResult | null>(null);
  const [error, setError] = useState("");
  const [key, setKey] = useState(() => responseKey(wedding.id));

  const calendarEntry =
    wedding.startsAt && wedding.endsAt
      ? {
          title: wedding.title,
          description: wedding.invitationMessage,
          location: [wedding.venueName, wedding.venueAddress, wedding.city].filter(Boolean).join(", "),
          startIso: wedding.startsAt,
          endIso: wedding.endsAt,
          timezone: wedding.timezone
        }
      : null;

  const toggleEvent = (id: string) => {
    setSelectedEvents((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (guestName.trim().length < 2) {
      setError("Please share the name we should welcome.");
      setStatus("error");
      return;
    }
    if (settings.rsvpRequirePhone && phone.trim().length < 5) {
      setError("Please share a mobile number so we can reach you.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    try {
      const response = await api.public.submitRsvp({
        guestName: guestName.trim(),
        phone: phone.trim() || undefined,
        attendance,
        guestCount: settings.rsvpAllowGuestCount ? guestCount : 1,
        events: attendance === "ATTENDING" ? selectedEvents : [],
        message: message.trim() || undefined,
        idempotencyKey: key,
        website
      });
      setResult(response);
      setStatus("success");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "We could not send your response. Please try again.");
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setError("");
    setMessage("");
    setGuestName("");
    setPhone("");
    setGuestCount(1);
    setSelectedEvents(events.map((event) => event.id));
    const nextKey = idempotencyKey();
    window.sessionStorage.setItem(`rb_rsvp_key_${wedding.id}`, nextKey);
    setKey(nextKey);
  };

  return (
    <section className="relative overflow-hidden bg-[#f4e3e4] py-20 sm:py-28">
      <div className="pointer-events-none absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-royal-accent/40 blur-3xl" />
      <div className="container-rb relative z-10">
        <SectionHeading
          kicker="With Joy"
          title={settings.rsvpTitle}
          description={settings.rsvpDescription}
          ornament={theme.ornamentStyle as "classic" | "floral" | "minimal"}
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-stretch">
          <Reveal className="relative overflow-hidden rounded-sm bg-royal-deep p-7 text-[#fff8ee] sm:p-9">
            <div className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 opacity-20">
              <Mandala className="h-full w-full text-[#e8cf9b] animate-spin-slow" />
            </div>
            <div className="relative z-10 flex h-full flex-col">
              <p className="kicker text-[#d8bd83]">Kindly Respond</p>
              <h3 className="mt-4 font-display text-4xl leading-none text-[#fff8ee] sm:text-5xl">
                Your presence
                <span className="script block text-[2.6rem] text-[#e8cf9b] sm:text-5xl">is our blessing</span>
              </h3>
              <OrnamentDivider className="mt-6 ml-0 mr-auto text-[#d8bd83]" />
              <div className="mt-7 space-y-4 text-[0.78rem] text-[#f7e6c2]/70">
                <div>
                  <p className="text-[0.48rem] uppercase tracking-[0.3em] text-[#d8bd83]">The Celebration</p>
                  <p className="mt-1 font-display text-lg text-[#fff8ee]">
                    {formatDateLong(wedding.weddingDate, wedding.timezone)}
                  </p>
                  <p className="text-[0.72rem] text-[#f7e6c2]/60">{formatTime(wedding.weddingTime)} onwards</p>
                </div>
                <div>
                  <p className="text-[0.48rem] uppercase tracking-[0.3em] text-[#d8bd83]">The Venue</p>
                  <p className="mt-1 font-display text-lg leading-snug text-[#fff8ee]">{wedding.venueName}</p>
                  <p className="text-[0.72rem] text-[#f7e6c2]/60">{[wedding.city, wedding.state].filter(Boolean).join(", ")}</p>
                </div>
                {settings.rsvpClosingDate ? (
                  <div>
                    <p className="text-[0.48rem] uppercase tracking-[0.3em] text-[#d8bd83]">Please respond by</p>
                    <p className="mt-1 font-display text-lg text-[#fff8ee]">
                      {formatDateLong(settings.rsvpClosingDate, wedding.timezone)}
                    </p>
                  </div>
                ) : null}
              </div>
              {calendarEntry ? (
                <div className="mt-auto flex flex-wrap gap-2 pt-8">
                  <a
                    href={googleCalendarUrl(calendarEntry)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-[0.52rem] uppercase tracking-[0.2em] text-[#e8cf9b] transition hover:text-white"
                  >
                    <CalendarPlus className="h-4 w-4" />
                    Add to calendar
                  </a>
                  <button
                    type="button"
                    onClick={() => downloadIcs(weddingIcsUrl())}
                    className="text-[0.52rem] uppercase tracking-[0.2em] text-[#e8cf9b] transition hover:text-white"
                  >
                    Download .ics
                  </button>
                </div>
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="ornate-card h-full p-6 sm:p-9">
              {!rsvpOpen || !settings.rsvpEnabled ? (
                <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full border border-royal-primary/35 text-royal-primary">
                    <Heart className="h-7 w-7" />
                  </span>
                  <h3 className="mt-5 font-display text-3xl text-royal-deep">RSVP is now closed</h3>
                  <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-royal-ink/60">
                    {settings.rsvpClosingDate
                      ? `The guest list closed on ${formatDateLong(settings.rsvpClosingDate, wedding.timezone)}. Please reach out to the family for any last-minute arrangements.`
                      : "Online responses are currently closed. Please reach out to the family for assistance."}
                  </p>
                  {wedding.familyContactPhone ? (
                    <a href={`tel:${wedding.familyContactPhone.replace(/\s/g, "")}`} className="btn btn-deep mt-6">
                      Contact the family
                    </a>
                  ) : null}
                </div>
              ) : status === "success" && result ? (
                <div className="flex h-full flex-col items-center justify-center py-8 text-center" role="status" aria-live="polite">
                  <div className="relative grid h-24 w-24 place-items-center">
                    <Mandala className="absolute inset-0 h-full w-full text-royal-primary/40 animate-spin-slow" />
                    <span className="relative grid h-16 w-16 place-items-center rounded-full bg-royal-deep text-[#f7e6c2]">
                      {result.attendance === "ATTENDING" ? <Heart className="h-7 w-7" /> : <Check className="h-7 w-7" />}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-3xl text-royal-deep sm:text-4xl">
                    {result.attendance === "ATTENDING" ? "We cannot wait to see you" : "Thank you for letting us know"}
                  </h3>
                  <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-royal-ink/65">{result.message}</p>
                  <div className="mt-6 w-full max-w-sm rounded-sm border border-royal-primary/20 bg-royal-primary/[0.06] p-4 text-left text-[0.72rem] text-royal-ink/65">
                    <p className="flex justify-between gap-4">
                      <span>Guest</span>
                      <span className="font-medium text-royal-ink">{guestName}</span>
                    </p>
                    <p className="mt-2 flex justify-between gap-4">
                      <span>Response</span>
                      <span className="font-medium text-royal-ink">{result.attendance === "ATTENDING" ? "Attending" : "Unable to attend"}</span>
                    </p>
                    {result.attendance === "ATTENDING" ? (
                      <>
                        <p className="mt-2 flex justify-between gap-4">
                          <span>Guests</span>
                          <span className="font-medium text-royal-ink">{settings.rsvpAllowGuestCount ? guestCount : 1}</span>
                        </p>
                        <p className="mt-2 flex justify-between gap-4">
                          <span>Events</span>
                          <span className="text-right font-medium text-royal-ink">
                            {selectedEvents.length ? `${selectedEvents.length} selected` : "All celebrations"}
                          </span>
                        </p>
                      </>
                    ) : null}
                  </div>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    {result.attendance === "ATTENDING" && calendarEntry ? (
                      <a href={googleCalendarUrl(calendarEntry)} target="_blank" rel="noreferrer" className="btn btn-gold">
                        <CalendarPlus className="h-4 w-4" />
                        Add to calendar
                      </a>
                    ) : null}
                    <button type="button" onClick={reset} className="btn btn-outline">
                      Submit another response
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} noValidate>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-2xl text-royal-deep">Your response</h3>
                    <span className="text-[0.5rem] uppercase tracking-[0.24em] text-royal-primary">Required</span>
                  </div>

                  <fieldset className="mt-5">
                    <legend className="field-label">Will you be joining us?</legend>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setAttendance("ATTENDING")}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-sm border px-3 py-3 text-[0.6rem] uppercase tracking-[0.16em] transition",
                          attendance === "ATTENDING"
                            ? "border-royal-deep bg-royal-deep text-[#fff8ee]"
                            : "border-royal-primary/35 bg-white/40 text-royal-ink/70 hover:border-royal-primary"
                        )}
                        aria-pressed={attendance === "ATTENDING"}
                      >
                        <Heart className="h-4 w-4" />
                        Joyfully accept
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttendance("DECLINED")}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-sm border px-3 py-3 text-[0.6rem] uppercase tracking-[0.16em] transition",
                          attendance === "DECLINED"
                            ? "border-royal-deep bg-royal-deep text-[#fff8ee]"
                            : "border-royal-primary/35 bg-white/40 text-royal-ink/70 hover:border-royal-primary"
                        )}
                        aria-pressed={attendance === "DECLINED"}
                      >
                        <X className="h-4 w-4" />
                        Regretfully decline
                      </button>
                    </div>
                  </fieldset>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="rsvp-name" className="field-label">
                        Full name
                      </label>
                      <input
                        id="rsvp-name"
                        value={guestName}
                        onChange={(event) => setGuestName(event.target.value)}
                        className="field-input"
                        placeholder="Your name"
                        autoComplete="name"
                        maxLength={120}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="rsvp-phone" className="field-label">
                        Mobile {settings.rsvpRequirePhone ? "" : "(optional)"}
                      </label>
                      <input
                        id="rsvp-phone"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        className="field-input"
                        placeholder="+91"
                        autoComplete="tel"
                        inputMode="tel"
                        maxLength={30}
                        required={settings.rsvpRequirePhone}
                      />
                    </div>
                  </div>

                  {attendance === "ATTENDING" && settings.rsvpAllowGuestCount ? (
                    <div className="mt-4 max-w-[12rem]">
                      <label htmlFor="rsvp-guests" className="field-label">
                        Number of guests
                      </label>
                      <select
                        id="rsvp-guests"
                        value={guestCount}
                        onChange={(event) => setGuestCount(Number(event.target.value))}
                        className="field-select"
                      >
                        {Array.from({ length: settings.rsvpMaxGuests }).map((_, index) => (
                          <option key={index + 1} value={index + 1}>
                            {index + 1} {index === 0 ? "guest" : "guests"}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  {attendance === "ATTENDING" && events.length ? (
                    <fieldset className="mt-5">
                      <legend className="field-label">Which celebrations will you attend?</legend>
                      <div className="grid max-h-52 gap-2 overflow-y-auto rounded-sm border border-royal-primary/20 bg-white/30 p-3 sm:grid-cols-2">
                        {events.map((event) => {
                          const checked = selectedEvents.includes(event.id);
                          return (
                            <label
                              key={event.id}
                              className={cn(
                                "flex cursor-pointer items-start gap-2 rounded-sm border p-2.5 transition",
                                checked ? "border-royal-primary/60 bg-royal-primary/[0.08]" : "border-transparent hover:bg-white/50"
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleEvent(event.id)}
                                className="mt-0.5 h-3.5 w-3.5 accent-[#762f43]"
                              />
                              <span className="min-w-0">
                                <span className="block truncate text-[0.72rem] font-medium text-royal-ink">{event.name}</span>
                                <span className="block text-[0.52rem] uppercase tracking-[0.12em] text-royal-ink/45">
                                  {formatDateShort(event.eventDate, event.timezone)} · {formatTime(event.startTime)}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  ) : null}

                  <div className="mt-4">
                    <label htmlFor="rsvp-message" className="field-label">
                      A note for the couple (optional)
                    </label>
                    <textarea
                      id="rsvp-message"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      className="field-textarea"
                      placeholder="Share your wishes, blessings, or a favourite memory…"
                      maxLength={1000}
                      rows={3}
                    />
                  </div>

                  <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                    <label htmlFor="rsvp-website">Website</label>
                    <input
                      id="rsvp-website"
                      value={website}
                      onChange={(event) => setWebsite(event.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {status === "error" && error ? (
                    <p className="mt-4 rounded-sm border border-red-300/60 bg-red-50 px-3 py-2 text-[0.75rem] text-red-700" role="alert">
                      {error}
                    </p>
                  ) : null}

                  <button type="submit" disabled={status === "submitting"} className="btn btn-deep mt-5 w-full">
                    {status === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {status === "submitting" ? "Sending your response" : attendance === "ATTENDING" ? "Accept with joy" : "Send my response"}
                  </button>
                  <p className="mt-3 text-center text-[0.55rem] leading-relaxed text-royal-ink/40">
                    Your details are used only to plan this celebration and will never be shared.
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
