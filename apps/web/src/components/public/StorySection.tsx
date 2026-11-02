import type { SiteData } from "../../types";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { cn, formatDateMedium } from "../../lib/utils";

interface StorySectionProps {
  site: SiteData;
}

export function StorySection({ site }: StorySectionProps) {
  const { story, theme } = site;

  return (
    <section className="relative overflow-hidden bg-[#fbf7ef] py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px bg-gradient-to-b from-transparent via-royal-primary/25 to-transparent md:block" />
      <div className="container-rb relative z-10">
        <SectionHeading
          kicker="Our Story"
          title="Every moment led us here"
          description="From a chance meeting to a lifetime of promises, these are the chapters that brought our two worlds together."
          ornament={theme.ornamentStyle as "classic" | "floral" | "minimal"}
        />

        <div className="mt-16 space-y-14 md:space-y-0">
          {story.map((moment, index) => {
            const left = index % 2 === 0;
            return (
              <Reveal key={moment.id} className="relative md:grid md:grid-cols-2 md:items-center md:gap-16 md:py-10">
                <div className={cn("relative", left ? "md:pr-12 md:text-right" : "md:order-2 md:pl-12")}>
                  <div className="relative overflow-hidden rounded-sm border border-royal-primary/25 bg-royal-primary/5 shadow-[0_30px_60px_-40px_rgba(73,55,47,0.55)]">
                    {moment.imageUrl ? (
                      <img
                        src={moment.imageUrl}
                        alt={moment.title}
                        className="aspect-[4/3] w-full object-cover transition duration-700 hover:scale-[1.03]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="aspect-[4/3] w-full bg-[radial-gradient(circle_at_50%_40%,#e9bfc7,#b89555)]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3d1020]/45 via-transparent to-transparent" />
                    {moment.momentDate ? (
                      <span className="absolute bottom-4 left-4 rounded-full border border-[#e8cf9b]/40 bg-[#2f0e18]/55 px-3 py-1 text-[0.52rem] uppercase tracking-[0.24em] text-[#f7e6c2] backdrop-blur-sm">
                        {formatDateMedium(moment.momentDate)}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className={cn("relative mt-6 md:mt-0", left ? "md:pl-12" : "md:order-1 md:pr-12 md:text-right")}>
                  <div className="flex items-center gap-3 md:justify-start">
                    <span className="font-display text-5xl leading-none text-royal-primary/25">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="h-px flex-1 bg-royal-primary/25 md:hidden" />
                  </div>
                  <h3 className="mt-3 font-display text-[1.9rem] leading-tight text-royal-deep sm:text-4xl">{moment.title}</h3>
                  {moment.momentDate ? (
                    <p className="mt-2 text-[0.55rem] uppercase tracking-[0.3em] text-royal-primary">
                      {formatDateMedium(moment.momentDate)}
                    </p>
                  ) : null}
                  {moment.description ? (
                    <p className="lede mt-4 max-w-md text-pretty md:inline-block">{moment.description}</p>
                  ) : null}
                </div>

                <span
                  className="absolute left-1/2 top-1/2 hidden h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-royal-primary bg-[#fbf7ef] md:block"
                  aria-hidden="true"
                >
                  <span className="absolute inset-1 bg-royal-primary/60" />
                </span>
              </Reveal>
            );
          })}
        </div>

        {!story.length ? (
          <p className="mt-12 text-center text-sm italic text-royal-ink/50">Our story is being written.</p>
        ) : null}
      </div>
    </section>
  );
}
