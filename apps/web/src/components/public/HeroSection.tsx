import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, CalendarDays, MapPin } from "lucide-react";
import type { SiteData } from "../../types";
import { OrnamentDivider } from "../decor/Ornament";
import { formatDateLong, formatTime } from "../../lib/utils";

interface HeroSectionProps {
  site: SiteData;
}

export function HeroSection({ site }: HeroSectionProps) {
  const { wedding, settings } = site;
  const reduce = useReducedMotion();
  const groom = wedding.groomShortName || wedding.groomName;
  const bride = wedding.brideShortName || wedding.brideName;
  const initials = wedding.coupleInitials || `${wedding.groomName[0] ?? ""} & ${wedding.brideName[0] ?? ""}`;
  const image = wedding.heroImageUrl;

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-royal-deep">
      <motion.div
        className="absolute inset-0"
        initial={reduce ? false : { scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {image ? (
          <img
            src={image}
            alt={`${wedding.groomName} and ${wedding.brideName}`}
            className="h-full w-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_50%_30%,#9d4a5f,#762f43_45%,#3d1020)]" />
        )}
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(32,8,16,0.62)_0%,rgba(32,8,16,0.18)_34%,rgba(32,8,16,0.28)_58%,rgba(32,8,16,0.82)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_28%,rgba(27,7,14,0.5)_100%)]" />

      <div className="pointer-events-none absolute inset-4 z-10 border border-[#e8cf9b]/25 sm:inset-7">
        <div className="absolute -left-px -top-px h-12 w-12 border-l border-t border-[#e8cf9b]/70" />
        <div className="absolute -right-px -top-px h-12 w-12 border-r border-t border-[#e8cf9b]/70" />
        <div className="absolute -bottom-px -left-px h-12 w-12 border-b border-l border-[#e8cf9b]/70" />
        <div className="absolute -bottom-px -right-px h-12 w-12 border-b border-r border-[#e8cf9b]/70" />
      </div>

      <div className="pointer-events-none absolute left-7 top-1/2 z-10 hidden -translate-y-1/2 xl:block">
        <span className="writing-vertical text-[0.52rem] uppercase tracking-[0.55em] text-[#e8cf9b]/70">
          {initials} · {wedding.city ?? "India"}
        </span>
      </div>
      <div className="pointer-events-none absolute right-7 top-1/2 z-10 hidden -translate-y-1/2 xl:block">
        <span className="writing-vertical rotate-180 text-[0.52rem] uppercase tracking-[0.55em] text-[#e8cf9b]/70">
          {formatDateLong(wedding.weddingDate, wedding.timezone)}
        </span>
      </div>

      <div className="container-rb relative z-20 flex flex-col items-center pb-24 pt-28 text-center sm:pb-28 sm:pt-32">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center gap-4 text-[#e8cf9b]">
            <span className="h-px w-8 bg-current opacity-50 sm:w-14" />
            <span className="text-[0.55rem] uppercase tracking-[0.45em] sm:text-[0.62rem]">
              Together with our families
            </span>
            <span className="h-px w-8 bg-current opacity-50 sm:w-14" />
          </div>

          <h1 className="mt-6 font-display font-light leading-[0.84] text-[#fff8ee] text-shadow-soft sm:mt-8">
            <span className="block text-[clamp(3.4rem,11vw,8.5rem)]">{groom}</span>
            <span className="script my-1 block text-[clamp(2.3rem,6vw,4.5rem)] text-[#e8cf9b] sm:-my-2">&</span>
            <span className="block text-[clamp(3.4rem,11vw,8.5rem)]">{bride}</span>
          </h1>

          <OrnamentDivider className="mt-7 w-48 text-[#e8cf9b] sm:w-64" />

          {wedding.tagline ? (
            <p className="mt-5 max-w-xl font-display text-lg italic leading-relaxed text-[#f7e6c2]/85 sm:text-xl">
              {wedding.tagline}
            </p>
          ) : null}

          <div className="mt-7 flex flex-col items-center gap-2 text-[#fff8ee] sm:flex-row sm:gap-6">
            <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.25em] text-[#f7e6c2]/90">
              <CalendarDays className="h-3.5 w-3.5 text-[#e8cf9b]" />
              {formatDateLong(wedding.weddingDate, wedding.timezone)}
            </span>
            <span className="hidden h-3 w-px bg-[#e8cf9b]/40 sm:block" />
            <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.25em] text-[#f7e6c2]/90">
              <MapPin className="h-3.5 w-3.5 text-[#e8cf9b]" />
              {[wedding.venueName, wedding.city].filter(Boolean).join(" · ")}
            </span>
          </div>

          {wedding.invitationMessage ? (
            <p className="mt-6 max-w-2xl text-pretty text-[0.84rem] font-light leading-relaxed text-[#fff8ee]/[0.72] sm:text-sm">
              {wedding.invitationMessage}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={() => scrollTo("events")} className="btn btn-gold">
              View the Celebration
            </button>
            {settings.rsvpEnabled ? (
              <button type="button" onClick={() => scrollTo("rsvp")} className="btn btn-outline-light">
                RSVP
              </button>
            ) : null}
          </div>
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={() => scrollTo("ganesh")}
        className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-[#e8cf9b]/75 transition hover:text-[#e8cf9b]"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        aria-label="Scroll to the blessing"
      >
        <span className="text-[0.48rem] uppercase tracking-[0.4em]">Scroll</span>
        <span className="relative h-9 w-px overflow-hidden bg-[#e8cf9b]/30">
          <motion.span
            className="absolute left-0 top-0 h-4 w-px bg-[#e8cf9b]"
            animate={reduce ? undefined : { y: [0, 24, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
        <ArrowDown className="h-3 w-3" />
      </motion.button>

      <div className="absolute bottom-8 right-8 z-20 hidden items-center gap-3 text-[#e8cf9b]/65 sm:flex">
        <span className="text-[0.48rem] uppercase tracking-[0.3em]">{formatTime(wedding.weddingTime)}</span>
        <span className="h-px w-10 bg-current" />
        <span className="text-[0.48rem] uppercase tracking-[0.3em]">{wedding.timezone.replace("_", " ")}</span>
      </div>
    </section>
  );
}
