import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AudioLines,
  CheckCircle2,
  Eye,
  EyeOff,
  Music2,
  Pencil,
  Play,
  Plus,
  Trash2,
  Volume2
} from "lucide-react";
import { api, ApiError } from "../../lib/api";
import type { MediaAsset, MusicTrackAdmin } from "../../types";
import { AdminButton, Badge, EmptyState, Field, LoadingScreen, Modal, PageHeader, Panel, Toggle } from "../components/AdminUI";
import { MediaField, MediaPickerModal } from "../components/MediaPicker";
import { useConfirm, useToast } from "../AdminProviders";
import { cn } from "../../lib/utils";

interface TrackForm {
  title: string;
  artist: string;
  coverUrl: string;
  visible: boolean;
  order: string;
}

const emptyForm: TrackForm = {
  title: "",
  artist: "",
  coverUrl: "",
  visible: true,
  order: "0"
};

export function MusicPage() {
  const musicQuery = useQuery({ queryKey: ["admin", "music"], queryFn: api.admin.music });
  const weddingQuery = useQuery({ queryKey: ["admin", "wedding"], queryFn: api.admin.wedding });
  const queryClient = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editing, setEditing] = useState<MusicTrackAdmin | null>(null);
  const [form, setForm] = useState<TrackForm>(emptyForm);
  const [error, setError] = useState("");
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [volume, setVolume] = useState(42);

  const settings = weddingQuery.data?.settings;

  useEffect(() => {
    if (!settings) return;
    setMusicEnabled(settings.musicEnabled);
    setVolume(settings.defaultVolume);
  }, [settings?.id, settings?.musicEnabled, settings?.defaultVolume]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "music"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "wedding"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["public-site"] });
  };

  const create = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.admin.createMusic(payload),
    onSuccess: () => {
      invalidate();
      toast.success("Track added to the soundtrack.");
      setPickerOpen(false);
    },
    onError: (caught) => toast.error(caught instanceof ApiError ? caught.message : "The track could not be added.")
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => api.admin.updateMusic(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Track updated.");
      setEditing(null);
    },
    onError: (caught) => {
      const message = caught instanceof ApiError ? caught.message : "The track could not be updated.";
      setError(message);
      toast.error(message);
    }
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.admin.deleteMusic(id),
    onSuccess: () => {
      invalidate();
      toast.success("Track removed.");
    },
    onError: (caught) => toast.error(caught instanceof ApiError ? caught.message : "The track could not be removed.")
  });

  const settingsMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.admin.updateSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "wedding"] });
      queryClient.invalidateQueries({ queryKey: ["public-site"] });
      toast.success("Music settings saved.");
    },
    onError: (caught) => toast.error(caught instanceof ApiError ? caught.message : "The music settings could not be saved.")
  });

  const activeTrack = useMutation({
    mutationFn: (trackId: string | null) => api.admin.updateSettings({ activeMusicTrackId: trackId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "wedding"] });
      queryClient.invalidateQueries({ queryKey: ["public-site"] });
      toast.success("Soundtrack selection updated.");
    },
    onError: (caught) => toast.error(caught instanceof ApiError ? caught.message : "The soundtrack could not be changed.")
  });

  const chooseAudio = (asset: MediaAsset) => {
    const nextOrder = (musicQuery.data?.length ?? 0) + 1;
    const title = asset.originalName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
    create.mutate({
      mediaId: asset.id,
      title,
      artist: null,
      coverUrl: null,
      visible: true,
      order: nextOrder
    });
  };

  const openEdit = (track: MusicTrackAdmin) => {
    setError("");
    setEditing(track);
    setForm({
      title: track.title,
      artist: track.artist ?? "",
      coverUrl: track.coverUrl ?? "",
      visible: track.visible,
      order: String(track.order)
    });
  };

  const submitEdit = () => {
    if (!editing) return;
    if (!form.title.trim()) {
      setError("Give the track a title.");
      return;
    }
    update.mutate({
      id: editing.id,
      payload: {
        title: form.title.trim(),
        artist: form.artist.trim() || null,
        coverUrl: form.coverUrl.trim() || null,
        visible: form.visible,
        order: Number(form.order) || 0
      }
    });
  };

  const requestDelete = async (track: MusicTrackAdmin) => {
    const ok = await confirm({
      title: `Remove “${track.title}”?`,
      message: "The track will be removed from the soundtrack. The audio file remains in your media library.",
      confirmLabel: "Remove track",
      tone: "danger"
    });
    if (ok) remove.mutate(track.id);
  };

  const tracks = useMemo(() => musicQuery.data ?? [], [musicQuery.data]);
  const activeId = settings?.activeMusicTrackId ?? null;

  if (musicQuery.isLoading) return <LoadingScreen label="Tuning the soundtrack" />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content"
        title="Music"
        description="Set the atmosphere with the soundtrack that welcomes your guests."
        actions={
          <AdminButton onClick={() => setPickerOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add track
          </AdminButton>
        }
      />

      <Panel title="Soundtrack controls" description="Choose the opening track and how it plays.">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-5">
            <Toggle checked={musicEnabled} onChange={setMusicEnabled} label="Music enabled" description="Show the music player and allow playback." />
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="music-volume" className="admin-label mb-0">Default volume</label>
                <span className="text-[0.7rem] font-medium text-[#762f43]">{volume}%</span>
              </div>
              <input
                id="music-volume"
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                className="mt-2 w-full accent-[#762f43]"
              />
              <div className="mt-1 flex justify-between text-[0.55rem] uppercase tracking-[0.12em] text-[#a08e80]">
                <span>Quiet</span>
                <span>Full</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-[#b89555]" />
              <p className="text-[0.68rem] leading-relaxed text-[#8a776a]">Browsers require a guest interaction before audio can begin. The invitation handles this gracefully.</p>
            </div>
          </div>
          <div className="space-y-4">
            <Field label="Opening track" htmlFor="active-track">
              <select
                id="active-track"
                className="admin-input"
                value={activeId ?? ""}
                onChange={(event) => activeTrack.mutate(event.target.value || null)}
              >
                <option value="">No opening track</option>
                {tracks.filter((track) => track.visible).map((track) => (
                  <option key={track.id} value={track.id}>{track.title}{track.artist ? ` — ${track.artist}` : ""}</option>
                ))}
              </select>
            </Field>
            <div className="rounded-lg bg-[#faf4eb] p-3 text-[0.66rem] leading-relaxed text-[#8a776a]">
              {activeId ? "The selected track begins when a guest chooses to enter the invitation." : "Choose a track to welcome guests with music."}
            </div>
            <AdminButton
              variant="subtle"
              loading={settingsMutation.isPending}
              onClick={() => settingsMutation.mutate({ musicEnabled, defaultVolume: volume })}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Save music settings
            </AdminButton>
          </div>
        </div>
      </Panel>

      {!tracks.length ? (
        <Panel noPadding>
          <EmptyState
            icon={<Music2 className="h-6 w-6" />}
            title="No tracks yet"
            description="Upload an audio file to your media library and add it to the soundtrack."
            action={<AdminButton onClick={() => setPickerOpen(true)}>Add the first track</AdminButton>}
          />
        </Panel>
      ) : (
        <div className="space-y-3">
          {tracks.map((track) => {
            const isActive = track.id === activeId;
            return (
              <article
                key={track.id}
                className={cn(
                  "overflow-hidden rounded-xl border bg-white shadow-[0_18px_50px_-42px_rgba(73,55,47,0.55)]",
                  isActive ? "border-[#b89555]" : "border-[#e7dccd]"
                )}
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#3b111d] text-[#e8cf9b]">
                    {track.coverUrl ? (
                      <img src={track.coverUrl} alt={track.title} className="h-full w-full object-cover" />
                    ) : (
                      <AudioLines className="h-7 w-7" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-2xl leading-tight text-[#49372f]">{track.title}</h2>
                      {isActive ? <Badge tone="gold">Opening track</Badge> : null}
                      <Badge tone={track.visible ? "success" : "neutral"}>{track.visible ? "Visible" : "Hidden"}</Badge>
                    </div>
                    <p className="mt-0.5 text-[0.66rem] text-[#8a776a]">{track.artist || "Unknown artist"} · order {track.order}</p>
                    <audio controls preload="none" src={track.url} className="mt-3 h-9 w-full max-w-md">
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 self-end sm:self-center">
                    <AdminButton size="sm" variant={isActive ? "subtle" : "outline"} onClick={() => activeTrack.mutate(isActive ? null : track.id)}>
                      <Play className="h-3 w-3" />
                      {isActive ? "Clear" : "Use as opening"}
                    </AdminButton>
                    <button type="button" onClick={() => update.mutate({ id: track.id, payload: { visible: !track.visible } })} className="grid h-8 w-8 place-items-center rounded-full text-[#a08e80] transition hover:bg-[#f5ebdd] hover:text-[#762f43]" aria-label={track.visible ? "Hide track" : "Show track"}>
                      {track.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button type="button" onClick={() => openEdit(track)} className="grid h-8 w-8 place-items-center rounded-full text-[#a08e80] transition hover:bg-[#f5ebdd] hover:text-[#762f43]" aria-label={`Edit ${track.title}`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => requestDelete(track)} className="grid h-8 w-8 place-items-center rounded-full text-[#a08e80] transition hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${track.title}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <MediaPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} type="AUDIO" onSelect={chooseAudio} />

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit track"
        description="The title and artist appear in the invitation's music player."
        size="lg"
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setEditing(null)}>Cancel</AdminButton>
            <AdminButton onClick={submitEdit} loading={update.isPending}>Save changes</AdminButton>
          </>
        }
      >
        {editing ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" htmlFor="track-title" required className="sm:col-span-2">
              <input id="track-title" className="admin-input" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </Field>
            <Field label="Artist" htmlFor="track-artist">
              <input id="track-artist" className="admin-input" value={form.artist} onChange={(event) => setForm((current) => ({ ...current, artist: event.target.value }))} />
            </Field>
            <Field label="Display order" htmlFor="track-order">
              <input id="track-order" type="number" min={0} max={9999} className="admin-input" value={form.order} onChange={(event) => setForm((current) => ({ ...current, order: event.target.value }))} />
            </Field>
            <div className="sm:col-span-2">
              <MediaField label="Cover image (optional)" value={form.coverUrl} onChange={(value) => setForm((current) => ({ ...current, coverUrl: value ?? "" }))} />
            </div>
            <div className="sm:col-span-2">
              <Toggle checked={form.visible} onChange={(value) => setForm((current) => ({ ...current, visible: value }))} label="Show in the music player" description="Hidden tracks remain in the studio." />
            </div>
            <div className="sm:col-span-2 rounded-lg bg-[#faf4eb] p-3">
              <p className="text-[0.56rem] uppercase tracking-[0.16em] text-[#a08e80]">Audio file</p>
              <p className="mt-1 break-all text-[0.68rem] text-[#6f5c4f]">{editing.media.originalName}</p>
            </div>
            {error ? <p className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[0.75rem] text-red-700">{error}</p> : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
