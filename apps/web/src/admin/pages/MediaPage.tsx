import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AudioLines,
  Check,
  Copy,
  Image as ImageIcon,
  Images,
  Music2,
  Pencil,
  Search,
  Trash2,
  Upload
} from "lucide-react";
import { api, ApiError } from "../../lib/api";
import type { MediaAsset, MediaType } from "../../types";
import { AdminButton, Badge, EmptyState, Field, LoadingScreen, Modal, PageHeader, Panel } from "../components/AdminUI";
import { useConfirm, useToast } from "../AdminProviders";
import { cn, formatBytes, formatDateTime } from "../../lib/utils";

type Filter = "ALL" | MediaType;

interface MediaForm {
  originalName: string;
  altText: string;
  caption: string;
}

export function MediaPage() {
  const query = useQuery({ queryKey: ["admin", "media", "ALL"], queryFn: () => api.admin.media() });
  const queryClient = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const imageInput = useRef<HTMLInputElement | null>(null);
  const audioInput = useRef<HTMLInputElement | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState<"images" | "audio" | null>(null);
  const [editing, setEditing] = useState<MediaAsset | null>(null);
  const [form, setForm] = useState<MediaForm>({ originalName: "", altText: "", caption: "" });
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "music"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["public-site"] });
  };

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => api.admin.updateMedia(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Media details updated.");
      setEditing(null);
    },
    onError: (caught) => {
      const message = caught instanceof ApiError ? caught.message : "The media details could not be saved.";
      setError(message);
      toast.error(message);
    }
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.admin.deleteMedia(id),
    onSuccess: () => {
      invalidate();
      toast.success("Media removed.");
    },
    onError: (caught) => toast.error(caught instanceof ApiError ? caught.message : "The media could not be removed.")
  });

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading("images");
    try {
      const created = await api.admin.uploadImages(Array.from(files));
      invalidate();
      toast.success(`${created.length} ${created.length === 1 ? "image" : "images"} uploaded.`);
    } catch (caught) {
      toast.error(caught instanceof ApiError ? caught.message : "The upload failed.");
    } finally {
      setUploading(null);
      if (imageInput.current) imageInput.current.value = "";
    }
  };

  const uploadAudio = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading("audio");
    try {
      await api.admin.uploadAudio(files[0]!);
      invalidate();
      toast.success("Audio track uploaded.");
    } catch (caught) {
      toast.error(caught instanceof ApiError ? caught.message : "The upload failed.");
    } finally {
      setUploading(null);
      if (audioInput.current) audioInput.current.value = "";
    }
  };

  const openEdit = (asset: MediaAsset) => {
    setError("");
    setEditing(asset);
    setForm({
      originalName: asset.originalName,
      altText: asset.altText ?? "",
      caption: asset.caption ?? ""
    });
  };

  const submitEdit = () => {
    if (!editing) return;
    if (!form.originalName.trim()) {
      setError("The file needs a name.");
      return;
    }
    update.mutate({
      id: editing.id,
      payload: {
        originalName: form.originalName.trim(),
        altText: form.altText.trim() || null,
        caption: form.caption.trim() || null
      }
    });
  };

  const requestDelete = async (asset: MediaAsset) => {
    const ok = await confirm({
      title: `Remove ${asset.originalName}?`,
      message: "The file will be deleted from storage. Any gallery entries or music tracks using it will also be removed.",
      confirmLabel: "Delete file",
      tone: "danger"
    });
    if (ok) remove.mutate(asset.id);
  };

  const copyUrl = async (asset: MediaAsset) => {
    try {
      await navigator.clipboard.writeText(asset.url);
      setCopied(asset.id);
      window.setTimeout(() => setCopied(""), 1600);
    } catch {
      toast.error("The link could not be copied.");
    }
  };

  const assets = useMemo(() => {
    const list = query.data?.media ?? [];
    return list.filter((asset) => {
      if (filter !== "ALL" && asset.type !== filter) return false;
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        asset.originalName.toLowerCase().includes(term) ||
        (asset.altText ?? "").toLowerCase().includes(term) ||
        (asset.caption ?? "").toLowerCase().includes(term)
      );
    });
  }, [query.data?.media, filter, search]);

  if (query.isLoading) return <LoadingScreen label="Opening the media library" />;

  const counts = {
    ALL: query.data?.media.length ?? 0,
    IMAGE: query.data?.media.filter((asset) => asset.type === "IMAGE").length ?? 0,
    AUDIO: query.data?.media.filter((asset) => asset.type === "AUDIO").length ?? 0
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content"
        title="Media library"
        description="Every photograph and audio track in one persistent, reusable library."
        actions={
          <>
            <Badge tone={query.data?.storageMode === "s3" ? "success" : "warning"}>
              {query.data?.storageMode === "s3" ? "Cloud storage" : "Local storage"}
            </Badge>
            <input ref={imageInput} type="file" accept="image/*" multiple className="hidden" onChange={(event) => uploadImages(event.target.files)} />
            <input ref={audioInput} type="file" accept="audio/*" className="hidden" onChange={(event) => uploadAudio(event.target.files)} />
            <AdminButton variant="outline" loading={uploading === "audio"} onClick={() => audioInput.current?.click()}>
              <Music2 className="h-3.5 w-3.5" />
              Upload audio
            </AdminButton>
            <AdminButton loading={uploading === "images"} onClick={() => imageInput.current?.click()}>
              <Upload className="h-3.5 w-3.5" />
              Upload images
            </AdminButton>
          </>
        }
      />

      <div className="flex flex-col gap-3 rounded-xl border border-[#e7dccd] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1">
          {(["ALL", "IMAGE", "AUDIO"] as Filter[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={cn(
                "rounded-lg px-3 py-2 text-[0.62rem] font-medium uppercase tracking-[0.12em] transition",
                filter === item ? "bg-[#762f43] text-white" : "text-[#8a776a] hover:bg-[#faf4eb] hover:text-[#49372f]"
              )}
            >
              {item === "ALL" ? "All files" : item === "IMAGE" ? "Photographs" : "Audio"} · {counts[item]}
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a08e80]" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="admin-input pl-9" placeholder="Search by name or caption" aria-label="Search media" />
        </div>
      </div>

      {!assets.length ? (
        <Panel noPadding>
          <EmptyState
            icon={filter === "AUDIO" ? <Music2 className="h-6 w-6" /> : <Images className="h-6 w-6" />}
            title={search ? "No matching files" : "Your library is empty"}
            description={search ? "Try a different name or caption." : "Upload photographs and audio to begin composing your invitation."}
            action={
              !search ? (
                <AdminButton onClick={() => (filter === "AUDIO" ? audioInput.current?.click() : imageInput.current?.click())}>
                  <Upload className="h-3.5 w-3.5" />
                  Upload {filter === "AUDIO" ? "audio" : "images"}
                </AdminButton>
              ) : undefined
            }
          />
        </Panel>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {assets.map((asset) => (
            <article key={asset.id} className="group overflow-hidden rounded-xl border border-[#e7dccd] bg-white shadow-[0_18px_50px_-42px_rgba(73,55,47,0.55)]">
              {asset.type === "IMAGE" ? (
                <div className="aspect-[4/3] overflow-hidden bg-[#f5ebdd]">
                  <img src={asset.url} alt={asset.altText || asset.originalName} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
                </div>
              ) : (
                <div className="grid aspect-[4/3] place-items-center bg-[#3b111d] text-[#e8cf9b]">
                  <div className="text-center">
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[#d8bd83]/35">
                      <AudioLines className="h-5 w-5" />
                    </span>
                    <p className="mt-3 text-[0.5rem] uppercase tracking-[0.24em] text-[#d8bd83]/70">Audio track</p>
                  </div>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate text-[0.82rem] font-medium text-[#49372f]">{asset.originalName}</h2>
                    <p className="mt-0.5 text-[0.6rem] text-[#a08e80]">
                      {formatBytes(asset.size)}
                      {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ""}
                    </p>
                  </div>
                  <Badge tone={asset.type === "IMAGE" ? "gold" : "deep"}>{asset.type === "IMAGE" ? "Image" : "Audio"}</Badge>
                </div>
                {asset.altText ? <p className="mt-2 line-clamp-1 text-[0.66rem] text-[#8a776a]">{asset.altText}</p> : null}
                {asset.type === "AUDIO" ? (
                  <audio controls preload="none" src={asset.url} className="mt-3 h-8 w-full">
                    Your browser does not support audio playback.
                  </audio>
                ) : null}
                <p className="mt-2 text-[0.56rem] text-[#a08e80]">Added {formatDateTime(asset.createdAt)}</p>
                <div className="mt-3 flex items-center justify-between border-t border-[#f0e6d8] pt-2.5">
                  <button type="button" onClick={() => copyUrl(asset)} className="inline-flex items-center gap-1.5 text-[0.56rem] uppercase tracking-[0.12em] text-[#8a776a] transition hover:text-[#762f43]">
                    {copied === asset.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    {copied === asset.id ? "Copied" : "Copy link"}
                  </button>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => openEdit(asset)} className="grid h-7 w-7 place-items-center rounded-full text-[#a08e80] transition hover:bg-[#f5ebdd] hover:text-[#762f43]" aria-label={`Edit ${asset.originalName}`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => requestDelete(asset)} className="grid h-7 w-7 place-items-center rounded-full text-[#a08e80] transition hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${asset.originalName}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit media details"
        description="Names and captions help you find files and improve accessibility."
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setEditing(null)}>Cancel</AdminButton>
            <AdminButton onClick={submitEdit} loading={update.isPending}>Save details</AdminButton>
          </>
        }
      >
        {editing ? (
          <div className="space-y-4">
            {editing.type === "IMAGE" ? (
              <div className="overflow-hidden rounded-lg border border-[#e7dccd]">
                <img src={editing.url} alt={editing.altText || editing.originalName} className="aspect-[16/9] w-full object-cover" />
              </div>
            ) : null}
            <Field label="File name" htmlFor="media-name" required>
              <input id="media-name" className="admin-input" value={form.originalName} onChange={(event) => setForm((current) => ({ ...current, originalName: event.target.value }))} />
            </Field>
            <Field label="Alt text" htmlFor="media-alt" hint="Describe the image for screen readers.">
              <input id="media-alt" className="admin-input" value={form.altText} onChange={(event) => setForm((current) => ({ ...current, altText: event.target.value }))} />
            </Field>
            <Field label="Caption" htmlFor="media-caption">
              <input id="media-caption" className="admin-input" value={form.caption} onChange={(event) => setForm((current) => ({ ...current, caption: event.target.value }))} />
            </Field>
            <div className="rounded-lg bg-[#faf4eb] p-3">
              <p className="text-[0.56rem] uppercase tracking-[0.16em] text-[#a08e80]">Public URL</p>
              <p className="mt-1 break-all text-[0.68rem] text-[#6f5c4f]">{editing.url}</p>
            </div>
            {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[0.75rem] text-red-700">{error}</p> : null}
          </div>
        ) : null}
      </Modal>

      {query.isError ? (
        <Panel>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.8rem] text-red-700">The media library could not be refreshed.</p>
            <AdminButton size="sm" variant="outline" onClick={() => query.refetch()}>Try again</AdminButton>
          </div>
        </Panel>
      ) : null}

      <p className="flex items-center gap-2 text-[0.62rem] leading-relaxed text-[#a08e80]">
        <ImageIcon className="h-3.5 w-3.5 shrink-0" />
        Images are optimised automatically. Use the library to attach photographs to profiles, events, the gallery, and more.
      </p>
    </div>
  );
}
