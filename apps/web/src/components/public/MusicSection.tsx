import { Music2, Pause, Play, Volume2 } from "lucide-react";
import type { SiteData } from "../../types";
import { useMusic } from "./MusicProvider";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { Mandala } from "../decor/Mandala";
import { cn } from "../../lib/utils";

interface MusicSectionProps {
  site: SiteData;
}

export function MusicSection({ site }: MusicSectionProps) {
  const music = useMusic();
  const { theme } = site;
  if (!music.enabled || !music.tracks.length) return null;
  const current = music.current;
  const cover = current?.coverUrl;

  return (
    <section className="relative overflow-hidden bg-[#f4e3e4] py-20 sm:py-28">
      <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 opacity-[0.08]">
        <Mandala className="h-full w-full text-royal-deep animate-spin-slow" />
      </div>
      <div className="container-rb relative z-10">
        <SectionHeading
          kicker="The Soundtrack"
          title="A melody for our forever"
          description="Press play and let the music carry you into the celebration. The perfect accompaniment to our invitation."
          ornament={theme.ornamentStyle as "classic" | "floral" | "minimal"}
        />

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal className="mx-auto w-full max-w-sm">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full border border-royal-primary/25" />
              <div className="absolute -inset-8 rounded-full border border-dashed border-royal-primary/20 animate-spin-reverse" />
              <div className="relative aspect-square overflow-hidden rounded-full border-8 border-[#fbf7ef] bg-royal-deep shadow-[0_40px_80px_-40px_rgba(73,55,47,0.8)]">
                {cover ? (
                  <img src={cover} alt={current?.title ?? "Wedding music"} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_40%,#a95468,#4a1524)] text-[#e8cf9b]">
                    <Music2 className="h-14 w-14" />
                  </div>
                )}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_18%,rgba(30,8,16,0.18)_60%,rgba(30,8,16,0.5)_100%)]" />
                <div className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#e8cf9b]/50 bg-[#2f0e18]/75 text-[#e8cf9b] backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => (current ? music.toggle() : music.play())}
                    className="grid h-full w-full place-items-center rounded-full transition hover:bg-white/10"
                    aria-label={music.playing ? "Pause the wedding soundtrack" : "Play the wedding soundtrack"}
                  >
                    {music.playing ? <Pause className="h-7 w-7" /> : <Play className="ml-1 h-7 w-7" />}
                  </button>
                </div>
              </div>
              {music.playing ? (
                <div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-end gap-1 rounded-full border border-royal-primary/30 bg-[#fbf7ef] px-4 py-2 shadow-md">
                  {[0, 1, 2, 3, 4].map((bar) => (
                    <span
                      key={bar}
                      className="w-1 animate-pulse rounded-full bg-royal-deep"
                      style={{ height: `${6 + (bar % 3) * 5}px`, animationDelay: `${bar * 0.12}s` }}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="overflow-hidden rounded-sm border border-royal-primary/25 bg-[#fbf7ef]/80 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-royal-primary/15 px-5 py-4">
                <div>
                  <p className="text-[0.5rem] uppercase tracking-[0.3em] text-royal-primary">Now playing</p>
                  <p className="mt-1 font-display text-2xl text-royal-deep">{current?.title ?? "Wedding playlist"}</p>
                  <p className="text-[0.58rem] uppercase tracking-[0.2em] text-royal-ink/45">{current?.artist ?? "Royal Blush"}</p>
                </div>
                <div className="flex items-center gap-2 text-royal-primary">
                  <Volume2 className="h-4 w-4" />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={music.volume}
                    onChange={(event) => music.setVolume(Number(event.target.value))}
                    className="h-1 w-20 cursor-pointer accent-[#762f43]"
                    aria-label="Soundtrack volume"
                  />
                </div>
              </div>
              <div className="divide-y divide-royal-primary/[0.12]">
                {music.tracks.map((track, index) => {
                  const isCurrent = current?.id === track.id;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => {
                        if (isCurrent) {
                          music.toggle();
                        } else {
                          music.play(track);
                        }
                      }}
                      className={cn(
                        "flex w-full items-center gap-4 px-5 py-3.5 text-left transition hover:bg-royal-primary/[0.06]",
                        isCurrent && "bg-royal-primary/[0.08]"
                      )}
                    >
                      <span className="w-5 text-[0.58rem] tabular-nums text-royal-primary/70">{String(index + 1).padStart(2, "0")}</span>
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-royal-primary/30 text-royal-deep">
                        {isCurrent && music.playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="ml-0.5 h-3.5 w-3.5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-lg leading-tight text-royal-deep">{track.title}</span>
                        <span className="block truncate text-[0.55rem] uppercase tracking-[0.2em] text-royal-ink/45">
                          {track.artist ?? "Royal Blush"}
                        </span>
                      </span>
                      {isCurrent && music.playing ? (
                        <span className="flex items-end gap-0.5">
                          {[0, 1, 2].map((bar) => (
                            <span
                              key={bar}
                              className="w-0.5 animate-pulse bg-royal-deep"
                              style={{ height: `${5 + bar * 4}px`, animationDelay: `${bar * 0.14}s` }}
                            />
                          ))}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-royal-primary/15 px-5 py-3 text-center text-[0.5rem] uppercase tracking-[0.26em] text-royal-primary">
                {music.tracks.length} {music.tracks.length === 1 ? "melody" : "melodies"} · Best with headphones
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
