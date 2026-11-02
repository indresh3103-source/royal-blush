import type { ThemeSettings, Wedding } from "../../types";
import { Ganesh } from "../decor/Ganesh";
import { Mandala } from "../decor/Mandala";
import { OrnamentDivider } from "../decor/Ornament";
import { Reveal } from "./Reveal";

interface GaneshSectionProps {
  wedding: Wedding;
  theme: ThemeSettings;
}

export function GaneshSection({ wedding, theme }: GaneshSectionProps) {
  return (
    <section className="paper grain relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 opacity-[0.08]">
        <Mandala className="h-full w-full text-royal-deep animate-spin-slow" />
      </div>
      <div className="container-rb relative z-10 flex flex-col items-center text-center">
        <Reveal>
          <p className="deva text-lg text-royal-deep/80 sm:text-xl">॥ श्री गणेशाय नमः ॥</p>
        </Reveal>
        <Reveal delay={0.12} className="mt-5">
          <div className="relative mx-auto grid h-44 w-40 place-items-center sm:h-56 sm:w-52">
            <div className="absolute inset-0 rounded-full border border-royal-primary/25" />
            <div className="absolute inset-4 rounded-full border border-dashed border-royal-primary/25 animate-spin-reverse" />
            <Ganesh className="relative h-36 w-32 text-royal-deep/80 sm:h-44 sm:w-40" />
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="deva mx-auto mt-6 max-w-2xl text-[0.95rem] leading-[2.1] text-royal-ink/80 sm:text-lg">
            वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।
            <br />
            निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥
          </p>
        </Reveal>
        <Reveal delay={0.28} className="mt-5 max-w-xl">
          <p className="text-[0.78rem] font-light italic leading-relaxed text-royal-ink/55 sm:text-sm">
            We begin with an invocation to Lord Ganesh, the remover of obstacles, seeking his blessings for a union
            filled with love, harmony, and auspicious beginnings.
          </p>
        </Reveal>
        <Reveal delay={0.36}>
          <OrnamentDivider className="mt-7" variant={theme.ornamentStyle as "classic" | "floral" | "minimal"} />
        </Reveal>
        <Reveal delay={0.42}>
          <p className="mt-5 text-[0.55rem] uppercase tracking-[0.4em] text-royal-primary">
            {[wedding.city, wedding.state].filter(Boolean).join(", ")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
