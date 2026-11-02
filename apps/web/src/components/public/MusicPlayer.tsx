import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Music2, Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useMusic } from "./MusicProvider";
import { cn } from "../../lib/utils";

function clock(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function MusicPlayer() {
  const music = useMusic();
  const [expanded, setExpanded] = useState(true);
  const current = music.current;

  if (!music.enabled || !music.tracks.length) return null;

  if (!expanded) {
    return (
      <motion.button
        type="button"
        onClick={() => setExpanded(true)}
        className="fixed bottom-5 left-4 z-40 grid h-14 w-14 place-items-center rounded-full border border-[#d8bd83]/60 bg-royal-deep text-[#f7e6c2] shadow-[0_20px_40px_-18px_rgba(47,14,24,0.8)] sm:left-6"
        aria-label="Open the music player"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
      >
        <Music2 className={cn("h-5 w-5", music.playing && "animate-pulse")} />
        {music.playing ? <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-royal-deep bg-[#e8cf9b]" /> : null}
      </motion.button>
    );
  }

  return (
    <motion.div
      className="fixed bottom-4 left-3 right-3 z-40 overflow-hidden rounded-xl border border-royal-primary/35 bg-[#fbf7ef]/[0.96] shadow-[0_28px_70px_-28px_rgba(47,14,24,0.75)] backdrop-blur-xl sm:bottom-6 sm:left-6 sm:right-auto sm:w-[21rem]"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Wedding music player"
    >
      <div className="h-0.5 w-full bg-royal-primary/15">
        <div
          className="h-full bg-gradient-to-r from-[#d8bd83] to-royal-deep transition-[width] duration-300"
          style={{ width: `${music.duration ? Math.min(100, (music.progress / music.duration) * 100) : 0}%` }}
        />
      </div>
      <div className="flex items-center gap-3 p-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-royal-deep">
          {current?.coverUrl ? (
            <img src={current.coverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-[#e8cf9b]">
              <Music2 className="h-5 w-5" />
            </div>
          )}
          {music.playing ? (
            <div className="absolute inset-0 grid place-items-center bg-black/30">
              <div className="flex items-end gap-0.5">
                {[0, 1, 2].map((bar) => (
                  <span
                    key={bar}
                    className="w-0.5 animate-pulse bg-[#f7e6c2]"
                    style={{ height: `${5 + bar * 4}px`, animationDelay: `${bar * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base leading-tight text-royal-deep">{current?.title ?? "Wedding playlist"}</p>
          <p className="truncate text-[0.55rem] uppercase tracking-[0.2em] text-royal-ink/50">
            {current?.artist ?? "Royal Blush"}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[0.52rem] tabular-nums text-royal-ink/45">{clock(music.progress)}</span>
            <input
              type="range"
              min={0}
              max={Math.max(1, music.duration)}
              step={1}
              value={Math.min(music.progress, music.duration || 0)}
              onChange={(event) => music.seek(Number(event.target.value))}
              className="h-1 flex-1 cursor-pointer accent-[#762f43]"
              aria-label="Music progress"
            />
            <span className="text-[0.52rem] tabular-nums text-royal-ink/45">{clock(music.duration)}</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={music.previous}
            className="hidden h-8 w-8 place-items-center rounded-full text-royal-deep/70 transition hover:bg-royal-primary/10 hover:text-royal-deep sm:grid"
            aria-label="Previous track"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={music.toggle}
            className="grid h-10 w-10 place-items-center rounded-full bg-royal-deep text-[#f7e6c2] shadow-md transition hover:scale-105"
            aria-label={music.playing ? "Pause music" : "Play music"}
          >
            {music.playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={music.next}
            className="hidden h-8 w-8 place-items-center rounded-full text-royal-deep/70 transition hover:bg-royal-primary/10 hover:text-royal-deep sm:grid"
            aria-label="Next track"
          >
            <SkipForward className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="grid h-8 w-8 place-items-center rounded-full text-royal-deep/50 transition hover:bg-royal-primary/10 hover:text-royal-deep"
            aria-label="Minimize music player"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="hidden items-center gap-2 border-t border-royal-primary/15 px-4 py-2 sm:flex">
        <Volume2 className="h-3.5 w-3.5 text-royal-primary" />
        <input
          type="range"
          min={0}
          max={100}
          value={music.volume}
          onChange={(event) => music.setVolume(Number(event.target.value))}
          className="h-1 flex-1 cursor-pointer accent-[#b89555]"
          aria-label="Music volume"
        />
        <span className="w-7 text-right text-[0.52rem] tabular-nums text-royal-ink/45">{music.volume}%</span>
        <span className="ml-1 flex items-center gap-1 text-[0.5rem] uppercase tracking-[0.18em] text-royal-primary">
          <ChevronUp className="h-3 w-3" />
          {music.tracks.length} {music.tracks.length === 1 ? "track" : "tracks"}
        </span>
      </div>
    </motion.div>
  );
}
