import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { MusicTrack } from "../../types";

interface MusicContextValue {
  tracks: MusicTrack[];
  current: MusicTrack | null;
  playing: boolean;
  progress: number;
  duration: number;
  volume: number;
  enabled: boolean;
  play: (track?: MusicTrack) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (value: number) => void;
  setVolume: (value: number) => void;
}

const MusicContext = createContext<MusicContextValue | null>(null);

interface MusicProviderProps {
  tracks: MusicTrack[];
  initialTrackId?: string | null;
  initialVolume: number;
  enabled: boolean;
  children: ReactNode;
}

export function MusicProvider({ tracks, initialTrackId, initialVolume, enabled, children }: MusicProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initial = tracks.find((track) => track.id === initialTrackId) ?? tracks[0] ?? null;
  const [current, setCurrent] = useState<MusicTrack | null>(initial);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(() => {
    if (typeof window === "undefined") return initialVolume;
    const stored = window.localStorage.getItem("rb_music_volume");
    const parsed = stored ? Number(stored) : Number.NaN;
    return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : initialVolume;
  });

  useEffect(() => {
    if (!enabled) {
      audioRef.current?.pause();
      setPlaying(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
    window.localStorage.setItem("rb_music_volume", String(volume));
  }, [volume]);

  useEffect(() => {
    if (initial && !current) {
      setCurrent(initial);
    }
  }, [initial, current]);

  const play = useCallback(
    (track?: MusicTrack) => {
      if (!enabled) return;
      const audio = audioRef.current;
      const target = track ?? current ?? tracks[0];
      if (!audio || !target) return;
      if (!current || current.id !== target.id) {
        setCurrent(target);
        audio.src = target.url;
        audio.load();
      }
      audio.volume = volume / 100;
      const attempt = audio.play();
      if (attempt) {
        attempt.then(() => setPlaying(true)).catch(() => setPlaying(false));
      }
    },
    [enabled, current, tracks, volume]
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !enabled) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    play();
  }, [enabled, playing, play]);

  const next = useCallback(() => {
    if (!tracks.length) return;
    const index = current ? tracks.findIndex((track) => track.id === current.id) : -1;
    const target = tracks[(index + 1) % tracks.length];
    if (target) play(target);
  }, [current, play, tracks]);

  const previous = useCallback(() => {
    if (!tracks.length) return;
    const index = current ? tracks.findIndex((track) => track.id === current.id) : 0;
    const target = tracks[(index - 1 + tracks.length) % tracks.length];
    if (target) play(target);
  }, [current, play, tracks]);

  const seek = useCallback((value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setProgress(value);
  }, []);

  const setVolume = useCallback((value: number) => {
    setVolumeState(Math.min(100, Math.max(0, value)));
  }, []);

  const value = useMemo<MusicContextValue>(
    () => ({
      tracks,
      current,
      playing,
      progress,
      duration,
      volume,
      enabled,
      play,
      toggle,
      next,
      previous,
      seek,
      setVolume
    }),
    [tracks, current, playing, progress, duration, volume, enabled, play, toggle, next, previous, seek, setVolume]
  );

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        src={current?.url}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setProgress(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
        onEnded={next}
      />
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const value = useContext(MusicContext);
  if (!value) {
    throw new Error("useMusic must be used within MusicProvider");
  }
  return value;
}
