import {
  CircleDot,
  Flame,
  Flower2,
  HandHeart,
  HeartHandshake,
  Link2,
  RefreshCw,
  Sparkles
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SiteData } from "../../types";
import { Mandala } from "../decor/Mandala";
import { OrnamentDivider } from "../decor/Ornament";
import { Reveal } from "./Reveal";
import { downloadIcs, weddingIcsUrl } from "../../lib/api";
import { formatTime } from "../../lib/utils";

interface VivahSectionProps {
  site: SiteData;
}

const iconMap: Record<string, LucideIcon> = {
  ganesh: Sparkles,
  kanyadaan: HandHeart,
  varmala: Flower2,
  havan: Flame,
  phere: RefreshCw,
  sindoor: CircleDot,
  mangalsutra: Link2,
  ashirwad: HeartHandshake
};

export function VivahSection({ site }: VivahSectionProps) {
  const { wedding, rituals, settings, theme } = site;
  const image = settings.vivahImageUrl || wedding.venuePhotoUrl;

  return (
    <section className="paper-deep grain relative overflow-hidden py-20 text-[#fff8ee] sm:py-28">
      <div className="pointer-events-none absolute -right-48 top-0 h-[46rem] w-[46rem] opacity-[0.12]">
        <Mandala className="h-full w-full text-[#e8cf9b] animate-spin-reverse" />
      </div>
      <div className="container-rb relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-3 rounded-t-[12rem] border border-[#d8bd83]/35 sm:-inset-5" />
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-[11rem] rounded-b-sm bg-[#3d1020]">
              {image ? (
                <img src={image} alt={settings.vivahTitle} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="h-full w-full bg-[radial-gradient(circle_at_50%_40%,#9d4a5f,#4a1524)]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2f0e18]/75 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-center">
                <p className="text-[0.48rem] uppercase tracking-[0.38em] text-[#e8cf9b]">The Sacred Union</p>
                <p className="mt-2 font-display text-2xl text-[#fff8ee]">{settings.vivahTitle}</p>
              </div>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <p className="kicker text-[#d8bd83]">Vivah Sanskar</p>
              <h2 className="section-title section-title-light mt-4">{settings.vivahTitle}</h2>
              {settings.vivahMuhurat ? (
                <p className="mt-4 text-[0.58rem] uppercase tracking-[0.3em] text-[#d8bd83]">{settings.vivahMuhurat}</p>
              ) : null}
            </Reveal>
            <Reveal delay={0.1}>
              <OrnamentDivider
                variant={theme.ornamentStyle as "classic" | "floral" | "minimal"}
                className="mt-6 ml-0 mr-auto text-[#d8bd83]"
              />
            </Reveal>
            {settings.vivahDescription ? (
              <Reveal delay={0.16}>
                <p className="lede lede-light mt-6 max-w-xl text-pretty">{settings.vivahDescription}</p>
              </Reveal>
            ) : null}
            <Reveal delay={0.24} className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={() => downloadIcs(weddingIcsUrl())} className="btn btn-gold">
                Save the Ceremony
              </button>
              <a href="#venue" className="btn btn-outline-light">
                The Venue
              </a>
            </Reveal>
          </div>
        </div>

        <div className="mt-16">
          <Reveal>
            <div className="flex items-center gap-4">
              <span className="text-[0.55rem] uppercase tracking-[0.34em] text-[#d8bd83]">The Rituals</span>
              <span className="h-px flex-1 bg-gradient-to-r from-[#d8bd83]/50 to-transparent" />
              <span className="font-display text-lg text-[#f7e6c2]/60">{String(rituals.length).padStart(2, "0")} steps</span>
            </div>
          </Reveal>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rituals.map((ritual, index) => {
              const Icon = iconMap[ritual.icon ?? ""] ?? Sparkles;
              return (
                <Reveal key={ritual.id} delay={index * 0.04}>
                  <div className="group relative h-full overflow-hidden rounded-sm border border-[#d8bd83]/[0.22] bg-white/[0.04] p-5 backdrop-blur-sm transition duration-500 hover:border-[#d8bd83]/50 hover:bg-white/[0.07]">
                    <div className="flex items-start justify-between">
                      <span className="grid h-10 w-10 place-items-center rounded-full border border-[#d8bd83]/35 text-[#e8cf9b]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="font-display text-2xl text-[#d8bd83]/35">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="mt-4 font-display text-xl text-[#fff8ee]">{ritual.name}</h3>
                    {ritual.ritualTime ? (
                      <p className="mt-1 text-[0.48rem] uppercase tracking-[0.24em] text-[#d8bd83]">
                        {formatTime(ritual.ritualTime)}
                      </p>
                    ) : null}
                    {ritual.description ? (
                      <p className="mt-2 text-[0.72rem] font-light leading-relaxed text-[#f7e6c2]/60">{ritual.description}</p>
                    ) : null}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
