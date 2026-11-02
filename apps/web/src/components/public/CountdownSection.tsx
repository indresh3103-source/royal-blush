import { CalendarPlus, Clock3, Heart } from "lucide-react";
import type { SiteData } from "../../types";
import { useCountdown } from "../../hooks/useCountdown";
import { Mandala } from "../decor/Mandala";
import { OrnamentDivider } from "../decor/Ornament";
import { Reveal } from "./Reveal";
import { googleCalendarUrl } from "../../lib/calendar";
import { downloadIcs, weddingIcsUrl } from "../../lib/api";
import { formatDateLong, formatTime } from "../../lib/utils";

interface CountdownSectionProps {
  site: SiteData;
}

export function CountdownSection({ site }: CountdownSectionProps) {
  const { wedding, countdown, theme } = site;
  const value = useCountdown(countdown.targetIso, site.serverTime);
  const calendarEntry =
    wedding.startsAt && wedding.endsAt
      ? {
          title: wedding.title,
          description: wedding.invitationMessage,
          location: [wedding.venueName, wedding.venueAddress, wedding.city, wedding.state].filter(Boolean).join(", "),
          startIso: wedding.startsAt,
          endIso: wedding.endsAt,
          timezone: wedding.timezone
        }
      : null;
  const units = [
    { label: "Days", value: value.days },
    { label: "Hours", value: value.hours },
    { label: "Minutes", value: value.minutes },
    { label: "Seconds", value: value.seconds }
  ];

  return (
    <section className="paper-deep grain relative overflow-hidden py-20 text-[#fff8ee] sm:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[52rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 opacity-[0.13]">
        <Mandala className="h-full w-full text-[#e8cf9b] animate-spin-slow" />
      </div>
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-royal-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-royal-primary/20 blur-3xl" />
      <div className="container-rb relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <p className="kicker text-[#d8bd83]">The Countdown Begins</p>
            <h2 className="section-title section-title-light mt-4">
              {value.expired ? "Today is the day" : `Counting down to ${countdown.label}`}
            </h2>
            <OrnamentDivider className="mt-6 text-[#d8bd83]" variant={theme.ornamentStyle as "classic" | "floral" | "minimal"} />
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.58rem] uppercase tracking-[0.28em] text-[#f7e6c2]/65">
              <Clock3 className="h-3.5 w-3.5 text-[#d8bd83]" />
              {formatDateLong(countdown.date, countdown.timezone)} · {formatTime(countdown.time)}
              <span className="text-[#d8bd83]/50">{countdown.timezone.replace("_", " ")}</span>
            </p>
          </Reveal>

          {value.expired ? (
            <Reveal delay={0.18} className="mt-10">
              <div className="mx-auto flex max-w-xl flex-col items-center">
                <Heart className="h-10 w-10 text-[#e8cf9b]" />
                <p className="mt-4 font-display text-2xl text-[#f7e6c2]">The sacred vows have been spoken.</p>
                <p className="mt-2 text-sm text-[#f7e6c2]/60">Thank you for being part of our forever.</p>
              </div>
            </Reveal>
          ) : (
            <div className="mt-10 grid grid-cols-4 gap-2 sm:gap-5">
              {units.map((unit, index) => (
                <Reveal key={unit.label} delay={0.12 + index * 0.06}>
                  <div className="relative overflow-hidden rounded-sm border border-[#d8bd83]/30 bg-white/[0.045] px-1 py-5 backdrop-blur-sm sm:px-4 sm:py-7">
                    <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-[#d8bd83]/60 to-transparent" />
                    <p className="font-display text-[clamp(1.9rem,7vw,4.2rem)] leading-none tabular-nums text-[#fff8ee]">
                      {String(unit.value).padStart(2, "0")}
                    </p>
                    <p className="mt-2 text-[0.45rem] uppercase tracking-[0.3em] text-[#d8bd83] sm:text-[0.55rem]">
                      {unit.label}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          )}

          {calendarEntry ? (
            <Reveal delay={0.35} className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <a
                href={googleCalendarUrl(calendarEntry)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-gold"
              >
                <CalendarPlus className="h-4 w-4" />
                Add to Google Calendar
              </a>
              <button type="button" onClick={() => downloadIcs(weddingIcsUrl())} className="btn btn-outline-light">
                Download .ics
              </button>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
