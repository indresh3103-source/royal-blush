import { CalendarPlus, Clock3, Download, MapPin, Shirt, Sparkles } from "lucide-react";
import type { SiteData, WeddingEvent } from "../../types";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { googleCalendarUrl } from "../../lib/calendar";
import { downloadIcs, eventIcsUrl, weddingIcsUrl } from "../../lib/api";
import { formatDay, formatMonth, formatTimeRange, formatWeekday } from "../../lib/utils";

interface EventsSectionProps {
  site: SiteData;
}

function EventCard({ event, weddingTitle, timezone }: { event: WeddingEvent; weddingTitle: string; timezone: string }) {
  const location = [event.venueName, event.venueAddress, event.city, event.state].filter(Boolean).join(", ");
  const calendarEntry =
    event.startsAt && event.endsAt
      ? {
          title: `${event.name} · ${weddingTitle}`,
          description: event.description,
          location,
          startIso: event.startsAt,
          endIso: event.endsAt,
          timezone: event.timezone || timezone
        }
      : null;
  const hasDetails = Boolean(event.parkingInfo || event.contactName || event.contactPhone);

  return (
    <article className="lift group flex h-full flex-col overflow-hidden rounded-sm border border-royal-primary/25 bg-[#fbf7ef] shadow-[0_28px_60px_-46px_rgba(73,55,47,0.6)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-royal-deep/10">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.name}
            className="h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_50%_40%,#d8bd83,#762f43)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2f0e18]/65 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-[#e8cf9b]/35 bg-[#2f0e18]/55 px-3 py-1 text-[0.5rem] uppercase tracking-[0.24em] text-[#f7e6c2] backdrop-blur-sm">
          <Clock3 className="h-3 w-3" />
          {formatTimeRange(event.startTime, event.endTime)}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-display text-[1.65rem] leading-tight text-royal-deep sm:text-3xl">{event.name}</h3>
        {event.description ? (
          <p className="mt-2 line-clamp-3 text-[0.78rem] font-light leading-relaxed text-royal-ink/[0.62]">{event.description}</p>
        ) : null}
        <div className="mt-4 space-y-2 text-[0.72rem] text-royal-ink/70">
          {event.venueName ? (
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-royal-primary" />
              <span>
                {event.venueName}
                {event.city ? <span className="block text-royal-ink/45">{event.city}</span> : null}
              </span>
            </p>
          ) : null}
          {event.dressCode ? (
            <p className="flex items-start gap-2">
              <Shirt className="mt-0.5 h-3.5 w-3.5 shrink-0 text-royal-primary" />
              <span>{event.dressCode}</span>
            </p>
          ) : null}
        </div>

        {hasDetails ? (
          <details className="mt-4 border-t border-royal-primary/15 pt-3 text-[0.7rem] text-royal-ink/60">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-[0.52rem] uppercase tracking-[0.22em] text-royal-primary">
              <Sparkles className="h-3 w-3" />
              Good to know
            </summary>
            <div className="mt-3 space-y-1.5">
              {event.parkingInfo ? <p>{event.parkingInfo}</p> : null}
              {event.contactName ? (
                <p>
                  Contact: {event.contactName}
                  {event.contactPhone ? ` · ${event.contactPhone}` : ""}
                </p>
              ) : null}
            </div>
          </details>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
          {event.mapsUrl ? (
            <a
              href={event.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[0.52rem] uppercase tracking-[0.2em] text-royal-deep transition hover:text-royal-primary"
            >
              <MapPin className="h-3.5 w-3.5" />
              Directions
            </a>
          ) : null}
          {calendarEntry ? (
            <>
              <a
                href={googleCalendarUrl(calendarEntry)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[0.52rem] uppercase tracking-[0.2em] text-royal-deep transition hover:text-royal-primary"
              >
                <CalendarPlus className="h-3.5 w-3.5" />
                Google
              </a>
              <button
                type="button"
                onClick={() => downloadIcs(eventIcsUrl(event.id), `${event.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`)}
                className="inline-flex items-center gap-1.5 text-[0.52rem] uppercase tracking-[0.2em] text-royal-deep transition hover:text-royal-primary"
              >
                <Download className="h-3.5 w-3.5" />
                .ics
              </button>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function EventsSection({ site }: EventsSectionProps) {
  const { events, wedding, theme } = site;
  const grouped = events.reduce<Map<string, WeddingEvent[]>>((map, event) => {
    const list = map.get(event.eventDate) ?? [];
    list.push(event);
    map.set(event.eventDate, list);
    return map;
  }, new Map());
  const groups = Array.from(grouped.entries()).sort(([left], [right]) => left.localeCompare(right));

  return (
    <section className="paper grain relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-royal-accent/20 blur-3xl" />
      <div className="container-rb relative z-10">
        <SectionHeading
          kicker="The Celebrations"
          title="Days of joy, music & blessings"
          description="From the first tilak to the last dance, we would be honoured to have you beside us for every moment."
          ornament={theme.ornamentStyle as "classic" | "floral" | "minimal"}
        />

        <div className="mt-14 space-y-12">
          {groups.map(([date, dayEvents], groupIndex) => (
            <Reveal key={date} delay={groupIndex * 0.03}>
              <div className="grid gap-6 lg:grid-cols-[11rem_1fr] lg:gap-10">
                <div className="flex items-center gap-4 lg:sticky lg:top-28 lg:block lg:self-start lg:pt-2">
                  <div className="flex items-baseline gap-2 lg:block">
                    <span className="font-display text-5xl leading-none text-royal-deep sm:text-6xl">{formatDay(date, wedding.timezone)}</span>
                    <div className="lg:mt-2">
                      <p className="text-[0.58rem] uppercase tracking-[0.34em] text-royal-primary">{formatMonth(date, wedding.timezone)}</p>
                      <p className="text-[0.52rem] uppercase tracking-[0.24em] text-royal-ink/45">{formatWeekday(date, wedding.timezone)}</p>
                    </div>
                  </div>
                  <span className="h-px flex-1 bg-royal-primary/25 lg:mt-4 lg:block lg:w-14" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {dayEvents.map((event) => (
                    <EventCard key={event.id} event={event} weddingTitle={wedding.title} timezone={wedding.timezone} />
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {!events.length ? <p className="mt-12 text-center text-sm italic text-royal-ink/50">Event details coming soon.</p> : null}

        <Reveal className="mt-12 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => downloadIcs(weddingIcsUrl())} className="btn btn-outline">
            <Download className="h-4 w-4" />
            Download wedding calendar
          </button>
        </Reveal>
      </div>
    </section>
  );
}
