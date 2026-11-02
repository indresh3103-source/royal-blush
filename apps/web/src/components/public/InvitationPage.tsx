import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import { applyTheme } from "../../lib/theme";
import { formatDateMedium } from "../../lib/utils";
import type { SiteData } from "../../types";
import { MusicProvider, useMusic } from "./MusicProvider";
import { MusicPlayer } from "./MusicPlayer";
import { Navigation } from "./Navigation";
import { IntroCurtain } from "./IntroCurtain";
import { HeroSection } from "./HeroSection";
import { GaneshSection } from "./GaneshSection";
import { ProfileSection } from "./ProfileSection";
import { FamilySection } from "./FamilySection";
import { StorySection } from "./StorySection";
import { CountdownSection } from "./CountdownSection";
import { EventsSection } from "./EventsSection";
import { VivahSection } from "./VivahSection";
import { VenueSection } from "./VenueSection";
import { GallerySection } from "./GallerySection";
import { MusicSection } from "./MusicSection";
import { RsvpSection } from "./RsvpSection";
import { BlessingSection } from "./BlessingSection";
import { Footer } from "./Footer";
import { Mandala } from "../decor/Mandala";

function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  if (reduce) return null;
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-[#d8bd83] via-[#b89555] to-[#762f43]"
      style={{ scaleX }}
    />
  );
}

function InvitationExperience({ site }: { site: SiteData }) {
  const music = useMusic();
  const [showIntro, setShowIntro] = useState(false);
  const { wedding, settings, sections } = site;

  useEffect(() => {
    applyTheme(site.theme);
    document.title = `${wedding.title} · ${formatDateMedium(wedding.weddingDate, wedding.timezone)}`;
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute(
        "content",
        `${wedding.title} invite you to celebrate their wedding${wedding.city ? ` in ${wedding.city}` : ""}. ${settings.shareMessage ?? ""}`.trim()
      );
    }
  }, [site.theme, wedding, settings.shareMessage]);

  useEffect(() => {
    setShowIntro(settings.introEnabled && !window.location.hash);
  }, [settings.introEnabled, wedding.id]);

  useEffect(() => {
    if (!window.location.hash) return;
    const timer = window.setTimeout(() => {
      const target = document.querySelector(window.location.hash);
      target?.scrollIntoView({ block: "start" });
    }, 350);
    return () => window.clearTimeout(timer);
  }, []);

  const rendered = useMemo(() => {
    const components: Record<string, ReactNode> = {
      hero: <HeroSection site={site} />,
      ganesh: <GaneshSection wedding={wedding} theme={site.theme} />,
      bride: <ProfileSection site={site} person="bride" />,
      groom: <ProfileSection site={site} person="groom" />,
      family: <FamilySection site={site} />,
      story: <StorySection site={site} />,
      countdown: <CountdownSection site={site} />,
      events: <EventsSection site={site} />,
      vivah: <VivahSection site={site} />,
      venue: <VenueSection site={site} />,
      gallery: <GallerySection site={site} />,
      music: <MusicSection site={site} />,
      rsvp: <RsvpSection site={site} />,
      blessing: <BlessingSection site={site} />
    };
    return sections
      .filter((section) => section.visible && section.key !== "opening")
      .map((section) => {
        const content = components[section.key];
        if (!content) return null;
        return (
          <div key={section.id} id={section.key} className="scroll-mt-0">
            {content}
          </div>
        );
      });
  }, [sections, site, wedding]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <ScrollProgress />
      <a
        href="#hero"
        className="sr-only z-[120] rounded-full bg-royal-deep px-5 py-3 text-[#fff8ee] focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to the invitation
      </a>
      <Navigation wedding={wedding} sections={sections} settings={settings} />
      <main>{rendered}</main>
      <Footer site={site} />
      <MusicPlayer />
      {showIntro ? (
        <IntroCurtain
          wedding={wedding}
          theme={site.theme}
          onBegin={() => {
            if (settings.musicEnabled) music.play();
          }}
          onComplete={() => {
            setShowIntro(false);
          }}
        />
      ) : null}
    </div>
  );
}

export function InvitationPage() {
  const query = useQuery({
    queryKey: ["public-site"],
    queryFn: api.public.site,
    staleTime: 60_000,
    retry: 1
  });

  if (query.isLoading) {
    return (
      <div className="paper-deep relative grid min-h-screen place-items-center overflow-hidden px-6 text-center text-[#fff8ee]">
        <Mandala className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 text-[#d8bd83]/15 animate-spin-slow" />
        <div className="relative">
          <p className="text-[0.55rem] uppercase tracking-[0.45em] text-[#d8bd83]">Royal Blush</p>
          <p className="mt-4 font-display text-4xl sm:text-5xl">Preparing your invitation</p>
          <div className="mt-7 flex items-center justify-center gap-3 text-[#e8cf9b]">
            <span className="h-px w-12 bg-current opacity-40" />
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="h-px w-12 bg-current opacity-40" />
          </div>
        </div>
      </div>
    );
  }

  if (query.isError || !query.data) {
    const setup = query.error instanceof ApiError && query.error.code === "SETUP_REQUIRED";
    return (
      <div className="paper grain grid min-h-screen place-items-center px-6 py-16 text-center">
        <div className="max-w-md">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-royal-primary/40 text-royal-primary">
            <AlertCircle className="h-7 w-7" />
          </span>
          <h1 className="mt-6 font-display text-4xl text-royal-deep">
            {setup ? "The invitation is being prepared" : "We could not open the invitation"}
          </h1>
          <p className="mt-3 text-sm font-light leading-relaxed text-royal-ink/60">
            {setup
              ? "The wedding details have not been published yet. Please check back soon."
              : query.error instanceof ApiError
                ? query.error.message
                : "Please check your connection and try again."}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => query.refetch()} className="btn btn-deep">
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
            <a href="/admin" className="btn btn-outline">
              Admin
            </a>
          </div>
        </div>
      </div>
    );
  }

  const site = query.data;
  return (
    <MusicProvider
      tracks={site.music}
      initialTrackId={site.settings.activeMusicTrackId}
      initialVolume={site.settings.defaultVolume}
      enabled={site.settings.musicEnabled}
    >
      <InvitationExperience site={site} />
    </MusicProvider>
  );
}
