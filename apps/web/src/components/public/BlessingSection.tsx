import { useState } from "react";
import { ArrowUp, CalendarPlus, Check, Copy, Heart, Share2 } from "lucide-react";
import type { SiteData } from "../../types";
import { Mandala } from "../decor/Mandala";
import { OrnamentDivider } from "../decor/Ornament";
import { Reveal } from "./Reveal";
import { downloadIcs, weddingIcsUrl } from "../../lib/api";
import { googleCalendarUrl } from "../../lib/calendar";
import { formatDateLong } from "../../lib/utils";

interface BlessingSectionProps {
  site: SiteData;
}

export function BlessingSection({ site }: BlessingSectionProps) {
  const { wedding, settings } = site;
  const [copied, setCopied] = useState(false);
  const brideSurname = wedding.brideName.split(/\s+/).slice(-1)[0] || "Bride";
  const groomSurname = wedding.groomName.split(/\s+/).slice(-1)[0] || "Groom";
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

  const share = async () => {
    const url = window.location.href;
    const text = settings.shareMessage || `${wedding.title} — we would love for you to celebrate with us.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: wedding.title, text, url });
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="paper-deep grain relative overflow-hidden py-24 text-center text-[#fff8ee] sm:py-32">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[54rem] w-[54rem] -translate-x-1/2 -translate-y-1/2 opacity-[0.14]">
        <Mandala className="h-full w-full text-[#e8cf9b] animate-spin-slow" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d8bd83]/60 to-transparent" />
      <div className="container-rb relative z-10">
        <Reveal>
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[#d8bd83]/45 text-[#e8cf9b]">
            <Heart className="h-6 w-6" />
          </div>
          <p className="kicker mt-6 text-[#d8bd83]">With Gratitude</p>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-[clamp(2.5rem,6vw,5.2rem)] leading-[0.98] text-[#fff8ee]">
            Your blessings are the
            <span className="script block text-[#e8cf9b]">greatest gift</span>
          </h2>
          <OrnamentDivider className="mt-7 text-[#d8bd83]" />
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-[0.9rem] font-light leading-relaxed text-[#f7e6c2]/[0.68]">
            With folded hands and full hearts, we thank you for being part of our story. Your presence, prayers, and
            love will make our celebration complete.
          </p>
          <p className="mt-8 font-display text-2xl text-[#f7e6c2]/85">
            The {brideSurname} & {groomSurname} Families
          </p>
          <p className="mt-2 text-[0.55rem] uppercase tracking-[0.35em] text-[#d8bd83]">
            {formatDateLong(wedding.weddingDate, wedding.timezone)}
          </p>
        </Reveal>

        <Reveal delay={0.16} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {calendarEntry ? (
            <a href={googleCalendarUrl(calendarEntry)} target="_blank" rel="noreferrer" className="btn btn-gold">
              <CalendarPlus className="h-4 w-4" />
              Add to Google Calendar
            </a>
          ) : null}
          <button type="button" onClick={() => downloadIcs(weddingIcsUrl())} className="btn btn-outline-light">
            Download .ics
          </button>
          <button type="button" onClick={share} className="btn btn-outline-light">
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {copied ? "Link copied" : "Share the invitation"}
          </button>
        </Reveal>

        <Reveal delay={0.24} className="mt-14">
          <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
            <span className="script text-3xl text-[#e8cf9b]">{wedding.coupleInitials || `${wedding.groomName[0] ?? ""} & ${wedding.brideName[0] ?? ""}`}</span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 text-[0.52rem] uppercase tracking-[0.3em] text-[#f7e6c2]/55 transition hover:text-[#e8cf9b]"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              Back to the beginning
            </button>
          </div>
        </Reveal>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d8bd83]/40 to-transparent" />
    </section>
  );
}
