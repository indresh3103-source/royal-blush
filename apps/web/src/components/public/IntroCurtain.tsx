import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ThemeSettings, Wedding } from "../../types";
import { Ganesh } from "../decor/Ganesh";
import { formatDateLong } from "../../lib/utils";

interface IntroCurtainProps {
  wedding: Wedding;
  theme: ThemeSettings;
  onBegin: () => void;
  onComplete: () => void;
}

type CurtainPalette = {
  base: string;
  light: string;
  dark: string;
  ink: string;
  muted: string;
  gold: string;
  backdrop: string;
  shadeTop: number;
  shadeBottom: number;
};

const curtainColors: Record<string, CurtainPalette> = {
  "blush-velvet": {
    base: "#8c3b50",
    light: "#a95468",
    dark: "#5f2234",
    ink: "#fff8ee",
    muted: "rgba(255, 248, 238, 0.68)",
    gold: "#e8cf9b",
    backdrop: "rgba(35, 8, 17, 0.5)",
    shadeTop: 0.55,
    shadeBottom: 0.62
  },
  "ivory-silk": {
    base: "#d8c3aa",
    light: "#ecdbc7",
    dark: "#b99c7c",
    ink: "#4a1524",
    muted: "rgba(74, 21, 36, 0.68)",
    gold: "#8a6a32",
    backdrop: "rgba(255, 248, 238, 0.46)",
    shadeTop: 0.16,
    shadeBottom: 0.26
  },
  "burgundy-velvet": {
    base: "#5b1b2c",
    light: "#7a2b3f",
    dark: "#3c0f1c",
    ink: "#fff8ee",
    muted: "rgba(255, 248, 238, 0.66)",
    gold: "#e8cf9b",
    backdrop: "rgba(24, 5, 11, 0.52)",
    shadeTop: 0.58,
    shadeBottom: 0.66
  }
};

type RoseTone = "blush" | "rose" | "cream" | "gold" | "wine";

const rosePalette: Record<RoseTone, { outer: string; mid: string; inner: string; heart: string }> = {
  blush: { outer: "#d79aa6", mid: "#f0c4cb", inner: "#fbe3e6", heart: "#b96f7e" },
  rose: { outer: "#a64f62", mid: "#cf8292", inner: "#ecc0c7", heart: "#7a2b3d" },
  cream: { outer: "#e7d2b4", mid: "#f6e8d2", inner: "#fff8ec", heart: "#c2a06b" },
  gold: { outer: "#c49a4c", mid: "#dfbd77", inner: "#f4dfae", heart: "#96712f" },
  wine: { outer: "#5f1f30", mid: "#8a3549", inner: "#b96375", heart: "#3f101d" }
};

function Rose({ tone, className = "" }: { tone: RoseTone; className?: string }) {
  const colors = rosePalette[tone];
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden="true">
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse
          key={`outer-${angle}`}
          cx="50"
          cy="27"
          rx="16"
          ry="24"
          fill={colors.outer}
          transform={`rotate(${angle} 50 50)`}
          opacity="0.96"
        />
      ))}
      {[30, 90, 150, 210, 270, 330].map((angle) => (
        <ellipse
          key={`mid-${angle}`}
          cx="50"
          cy="33"
          rx="13"
          ry="19"
          fill={colors.mid}
          transform={`rotate(${angle} 50 50)`}
          opacity="0.94"
        />
      ))}
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={`inner-${angle}`}
          cx="50"
          cy="39"
          rx="9.5"
          ry="14"
          fill={colors.inner}
          transform={`rotate(${angle} 50 50)`}
          opacity="0.92"
        />
      ))}
      <circle cx="50" cy="50" r="8.5" fill={colors.heart} />
      <path
        d="M50 43.5c6.5 0 10 4 10 8s-4.5 7.5-10 7.5-10-3.5-10-7.5 3.5-8 10-8Z"
        stroke={colors.inner}
        strokeWidth="1.4"
        opacity="0.6"
      />
      <path
        d="M50 47c4 0 6 2 6 4.2s-2.7 4.3-6 4.3-6-2-6-4.3S46 47 50 47Z"
        stroke={colors.outer}
        strokeWidth="1.2"
        opacity="0.85"
      />
    </svg>
  );
}

function Leaf({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 80" className={className} fill="none" aria-hidden="true">
      <path d="M20 2C35 18 38 46 20 78C2 46 5 18 20 2Z" fill="#4c6548" />
      <path d="M20 10V72" stroke="rgba(255,248,238,0.38)" strokeWidth="1.2" />
      <path d="M20 27C15 31 12 35 10 41M20 41C26 45 29 50 31 56" stroke="rgba(255,248,238,0.24)" strokeWidth="1" />
    </svg>
  );
}

const clusterRoses: Array<{ x: number; y: number; size: number; tone: RoseTone; rotate: number }> = [
  { x: 50, y: 52, size: 42, tone: "blush", rotate: -8 },
  { x: 28, y: 58, size: 30, tone: "rose", rotate: 14 },
  { x: 72, y: 56, size: 31, tone: "cream", rotate: -16 },
  { x: 38, y: 34, size: 24, tone: "blush", rotate: 22 },
  { x: 64, y: 33, size: 25, tone: "rose", rotate: -24 },
  { x: 16, y: 42, size: 20, tone: "gold", rotate: 8 },
  { x: 84, y: 44, size: 20, tone: "cream", rotate: -8 },
  { x: 50, y: 23, size: 19, tone: "gold", rotate: 4 },
  { x: 50, y: 78, size: 17, tone: "rose", rotate: -6 }
];

const clusterLeaves: Array<{ x: number; y: number; size: number; rotate: number }> = [
  { x: 50, y: 9, size: 16, rotate: -8 },
  { x: 18, y: 24, size: 14, rotate: -48 },
  { x: 82, y: 26, size: 14, rotate: 44 },
  { x: 8, y: 56, size: 12, rotate: -70 },
  { x: 92, y: 58, size: 12, rotate: 68 },
  { x: 32, y: 79, size: 13, rotate: -28 },
  { x: 68, y: 80, size: 13, rotate: 26 }
];

function RoseCluster({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      {clusterLeaves.map((leaf, index) => (
        <div
          key={`leaf-${index}`}
          className="absolute drop-shadow-[0_4px_6px_rgba(20,5,10,0.35)]"
          style={{
            left: `${leaf.x}%`,
            top: `${leaf.y}%`,
            width: `${leaf.size}%`,
            aspectRatio: "1 / 2",
            transform: `translate(-50%, -50%) rotate(${leaf.rotate}deg)`
          }}
        >
          <Leaf className="h-full w-full" />
        </div>
      ))}
      {clusterRoses.map((rose, index) => (
        <div
          key={`rose-${index}`}
          className="absolute drop-shadow-[0_6px_10px_rgba(20,5,10,0.42)]"
          style={{
            left: `${rose.x}%`,
            top: `${rose.y}%`,
            width: `${rose.size}%`,
            aspectRatio: "1 / 1",
            transform: `translate(-50%, -50%) rotate(${rose.rotate}deg)`
          }}
        >
          <Rose tone={rose.tone} className="h-full w-full" />
        </div>
      ))}
    </div>
  );
}

const cascadeRoses: Array<{ top: number; left: number; size: number; tone: RoseTone; rotate: number }> = [
  { top: 5, left: 52, size: 38, tone: "blush", rotate: -12 },
  { top: 17, left: 34, size: 27, tone: "cream", rotate: 18 },
  { top: 28, left: 64, size: 22, tone: "gold", rotate: -20 },
  { top: 38, left: 44, size: 33, tone: "rose", rotate: 10 },
  { top: 51, left: 62, size: 24, tone: "blush", rotate: -14 },
  { top: 61, left: 36, size: 29, tone: "cream", rotate: 16 },
  { top: 73, left: 56, size: 22, tone: "rose", rotate: -8 },
  { top: 84, left: 42, size: 19, tone: "gold", rotate: 12 }
];

const cascadeBuds: Array<{ top: number; left: number }> = [
  { top: 11, left: 70 },
  { top: 23, left: 50 },
  { top: 33, left: 28 },
  { top: 45, left: 70 },
  { top: 56, left: 24 },
  { top: 67, left: 70 },
  { top: 78, left: 26 },
  { top: 90, left: 62 }
];

function FlowerCascade({ side, delay }: { side: "left" | "right"; delay: number }) {
  return (
    <div
      className={`pointer-events-none absolute top-[5rem] z-30 h-[34vh] w-16 origin-top animate-sway sm:top-28 sm:w-20 ${
        side === "left" ? "left-1 sm:left-3" : "right-1 sm:right-3"
      }`}
      style={{ animationDelay: `${delay}s` }}
      aria-hidden="true"
    >
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-[#6f8560] via-[#4c6548]/70 to-transparent" />
      {cascadeBuds.map((bud, index) => (
        <span
          key={`bud-${index}`}
          className="absolute h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#f7ecd8] shadow-[0_0_5px_rgba(255,248,238,0.65)]"
          style={{ top: `${bud.top}%`, left: `${bud.left}%` }}
        />
      ))}
      {cascadeRoses.map((rose, index) => (
        <div
          key={`cascade-${index}`}
          className="absolute drop-shadow-[0_5px_8px_rgba(20,5,10,0.45)]"
          style={{
            top: `${rose.top}%`,
            left: `${rose.left}%`,
            width: `${rose.size}%`,
            aspectRatio: "1 / 1",
            transform: `translate(-50%, -50%) rotate(${rose.rotate}deg)`
          }}
        >
          <Rose tone={rose.tone} className="h-full w-full" />
        </div>
      ))}
    </div>
  );
}

const petals = Array.from({ length: 14 }, (_, index) => ({
  left: 4 + ((index * 29) % 92),
  delay: (index % 9) * 0.42,
  duration: 5.4 + (index % 5) * 0.7,
  size: 6 + (index % 4) * 3,
  tone: index % 5 === 0 ? "#f6e8d2" : index % 3 === 0 ? "#d79aa6" : "#f0c4cb"
}));

export function IntroCurtain({ wedding, theme, onBegin, onComplete }: IntroCurtainProps) {
  const [opening, setOpening] = useState(false);
  const reduce = useReducedMotion();
  const completeTimer = useRef<number | null>(null);
  const beginRef = useRef(onBegin);
  const completeRef = useRef(onComplete);
  beginRef.current = onBegin;
  completeRef.current = onComplete;

  const palette = curtainColors[theme.curtainStyle] ?? curtainColors["blush-velvet"];
  const panelShade = `linear-gradient(180deg, rgba(0,0,0,${palette.shadeTop}) 0%, transparent 18%, transparent 70%, rgba(0,0,0,${palette.shadeBottom}) 100%)`;
  const groom = wedding.groomShortName || wedding.groomName;
  const bride = wedding.brideShortName || wedding.brideName;

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtml = html.style.overflow;
    const previousBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = previousHtml;
      body.style.overflow = previousBody;
    };
  }, []);

  useEffect(() => {
    const hold = window.setTimeout(
      () => {
        setOpening(true);
        beginRef.current();
        completeTimer.current = window.setTimeout(() => completeRef.current(), reduce ? 520 : 2520);
      },
      reduce ? 450 : 2350
    );
    return () => {
      window.clearTimeout(hold);
      if (completeTimer.current) window.clearTimeout(completeTimer.current);
    };
  }, [reduce]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] overflow-hidden"
      data-intro="active"
      initial={{ opacity: 1 }}
      animate={{ opacity: opening ? 0 : 1 }}
      transition={{ duration: reduce ? 0.18 : 0.68, delay: opening ? (reduce ? 0 : 1.78) : 0, ease: "easeInOut" }}
      aria-hidden="true"
    >
      <div className="absolute inset-0" style={{ perspective: "1500px" }}>
        <motion.div
          className="absolute inset-y-0 left-0 z-20 w-[51%] overflow-hidden shadow-[40px_0_90px_rgba(20,4,10,0.45)] will-change-transform"
          style={{
            transformOrigin: "left center",
            backgroundImage: `linear-gradient(90deg, ${palette.dark} 0%, ${palette.base} 7%, ${palette.light} 15%, ${palette.base} 24%, ${palette.dark} 34%, ${palette.base} 44%, ${palette.light} 51%, ${palette.base} 60%, ${palette.dark} 70%, ${palette.base} 80%, ${palette.light} 88%, ${palette.base} 95%, ${palette.dark} 100%)`,
            backgroundSize: "9.5% 100%",
            backgroundRepeat: "repeat-x"
          }}
          animate={
            opening
              ? { x: ["0%", "-1.6%", "-5%", "-9%"], scaleX: [1, 0.84, 0.44, 0.12], rotateY: [0, -3, -7, -11] }
              : { x: "0%", scaleX: 1, rotateY: 0 }
          }
          transition={{
            duration: reduce ? 0.01 : 2.32,
            delay: reduce ? 0 : 0.12,
            ease: [0.68, 0, 0.24, 1],
            times: [0, 0.36, 0.72, 1]
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_28%_18%,rgba(255,255,255,0.16),transparent_56%)]" />
          <div className="absolute inset-0" style={{ backgroundImage: panelShade }} />
          <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/55 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-[3px] bg-gradient-to-b from-[#f2dfb3] via-[#b89555] to-[#8a6a32] opacity-80" />
          <div className="absolute inset-y-0 right-[3px] w-[2px] bg-[#5a3b1d]/60" />
        </motion.div>

        <motion.div
          className="absolute inset-y-0 right-0 z-20 w-[51%] overflow-hidden shadow-[-40px_0_90px_rgba(20,4,10,0.45)] will-change-transform"
          style={{
            transformOrigin: "right center",
            backgroundImage: `linear-gradient(90deg, ${palette.dark} 0%, ${palette.base} 6%, ${palette.light} 14%, ${palette.base} 23%, ${palette.dark} 33%, ${palette.base} 43%, ${palette.light} 50%, ${palette.base} 59%, ${palette.dark} 69%, ${palette.base} 79%, ${palette.light} 87%, ${palette.base} 94%, ${palette.dark} 100%)`,
            backgroundSize: "10.5% 100%",
            backgroundRepeat: "repeat-x"
          }}
          animate={
            opening
              ? { x: ["0%", "1.6%", "5%", "9%"], scaleX: [1, 0.84, 0.44, 0.12], rotateY: [0, 3, 7, 11] }
              : { x: "0%", scaleX: 1, rotateY: 0 }
          }
          transition={{
            duration: reduce ? 0.01 : 2.32,
            delay: reduce ? 0 : 0.12,
            ease: [0.68, 0, 0.24, 1],
            times: [0, 0.36, 0.72, 1]
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_18%,rgba(255,255,255,0.16),transparent_56%)]" />
          <div className="absolute inset-0" style={{ backgroundImage: panelShade }} />
          <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/55 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-[#f2dfb3] via-[#b89555] to-[#8a6a32] opacity-80" />
          <div className="absolute inset-y-0 left-[3px] w-[2px] bg-[#5a3b1d]/60" />
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(20,4,10,0.22)_100%)]" />

      {petals.map((petal, index) => (
        <span
          key={`petal-${index}`}
          className="animate-petal-fall pointer-events-none absolute top-0 z-40"
          style={{
            left: `${petal.left}%`,
            width: `${petal.size}px`,
            height: `${petal.size * 1.45}px`,
            backgroundColor: petal.tone,
            borderRadius: "62% 38% 55% 45% / 62% 45% 55% 38%",
            animationDelay: `${petal.delay}s`,
            animationDuration: `${petal.duration}s`,
            opacity: 0.75
          }}
        />
      ))}

      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 z-30"
        animate={opening ? { y: "-22%", opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: reduce ? 0.01 : 1.15, delay: reduce ? 0 : 0.55, ease: [0.65, 0, 0.25, 1] }}
      >
        <div className="absolute inset-x-0 top-0 h-2 bg-[linear-gradient(180deg,#f2dfb3,#b89555_55%,#6d4c22)] shadow-[0_6px_18px_rgba(0,0,0,0.45)]" />
        <div className="absolute left-0 top-0 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#f6e4b9,#b89555_60%,#7a5827)] shadow-[0_4px_10px_rgba(0,0,0,0.5)]" />
        <div className="absolute right-0 top-0 h-5 w-5 -translate-y-1/2 translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#f6e4b9,#b89555_60%,#7a5827)] shadow-[0_4px_10px_rgba(0,0,0,0.5)]" />

        <svg viewBox="0 0 1440 210" preserveAspectRatio="none" className="h-[92px] w-full drop-shadow-[0_18px_28px_rgba(20,4,10,0.5)] sm:h-[172px]">
          <defs>
            <linearGradient id="intro-valance-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette.dark} />
              <stop offset="42%" stopColor={palette.base} />
              <stop offset="78%" stopColor={palette.light} />
              <stop offset="100%" stopColor={palette.dark} />
            </linearGradient>
            <pattern id="intro-valance-pleats" width="54" height="210" patternUnits="userSpaceOnUse">
              <rect width="54" height="210" fill="url(#intro-valance-fill)" />
              <rect width="11" height="210" fill="rgba(0,0,0,0.24)" />
              <rect x="24" width="6" height="210" fill="rgba(255,255,255,0.1)" />
              <rect x="44" width="4" height="210" fill="rgba(0,0,0,0.14)" />
            </pattern>
          </defs>
          <path
            d="M0 0H1440V48Q1260 164 1080 48Q900 164 720 48Q540 164 360 48Q180 164 0 48Z"
            fill="url(#intro-valance-pleats)"
          />
          <path
            d="M0 48Q180 164 360 48Q540 164 720 48Q900 164 1080 48Q1260 164 1440 48"
            fill="none"
            stroke="#e8cf9b"
            strokeWidth="2.5"
            opacity="0.7"
          />
          <path
            d="M0 58Q180 174 360 58Q540 174 720 58Q900 174 1080 58Q1260 174 1440 58"
            fill="none"
            stroke="#b89555"
            strokeWidth="1"
            opacity="0.55"
          />
          <g stroke="#d8bd83" strokeWidth="2" opacity="0.6">
            {Array.from({ length: 48 }).map((_, index) => (
              <line key={`fringe-${index}`} x1={index * 30 + 15} y1={index % 4 === 0 ? 118 : 104} x2={index * 30 + 15} y2={index % 4 === 0 ? 138 : 120} />
            ))}
          </g>
        </svg>

        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="absolute inset-x-0 top-6 h-12 w-full opacity-45 sm:top-10 sm:h-20" aria-hidden="true">
          <path d="M-20 74C200 22 420 16 700 52C980 16 1220 22 1460 74" fill="none" stroke="#4c6548" strokeWidth="4" strokeLinecap="round" />
        </svg>

        <RoseCluster className="absolute -left-8 top-0 aspect-[5/3] w-36 sm:-left-2 sm:top-2 sm:w-72" />
        <RoseCluster className="absolute left-1/2 top-0 aspect-[5/3] w-48 -translate-x-1/2 sm:top-1 sm:w-96" />
        <RoseCluster className="absolute -right-8 top-0 aspect-[5/3] w-36 sm:-right-2 sm:top-2 sm:w-72" />

        <FlowerCascade side="left" delay={0} />
        <FlowerCascade side="right" delay={1.4} />
      </motion.div>

      <motion.div
        className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6 py-24 text-center"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={opening ? { opacity: 0, y: -18, scale: 0.985 } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: opening ? 0.55 : 1.15, delay: opening ? 0.08 : 0.24, ease: [0.22, 1, 0.36, 1] }}
        style={{ color: palette.ink }}
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: `radial-gradient(ellipse at center, ${palette.backdrop} 0%, transparent 64%)` }}
        />

        <Ganesh className="h-20 w-16 sm:h-24 sm:w-20" />
        <p className="mt-3 text-[0.55rem] uppercase tracking-[0.52em] sm:mt-4 sm:text-[0.62rem]" style={{ color: palette.gold }}>
          Shubh Vivah
        </p>

        <div className="mt-5 flex items-center gap-3" style={{ color: palette.gold }}>
          <span className="h-px w-6 bg-current opacity-55 sm:w-16" />
          <span className="font-display text-[0.52rem] uppercase tracking-[0.2em] sm:text-[0.68rem] sm:tracking-[0.34em]">Together with our families</span>
          <span className="h-px w-6 bg-current opacity-55 sm:w-16" />
        </div>

        <h1 className="mt-6 flex flex-wrap items-baseline justify-center gap-x-4 font-display font-light leading-[1] text-balance sm:mt-8">
          <span className="text-[clamp(2.7rem,7.5vw,5.6rem)]">{groom}</span>
          <span className="script px-1 text-[clamp(1.9rem,4.6vw,3.4rem)]" style={{ color: palette.gold }}>
            &amp;
          </span>
          <span className="text-[clamp(2.7rem,7.5vw,5.6rem)]">{bride}</span>
        </h1>

        <div className="mt-7 h-px w-40 bg-gradient-to-r from-transparent via-current to-transparent opacity-45 sm:w-56" />

        <p className="mt-5 text-[0.58rem] uppercase tracking-[0.34em] sm:text-[0.66rem]" style={{ color: palette.muted }}>
          {formatDateLong(wedding.weddingDate, wedding.timezone)}
        </p>
        <p className="mt-1.5 text-[0.54rem] uppercase tracking-[0.26em] sm:text-[0.6rem]" style={{ color: palette.muted }}>
          {[wedding.venueName, wedding.city].filter(Boolean).join(" · ")}
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:mt-11">
          <span className="text-[0.48rem] uppercase tracking-[0.44em] sm:text-[0.54rem]" style={{ color: palette.gold }}>
            The curtains are opening
          </span>
          <span className="relative h-px w-28 overflow-hidden sm:w-36" style={{ backgroundColor: palette.muted }}>
            <motion.span
              className="absolute inset-y-0 left-0 w-12"
              style={{ backgroundColor: palette.gold }}
              initial={{ x: "-120%" }}
              animate={{ x: "380%" }}
              transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
