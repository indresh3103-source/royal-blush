import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, GalleryVerticalEnd, ImagePlus, Images, Pencil, Plus, Trash2 } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import type { GalleryAdminImage, MediaAsset } from "../../types";
import { AdminButton, Badge, EmptyState, Field, LoadingScreen, Modal, PageHeader, Panel, Toggle } from "../components/AdminUI";
import { MediaPickerModal } from "../components/MediaPicker";
import { useConfirm, useToast } from "../AdminProviders";
import { cn } from "../../lib/utils";

const sections = [
  { value: "couple", label: "The couple" },
  { value: "bride", label: "The bride" },
  { value: "groom", label: "The groom" },
  { value: "family", label: "Family" },
  { value: "engagement", label: "Engagement" },
  { value: "prewedding", label: "Pre-wedding" },
  { value: "wedding", label: "Wedding" },
  { value: "other", label: "Other memories" }
];

interface GalleryForm {
  section: string;
  caption: string;
  altText: string;
  visible: boolean;
  order: string;
}

const emptyForm: GalleryForm = {
  section: "couple",
  caption: "",
  altText: "",
  visible: true,
  order: "0"
};

function sectionLabel(value: string) {
  return sections.find((section) => section.value === value)?.label ?? value;
}

export function GalleryPage() {
  const query = useQuery({ queryKey: ["admin", "gallery"], queryFn: api.admin.gallery });
  const queryClient = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [addSection, setAddSection] = useState("couple");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<GalleryAdminImage | null>(null);
  const [form, setForm] = useState<GalleryForm>(emptyForm);
  const [error, setError] = useState("");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["public-site"] });
  };

  const create = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.admin.createGallery(payload),
    onSuccess: () => {
      invalidate();
      toast.success("Photograph added to the gallery.");
      setPickerOpen(false);
    },
    onError: (caught) => toast.error(caught instanceof ApiError ? caught.message : "The photograph could not be added.")
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => api.admin.updateGallery(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Gallery photograph updated.");
      setEditing(null);
    },
    onError: (caught) => {
      const message = caught instanceof ApiError ? caught.message : "The photograph could not be updated.";
      setError(message);
      toast.error(message);
    }
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.admin.deleteGallery(id),
    onSuccess: () => {
      invalidate();
      toast.success("Photograph removed from the gallery.");
    },
    onError: (caught) => toast.error(caught instanceof ApiError ? caught.message : "The photograph could not be removed.")
  });

  const chooseImage = (asset: MediaAsset) => {
    const nextOrder = (query.data?.length ?? 0) + 1;
    create.mutate({
      mediaId: asset.id,
      section: addSection,
      caption: asset.caption ?? null,
      altText: asset.altText ?? null,
      visible: true,
      order: nextOrder
    });
  };

  const openEdit = (image: GalleryAdminImage) => {
    setError("");
    setEditing(image);
    setForm({
      section: image.section,
      caption: image.caption ?? "",
      altText: image.altText ?? "",
      visible: image.visible,
      order: String(image.order)
    });
  };

  const submitEdit = () => {
    if (!editing) return;
    update.mutate({
      id: editing.id,
      payload: {
        section: form.section,
        caption: form.caption.trim() || null,
        altText: form.altText.trim() || null,
        visible: form.visible,
        order: Number(form.order) || 0
      }
    });
  };

  const requestDelete = async (image: GalleryAdminImage) => {
    const ok = await confirm({
      title: "Remove this photograph?",
      message: "The photograph will be removed from the gallery. The original file remains in your media library.",
      confirmLabel: "Remove photograph",
      tone: "danger"
    });
    if (ok) remove.mutate(image.id);
  };

  const images = useMemo(() => query.data ?? [], [query.data]);
  const filtered = filter === "all" ? images : images.filter((image) => image.section === filter);
  const counts = useMemo(() => {
    const result: Record<string, number> = { all: images.length };
    for (const section of sections) {
      result[section.value] = images.filter((image) => image.section === section.value).length;
    }
    return result;
  }, [images]);

  if (query.isLoading) return <LoadingScreen label="Curating the gallery" />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content"
        title="Gallery"
        description="A curated collection of photographs, arranged by moment and mood."
        actions={
          <>
            <div className="hidden items-center gap-2 sm:flex">
              <label htmlFor="gallery-add-section" className="text-[0.55rem] uppercase tracking-[0.16em] text-[#a08e80]">Add to</label>
              <select id="gallery-add-section" value={addSection} onChange={(event) => setAddSection(event.target.value)} className="admin-input h-10 w-40 py-1">
                {sections.map((section) => (
                  <option key={section.value} value={section.value}>{section.label}</option>
                ))}
              </select>
            </div>
            <AdminButton onClick={() => setPickerOpen(true)}>
              <ImagePlus className="h-3.5 w-3.5" />
              Add photograph
            </AdminButton>
          </>
        }
      />

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-[#e7dccd] bg-white p-1.5">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={cn(
            "shrink-0 rounded-lg px-3 py-2 text-[0.6rem] font-medium uppercase tracking-[0.12em] transition",
            filter === "all" ? "bg-[#762f43] text-white" : "text-[#8a776a] hover:bg-[#faf4eb] hover:text-[#49372f]"
          )}
        >
          All · {counts.all}
        </button>
        {sections.map((section) => (
          <button
            key={section.value}
            type="button"
            onClick={() => setFilter(section.value)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-[0.6rem] font-medium uppercase tracking-[0.12em] transition",
              filter === section.value ? "bg-[#762f43] text-white" : "text-[#8a776a] hover:bg-[#faf4eb] hover:text-[#49372f]"
            )}
          >
            {section.label} · {counts[section.value] ?? 0}
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <Panel noPadding>
          <EmptyState
            icon={<Images className="h-6 w-6" />}
            title={images.length ? "No photographs in this section" : "Your gallery is waiting"}
            description={images.length ? "Add a photograph to this section or choose another." : "Choose images from your media library to build a beautiful gallery."}
            action={<AdminButton onClick={() => setPickerOpen(true)}>Add a photograph</AdminButton>}
          />
        </Panel>
      ) : filter === "all" ? (
        <div className="space-y-8">
          {sections.map((section) => {
            const group = filtered.filter((image) => image.section === section.value);
            if (!group.length) return null;
            return (
              <section key={section.value}>
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-2xl text-[#49372f]">{section.label}</h2>
                  <span className="h-px flex-1 bg-gradient-to-r from-[#e2d6c6] to-transparent" />
                  <span className="text-[0.55rem] uppercase tracking-[0.16em] text-[#a08e80]">{group.length} {group.length === 1 ? "photo" : "photos"}</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {group.map((image) => (
                    <GalleryCard key={image.id} image={image} onEdit={openEdit} onDelete={requestDelete} onToggle={(visible) => update.mutate({ id: image.id, payload: { visible } })} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {filtered.map((image) => (
            <GalleryCard key={image.id} image={image} onEdit={openEdit} onDelete={requestDelete} onToggle={(visible) => update.mutate({ id: image.id, payload: { visible } })} />
          ))}
        </div>
      )}

      <MediaPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} type="IMAGE" onSelect={chooseImage} />

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit gallery photograph"
        description="Choose where this photograph appears and how it is described."
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
            <div className="sm:col-span-2 overflow-hidden rounded-lg border border-[#e7dccd]">
              <img src={editing.media.url} alt={editing.altText ?? editing.media.originalName} className="aspect-[16/9] w-full object-cover" />
            </div>
            <Field label="Section" htmlFor="gallery-section">
              <select id="gallery-section" className="admin-input" value={form.section} onChange={(event) => setForm((current) => ({ ...current, section: event.target.value }))}>
                {sections.map((section) => (
                  <option key={section.value} value={section.value}>{section.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Display order" htmlFor="gallery-order" hint="Lower numbers appear first.">
              <input id="gallery-order" type="number" min={0} max={9999} className="admin-input" value={form.order} onChange={(event) => setForm((current) => ({ ...current, order: event.target.value }))} />
            </Field>
            <Field label="Caption" htmlFor="gallery-caption" className="sm:col-span-2">
              <input id="gallery-caption" className="admin-input" value={form.caption} onChange={(event) => setForm((current) => ({ ...current, caption: event.target.value }))} />
            </Field>
            <Field label="Alt text" htmlFor="gallery-alt" hint="Describe the photograph for screen readers." className="sm:col-span-2">
              <input id="gallery-alt" className="admin-input" value={form.altText} onChange={(event) => setForm((current) => ({ ...current, altText: event.target.value }))} />
            </Field>
            <div className="sm:col-span-2">
              <Toggle checked={form.visible} onChange={(value) => setForm((current) => ({ ...current, visible: value }))} label="Show in the gallery" description="Hidden photographs remain in the studio." />
            </div>
            {error ? <p className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[0.75rem] text-red-700">{error}</p> : null}
          </div>
        ) : null}
      </Modal>

      <p className="flex items-center gap-2 text-[0.62rem] leading-relaxed text-[#a08e80]">
        <GalleryVerticalEnd className="h-3.5 w-3.5 shrink-0" />
        The gallery layout can be changed in the Theme studio. Photographs are served from your persistent media library.
      </p>
    </div>
  );
}

function GalleryCard({
  image,
  onEdit,
  onDelete,
  onToggle
}: {
  image: GalleryAdminImage;
  onEdit: (image: GalleryAdminImage) => void;
  onDelete: (image: GalleryAdminImage) => void;
  onToggle: (visible: boolean) => void;
}) {
  return (
    <article className="group overflow-hidden rounded-xl border border-[#e7dccd] bg-white shadow-[0_18px_50px_-42px_rgba(73,55,47,0.55)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f5ebdd]">
        <img src={image.media.url} alt={image.altText ?? image.media.originalName} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2f0e18]/70 to-transparent p-3">
          {image.caption ? <p className="line-clamp-2 text-[0.68rem] text-white">{image.caption}</p> : null}
        </div>
        <span className="absolute left-2 top-2">
          <Badge tone={image.visible ? "success" : "neutral"}>{image.visible ? "Visible" : "Hidden"}</Badge>
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <span className="text-[0.54rem] uppercase tracking-[0.12em] text-[#a08e80]">{sectionLabel(image.section)} · {image.order}</span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onToggle(!image.visible)} className="grid h-7 w-7 place-items-center rounded-full text-[#a08e80] transition hover:bg-[#f5ebdd] hover:text-[#762f43]" aria-label={image.visible ? "Hide photograph" : "Show photograph"}>
            {image.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
          <button type="button" onClick={() => onEdit(image)} className="grid h-7 w-7 place-items-center rounded-full text-[#a08e80] transition hover:bg-[#f5ebdd] hover:text-[#762f43]" aria-label="Edit photograph">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => onDelete(image)} className="grid h-7 w-7 place-items-center rounded-full text-[#a08e80] transition hover:bg-red-50 hover:text-red-600" aria-label="Remove photograph">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
