import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Image as ImageIcon, Loader2, Music2, Search, Upload, X } from "lucide-react";
import { api } from "../../lib/api";
import type { MediaAsset, MediaType } from "../../types";
import { AdminButton, Badge, EmptyState, Field, Modal } from "./AdminUI";
import { useToast } from "../AdminProviders";
import { cn, formatBytes } from "../../lib/utils";

interface MediaFieldProps {
  label: string;
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  type?: MediaType;
  hint?: string;
}

export function MediaField({ label, value, onChange, type = "IMAGE", hint }: MediaFieldProps) {
  const [open, setOpen] = useState(false);
  return (
    <Field label={label} hint={hint}>
      <div className="flex gap-3">
        <div className="grid h-20 w-24 shrink-0 place-items-center overflow-hidden rounded-lg border border-[#e2d6c6] bg-[#faf4eb] text-[#b89555]">
          {value ? (
            type === "IMAGE" ? (
              <img src={value} alt="" className="h-full w-full object-cover" />
            ) : (
              <Music2 className="h-6 w-6" />
            )
          ) : type === "IMAGE" ? (
            <ImageIcon className="h-6 w-6" />
          ) : (
            <Music2 className="h-6 w-6" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <input
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value || null)}
            className="admin-input"
            placeholder={type === "IMAGE" ? "https://… or /uploads/…" : "Audio file URL"}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <AdminButton type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
              {type === "IMAGE" ? "Choose image" : "Choose audio"}
            </AdminButton>
            {value ? (
              <AdminButton type="button" size="sm" variant="ghost" onClick={() => onChange(null)}>
                <X className="h-3 w-3" />
                Clear
              </AdminButton>
            ) : null}
          </div>
        </div>
      </div>
      <MediaPickerModal
        open={open}
        onClose={() => setOpen(false)}
        type={type}
        onSelect={(asset) => {
          onChange(asset.url);
          setOpen(false);
        }}
      />
    </Field>
  );
}

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  type: MediaType;
  onSelect: (asset: MediaAsset) => void;
}

export function MediaPickerModal({ open, onClose, type, onSelect }: MediaPickerModalProps) {
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();
  const query = useQuery({
    queryKey: ["admin", "media", type],
    queryFn: () => api.admin.media({ type }),
    enabled: open
  });
  const assets = (query.data?.media ?? []).filter((asset) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      asset.originalName.toLowerCase().includes(term) ||
      (asset.altText ?? "").toLowerCase().includes(term) ||
      (asset.caption ?? "").toLowerCase().includes(term)
    );
  });

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      if (type === "AUDIO") {
        const asset = await api.admin.uploadAudio(files[0]!);
        await queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
        toast.success("Audio uploaded.");
        onSelect(asset);
      } else {
        const created = await api.admin.uploadImages(Array.from(files));
        await queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
        toast.success(`${created.length} ${created.length === 1 ? "image" : "images"} uploaded.`);
        if (created[0]) onSelect(created[0]);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={type === "IMAGE" ? "Choose a photograph" : "Choose an audio track"}
      description="Select from the media library or upload a new file."
      size="xl"
      footer={<AdminButton type="button" variant="outline" onClick={onClose}>Close</AdminButton>}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a08e80]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="admin-input pl-9"
            placeholder="Search the library"
            aria-label="Search media"
          />
        </div>
        <div className="flex items-center gap-2">
          {query.data?.storageMode ? <Badge tone="gold">{query.data.storageMode === "s3" ? "Cloud storage" : "Local storage"}</Badge> : null}
          <input
            ref={inputRef}
            type="file"
            accept={type === "IMAGE" ? "image/*" : "audio/*"}
            multiple={type === "IMAGE"}
            className="hidden"
            onChange={(event) => upload(event.target.files)}
          />
          <AdminButton type="button" variant="gold" size="sm" loading={uploading} onClick={() => inputRef.current?.click()}>
            <Upload className="h-3.5 w-3.5" />
            Upload
          </AdminButton>
        </div>
      </div>

      {query.isLoading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#b89555]" />
        </div>
      ) : query.isError ? (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[0.78rem] text-red-700">The media library could not be loaded.</p>
      ) : !assets.length ? (
        <EmptyState
          icon={type === "IMAGE" ? <ImageIcon className="h-6 w-6" /> : <Music2 className="h-6 w-6" />}
          title={search ? "No matching files" : "Your library is empty"}
          description={search ? "Try a different search." : "Upload a file to begin building your media library."}
        />
      ) : type === "IMAGE" ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {assets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => onSelect(asset)}
              className="group overflow-hidden rounded-lg border border-[#e7dccd] bg-[#faf4eb] text-left transition hover:border-[#b89555]"
            >
              <div className="aspect-square overflow-hidden">
                <img src={asset.url} alt={asset.altText || asset.originalName} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
              </div>
              <div className="p-2.5">
                <p className="truncate text-[0.68rem] font-medium text-[#49372f]">{asset.originalName}</p>
                <p className="text-[0.56rem] text-[#a08e80]">{formatBytes(asset.size)}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-5 space-y-2">
          {assets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => onSelect(asset)}
              className="flex w-full items-center gap-3 rounded-lg border border-[#e7dccd] p-3 text-left transition hover:border-[#b89555] hover:bg-[#faf4eb]"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f5ebdd] text-[#762f43]">
                <Music2 className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.8rem] font-medium text-[#49372f]">{asset.originalName}</span>
                <span className="block text-[0.6rem] text-[#a08e80]">{formatBytes(asset.size)}</span>
              </span>
              <span className="text-[0.55rem] uppercase tracking-[0.14em] text-[#b89555]">Select</span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
