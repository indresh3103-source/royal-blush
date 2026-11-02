import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X, Heart } from "lucide-react";
import type { InvitationSection, InvitationSettingsPublic, Wedding } from "../../types";
import { Monogram } from "../decor/Ornament";
import { cn } from "../../lib/utils";

interface NavigationProps {
  wedding: Wedding;
  sections: InvitationSection[];
  settings: InvitationSettingsPublic;
}

export function Navigation({ wedding, sections, settings }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const links = sections.filter((section) => section.visible && section.key !== "opening");
  const initials = wedding.coupleInitials || `${wedding.groomName[0] ?? ""} & ${wedding.brideName[0] ?? ""}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goTo = (key: string) => {
    setOpen(false);
    window.setTimeout(() => {
      document.getElementById(key)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }, 80);
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-700",
          scrolled ? "border-b border-royal-primary/20 bg-[#fbf7ef]/[0.92] py-2 shadow-[0_18px_50px_-38px_rgba(73,55,47,0.7)] backdrop-blur-xl" : "bg-transparent py-4"
        )}
      >
        <div className="container-rb flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })}
            className={cn("group flex items-center gap-3", scrolled ? "text-royal-deep" : "text-[#fff7ed]")}
            aria-label="Return to the top of the invitation"
          >
            <Monogram initials={initials} className="h-11 w-11 text-current" />
            <span className="hidden text-left sm:block">
              <span className="block font-display text-lg leading-none tracking-[0.08em]">{wedding.title}</span>
              <span className={cn("mt-1 block text-[0.54rem] uppercase tracking-[0.32em]", scrolled ? "text-royal-primary" : "text-[#e8cf9b]")}>
                The Wedding
              </span>
            </span>
          </button>
          <div className="flex items-center gap-2">
            {settings.rsvpEnabled ? (
              <button
                type="button"
                onClick={() => goTo("rsvp")}
                className={cn("btn hidden min-h-10 px-5 py-2 sm:inline-flex", scrolled ? "btn-deep" : "btn-outline-light")}
              >
                <Heart className="h-3.5 w-3.5" />
                RSVP
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={cn(
                "grid h-11 w-11 place-items-center rounded-full border transition",
                scrolled
                  ? "border-royal-primary/40 text-royal-deep hover:bg-royal-primary/10"
                  : "border-white/30 text-[#fff7ed] hover:bg-white/10"
              )}
              aria-label="Open the invitation menu"
              aria-expanded={open}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[80]"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.35 }}
            role="dialog"
            aria-modal="true"
            aria-label="Invitation navigation"
          >
            <button
              type="button"
              className="absolute inset-0 h-full w-full cursor-default bg-[#2e0d18]/70 backdrop-blur-md"
              onClick={() => setOpen(false)}
              aria-label="Close the invitation menu"
            />
            <motion.div
              className="paper grain absolute right-0 top-0 flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-royal-primary/30 px-7 py-7 sm:px-12"
              initial={reduce ? false : { x: "100%" }}
              animate={{ x: 0 }}
              exit={reduce ? undefined : { x: "100%" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="kicker">The Invitation</p>
                  <p className="mt-2 font-display text-2xl text-royal-deep">{wedding.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-11 w-11 place-items-center rounded-full border border-royal-primary/40 text-royal-deep transition hover:bg-royal-primary/10"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="my-8 h-px bg-gradient-to-r from-transparent via-royal-primary/50 to-transparent" />
              <nav aria-label="Invitation sections" className="flex flex-col">
                {links.map((section, index) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => goTo(section.key)}
                    className="group flex items-baseline justify-between border-b border-royal-primary/15 py-3 text-left transition hover:border-royal-primary/50"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="w-7 text-[0.58rem] tracking-[0.2em] text-royal-primary">{String(index + 1).padStart(2, "0")}</span>
                      <span className="font-display text-[1.65rem] leading-tight text-royal-ink transition group-hover:text-royal-deep sm:text-3xl">
                        {section.label}
                      </span>
                    </span>
                    <span className="text-royal-primary opacity-0 transition group-hover:opacity-100">â†’</span>
                  </button>
                ))}
              </nav>
              <div className="mt-auto pt-10">
                {settings.rsvpEnabled ? (
                  <button type="button" onClick={() => goTo("rsvp")} className="btn btn-deep w-full">
                    <Heart className="h-4 w-4" />
                    Respond to the Invitation
                  </button>
                ) : null}
                <p className="mt-5 text-center text-[0.6rem] uppercase tracking-[0.28em] text-royal-primary">
                  {wedding.city ? `${wedding.city} · ` : ""}
                  {new Date(`${wedding.weddingDate}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
