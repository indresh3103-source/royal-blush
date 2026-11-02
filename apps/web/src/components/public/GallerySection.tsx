import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { GalleryImage, SiteData } from "../../types";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { cn } from "../../lib/utils";

interface GallerySectionProps {
  site: SiteData;
}

const labels: Record<string, string> = {
  couple: "The Couple",
  bride: "The Bride",
  groom: "The Groom",
  family: "Family",
  engagement: "Engagement",
  prewedding: "Pre-Wedding",
  wedding: "The Wedding",
  other: "Moments"
};

function editorialClass(index: number) {
  const pattern = [
    "sm:col-span-2 sm:row-span-2",
    "sm:col-span-2",
    "sm:col-span-2 sm:row-span-2",
    "",
    "",
    "sm:col-span-2",
    "",
    "sm:col-span-2 sm:row-span-2",
    "sm:col-span-2",
    ""
  ];
  return pattern[index % pattern.length] ?? "";
}

export function GallerySection({ site }: GallerySectionProps) {
  const { gallery, theme, wedding } = site;
  const reduce = useReducedMotion();
  const sections = useMemo(() => Array.from(new Set(gallery.map((image) => image.section))), [gallery]);
  const [filter, setFilter] = useState<string>("all");
  const [active, setActive] = useState<number | null>(null);
  const images = useMemo(
    () => (filter === "all" ? gallery : gallery.filter((image) => image.section === filter)),
    [filter, gallery]
  );

  useEffect(() => {
    if (active === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight") setActive((value) => (value === null ? null : (value + 1) % images.length));
      if (event.key === "ArrowLeft") setActive((value) => (value === null ? null : (value - 1 + images.length) % images.length));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [active, images.length]);

  const current = active === null ? null : images[active] ?? null;
  const layout = theme.galleryLayout;

  const tile = (image: GalleryImage, index: number, className?: string) => (
    <button
      key={image.id}
      type="button"
      onClick={() => setActive(index)}
      className={cn(
        "group relative block w-full overflow-hidden rounded-sm border border-royal-primary/20 bg-royal-deep/5 text-left",
        className
      )}
      aria-label={`Open photograph: ${image.caption || image.altText || "gallery image"}`}
    >
      <img
        src={image.url}
        alt={image.altText || image.caption || `${wedding.title} gallery photograph`}
        className={cn(
          "w-full object-cover transition duration-[900ms] group-hover:scale-[1.04]",
          layout === "masonry" ? "h-auto" : "h-full min-h-full"
        )}
        loading="lazy"
        width={image.width ?? undefined}
        height={image.height ?? undefined}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#2f0e18]/65 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 opacity-0 transition duration-500 group-hover:opacity-100">
        <div>
          <p className="text-[0.48rem] uppercase tracking-[0.28em] text-[#e8cf9b]">{labels[image.section] ?? image.section}</p>
          {image.caption ? <p className="mt-1 font-display text-lg leading-tight text-[#fff8ee]">{image.caption}</p> : null}
        </div>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/30 text-[#fff8ee]">
          <Expand className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );

  return (
    <section className="paper grain relative overflow-hidden py-20 sm:py-28">
      <div className="container-rb relative z-10">
        <SectionHeading
          kicker="The Gallery"
          title="Moments we will treasure"
          description="A few glimpses of the laughter, colour, and quiet love that surround our story."
          ornament={theme.ornamentStyle as "classic" | "floral" | "minimal"}
        />

        {sections.length > 1 ? (
          <Reveal className="mt-8 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={cn(
                "rounded-full border px-4 py-2 text-[0.52rem] uppercase tracking-[0.2em] transition",
                filter === "all"
                  ? "border-royal-deep bg-royal-deep text-[#fff8ee]"
                  : "border-royal-primary/35 text-royal-ink/65 hover:border-royal-primary hover:text-royal-deep"
              )}
            >
              All Moments
            </button>
            {sections.map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => setFilter(section)}
                className={cn(
                  "rounded-full border px-4 py-2 text-[0.52rem] uppercase tracking-[0.2em] transition",
                  filter === section
                    ? "border-royal-deep bg-royal-deep text-[#fff8ee]"
                    : "border-royal-primary/35 text-royal-ink/65 hover:border-royal-primary hover:text-royal-deep"
                )}
              >
                {labels[section] ?? section}
              </button>
            ))}
          </Reveal>
        ) : null}

        <div className="mt-10">
          {layout === "masonry" ? (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {images.map((image, index) => (
                <div key={image.id} className="mb-4 break-inside-avoid">
                  {tile(image, index)}
                </div>
              ))}
            </div>
          ) : layout === "grid" ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {images.map((image, index) => (
                <div key={image.id} className="aspect-[4/5]">
                  {tile(image, index, "h-full")}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid auto-rows-[10rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] sm:grid-cols-4 sm:gap-4">
              {images.map((image, index) => tile(image, index, editorialClass(index)))}
            </div>
          )}
        </div>

        {!images.length ? (
          <p className="mt-10 text-center text-sm italic text-royal-ink/50">Photographs from our celebrations will appear here.</p>
        ) : null}
      </div>

      <AnimatePresence>
        {current ? (
          <motion.div
            className="fixed inset-0 z-[90] flex flex-col bg-[#1e0810]/[0.96] backdrop-blur-md"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Gallery image viewer"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-[#fff8ee] sm:px-6">
              <p className="text-[0.55rem] uppercase tracking-[0.28em] text-[#e8cf9b]">
                {labels[current.section] ?? current.section}
                {active !== null ? <span className="ml-3 text-white/40">{String(active + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span> : null}
              </p>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/20 transition hover:bg-white/10"
                aria-label="Close gallery viewer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4 sm:p-10" onClick={() => setActive(null)}>
              <motion.img
                key={current.id}
                src={current.url}
                alt={current.altText || current.caption || "Wedding photograph"}
                className="max-h-full max-w-full rounded-sm object-contain shadow-2xl"
                initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                onClick={(event) => event.stopPropagation()}
              />
              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setActive((value) => (value === null ? null : (value - 1 + images.length) % images.length));
                    }}
                    className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/30 text-white transition hover:bg-white/15 sm:left-5"
                    aria-label="Previous photograph"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setActive((value) => (value === null ? null : (value + 1) % images.length));
                    }}
                    className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/30 text-white transition hover:bg-white/15 sm:right-5"
                    aria-label="Next photograph"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>
            {current.caption ? (
              <div className="border-t border-white/10 px-6 py-4 text-center">
                <p className="font-display text-xl text-[#fff8ee]">{current.caption}</p>
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
