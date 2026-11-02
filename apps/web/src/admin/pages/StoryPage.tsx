import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookHeart, CalendarDays, Eye, EyeOff, Image as ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import type { AdminStoryMoment } from "../../types";
import { AdminButton, Badge, EmptyState, Field, LoadingScreen, Modal, PageHeader, Panel, Toggle } from "../components/AdminUI";
import { MediaField } from "../components/MediaPicker";
import { useConfirm, useToast } from "../AdminProviders";
import { formatDateMedium } from "../../lib/utils";

interface StoryForm {
  title: string;
  momentDate: string;
  description: string;
  imageUrl: string;
  visible: boolean;
  order: string;
}

const emptyForm: StoryForm = {
  title: "",
  momentDate: "",
  description: "",
  imageUrl: "",
  visible: true,
  order: "0"
};

export function StoryPage() {
  const query = useQuery({ queryKey: ["admin", "story"], queryFn: api.admin.story });
  const queryClient = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminStoryMoment | null>(null);
  const [form, setForm] = useState<StoryForm>(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) setError("");
  }, [open]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "story"] });
    queryClient.invalidateQueries({ queryKey: ["public-site"] });
  };

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editing ? api.admin.updateStory(editing.id, payload) : api.admin.createStory(payload),
    onSuccess: () => {
      invalidate();
      toast.success(editing ? "Story moment updated." : "Story moment added.");
      setOpen(false);
      setEditing(null);
    },
    onError: (caught) => {
      const message = caught instanceof ApiError ? caught.message : "The story moment could not be saved.";
      setError(message);
      toast.error(message);
    }
  });

  const toggle = useMutation({
    mutationFn: ({ id, visible }: { id: string; visible: boolean }) => api.admin.updateStory(id, { visible }),
    onSuccess: invalidate,
    onError: (caught) => toast.error(caught instanceof ApiError ? caught.message : "Visibility could not be changed.")
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.admin.deleteStory(id),
    onSuccess: () => {
      invalidate();
      toast.success("Story moment removed.");
    },
    onError: (caught) => toast.error(caught instanceof ApiError ? caught.message : "The story moment could not be removed.")
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, order: String(query.data?.length ?? 0) });
    setOpen(true);
  };

  const openEdit = (moment: AdminStoryMoment) => {
    setEditing(moment);
    setForm({
      title: moment.title,
      momentDate: moment.momentDate ?? "",
      description: moment.description ?? "",
      imageUrl: moment.imageUrl ?? "",
      visible: moment.visible,
      order: String(moment.order)
    });
    setOpen(true);
  };

  const submit = () => {
    setError("");
    if (!form.title.trim()) {
      setError("Give this moment a title.");
      return;
    }
    save.mutate({
      title: form.title.trim(),
      momentDate: form.momentDate || null,
      description: form.description.trim() || null,
      imageUrl: form.imageUrl.trim() || null,
      visible: form.visible,
      order: Number(form.order) || 0
    });
  };

  const requestDelete = async (moment: AdminStoryMoment) => {
    const ok = await confirm({
      title: `Remove “${moment.title}”?`,
      message: "This moment will disappear from the Our Story section of the invitation.",
      confirmLabel: "Remove moment",
      tone: "danger"
    });
    if (ok) remove.mutate(moment.id);
  };

  if (query.isLoading) return <LoadingScreen label="Loading your story" />;
  const moments = query.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="The Invitation"
        title="Our story"
        description="The milestones, little moments, and memories that brought you here."
        actions={
          <AdminButton onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" />
            Add moment
          </AdminButton>
        }
      />

      {!moments.length ? (
        <Panel noPadding>
          <EmptyState
            icon={<BookHeart className="h-6 w-6" />}
            title="Your story begins here"
            description="Add the first chapter of the journey that led to your wedding day."
            action={<AdminButton onClick={openCreate}>Add the first moment</AdminButton>}
          />
        </Panel>
      ) : (
        <div className="space-y-4">
          {moments.map((moment, index) => (
            <article key={moment.id} className="overflow-hidden rounded-xl border border-[#e7dccd] bg-white shadow-[0_18px_50px_-42px_rgba(73,55,47,0.55)]">
              <div className="grid sm:grid-cols-[13rem_1fr]">
                <div className="relative aspect-[4/3] bg-[#f5ebdd] sm:aspect-auto sm:min-h-[10rem]">
                  {moment.imageUrl ? (
                    <img src={moment.imageUrl} alt={moment.title} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="grid h-full place-items-center text-[#b89555]">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                  <span className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-[#762f43] font-display text-sm text-[#f7e6c2]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-col p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="font-display text-2xl leading-tight text-[#49372f]">{moment.title}</h2>
                      {moment.momentDate ? (
                        <p className="mt-1 inline-flex items-center gap-1.5 text-[0.56rem] uppercase tracking-[0.18em] text-[#b89555]">
                          <CalendarDays className="h-3 w-3" />
                          {formatDateMedium(moment.momentDate)}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge tone={moment.visible ? "success" : "neutral"}>{moment.visible ? "Visible" : "Hidden"}</Badge>
                      <span className="text-[0.54rem] uppercase tracking-[0.14em] text-[#a08e80]">order {moment.order}</span>
                    </div>
                  </div>
                  {moment.description ? <p className="mt-3 flex-1 text-[0.78rem] leading-relaxed text-[#8a776a]">{moment.description}</p> : <div className="flex-1" />}
                  <div className="mt-4 flex items-center justify-end gap-1 border-t border-[#f0e6d8] pt-3">
                    <button type="button" onClick={() => toggle.mutate({ id: moment.id, visible: !moment.visible })} className="grid h-8 w-8 place-items-center rounded-full text-[#a08e80] transition hover:bg-[#f5ebdd] hover:text-[#762f43]" aria-label={moment.visible ? "Hide moment" : "Show moment"}>
                      {moment.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button type="button" onClick={() => openEdit(moment)} className="grid h-8 w-8 place-items-center rounded-full text-[#a08e80] transition hover:bg-[#f5ebdd] hover:text-[#762f43]" aria-label={`Edit ${moment.title}`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => requestDelete(moment)} className="grid h-8 w-8 place-items-center rounded-full text-[#a08e80] transition hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${moment.title}`}>
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
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit story moment" : "Add story moment"}
        description="Each moment appears along the timeline in the Our Story section."
        size="lg"
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setOpen(false)}>Cancel</AdminButton>
            <AdminButton onClick={submit} loading={save.isPending}>{editing ? "Save changes" : "Add moment"}</AdminButton>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" htmlFor="story-title" required className="sm:col-span-2">
            <input id="story-title" className="admin-input" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="The day we met" />
          </Field>
          <Field label="Date" htmlFor="story-date" hint="Optional. Shown above the description.">
            <input id="story-date" type="date" className="admin-input" value={form.momentDate} onChange={(event) => setForm((current) => ({ ...current, momentDate: event.target.value }))} />
          </Field>
          <Field label="Display order" htmlFor="story-order" hint="Lower numbers appear first.">
            <input id="story-order" type="number" min={0} max={9999} className="admin-input" value={form.order} onChange={(event) => setForm((current) => ({ ...current, order: event.target.value }))} />
          </Field>
          <Field label="Description" htmlFor="story-description" className="sm:col-span-2">
            <textarea id="story-description" className="admin-input min-h-[6rem]" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          </Field>
          <div className="sm:col-span-2">
            <MediaField label="Photograph (optional)" value={form.imageUrl} onChange={(value) => setForm((current) => ({ ...current, imageUrl: value ?? "" }))} />
          </div>
          <div className="sm:col-span-2 pt-1">
            <Toggle checked={form.visible} onChange={(value) => setForm((current) => ({ ...current, visible: value }))} label="Show on invitation" description="Hidden moments remain in the studio." />
          </div>
        </div>
        {error ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[0.75rem] text-red-700">{error}</p> : null}
      </Modal>
    </div>
  );
}
