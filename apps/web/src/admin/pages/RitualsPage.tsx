import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CircleDot,
  Eye,
  EyeOff,
  Flame,
  Flower2,
  HandHeart,
  HeartHandshake,
  Link2,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import type { AdminRitual } from "../../types";
import { AdminButton, Badge, EmptyState, Field, LoadingScreen, Modal, PageHeader, Panel, Toggle } from "../components/AdminUI";
import { useConfirm, useToast } from "../AdminProviders";
import { formatDateMedium, formatTime } from "../../lib/utils";

const iconOptions: Array<{ value: string; label: string; icon: LucideIcon }> = [
  { value: "ganesh", label: "Ganesh — blessings", icon: Sparkles },
  { value: "kanyadaan", label: "Kanyadaan — giving away", icon: HandHeart },
  { value: "varmala", label: "Varmala — garlands", icon: Flower2 },
  { value: "havan", label: "Havan — sacred fire", icon: Flame },
  { value: "phere", label: "Phere — seven vows", icon: RefreshCw },
  { value: "sindoor", label: "Sindoor — vermilion", icon: CircleDot },
  { value: "mangalsutra", label: "Mangalsutra — union", icon: Link2 },
  { value: "ashirwad", label: "Ashirwad — blessings", icon: HeartHandshake }
];

interface RitualForm {
  name: string;
  description: string;
  ritualDate: string;
  ritualTime: string;
  icon: string;
  visible: boolean;
  order: string;
}

const emptyForm: RitualForm = {
  name: "",
  description: "",
  ritualDate: "",
  ritualTime: "",
  icon: "ganesh",
  visible: true,
  order: "0"
};

export function RitualsPage() {
  const query = useQuery({ queryKey: ["admin", "rituals"], queryFn: api.admin.rituals });
  const queryClient = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminRitual | null>(null);
  const [form, setForm] = useState<RitualForm>(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) setError("");
  }, [open]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "rituals"] });
    queryClient.invalidateQueries({ queryKey: ["public-site"] });
  };

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editing ? api.admin.updateRitual(editing.id, payload) : api.admin.createRitual(payload),
    onSuccess: () => {
      invalidate();
      toast.success(editing ? "Ritual updated." : "Ritual added.");
      setOpen(false);
      setEditing(null);
    },
    onError: (caught) => {
      const message = caught instanceof ApiError ? caught.message : "The ritual could not be saved.";
      setError(message);
      toast.error(message);
    }
  });

  const toggle = useMutation({
    mutationFn: ({ id, visible }: { id: string; visible: boolean }) => api.admin.updateRitual(id, { visible }),
    onSuccess: invalidate,
    onError: (caught) => toast.error(caught instanceof ApiError ? caught.message : "Visibility could not be changed.")
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.admin.deleteRitual(id),
    onSuccess: () => {
      invalidate();
      toast.success("Ritual removed.");
    },
    onError: (caught) => toast.error(caught instanceof ApiError ? caught.message : "The ritual could not be removed.")
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, order: String(query.data?.length ?? 0) });
    setOpen(true);
  };

  const openEdit = (ritual: AdminRitual) => {
    setEditing(ritual);
    setForm({
      name: ritual.name,
      description: ritual.description ?? "",
      ritualDate: ritual.ritualDate ?? "",
      ritualTime: ritual.ritualTime ?? "",
      icon: ritual.icon ?? "ganesh",
      visible: ritual.visible,
      order: String(ritual.order)
    });
    setOpen(true);
  };

  const submit = () => {
    setError("");
    if (!form.name.trim()) {
      setError("Give the ritual a name.");
      return;
    }
    save.mutate({
      name: form.name.trim(),
      description: form.description.trim() || null,
      ritualDate: form.ritualDate || null,
      ritualTime: form.ritualTime || null,
      icon: form.icon || null,
      visible: form.visible,
      order: Number(form.order) || 0
    });
  };

  const requestDelete = async (ritual: AdminRitual) => {
    const ok = await confirm({
      title: `Remove ${ritual.name}?`,
      message: "This ritual will be removed from the Vivah Sanskar section of the invitation.",
      confirmLabel: "Remove ritual",
      tone: "danger"
    });
    if (ok) remove.mutate(ritual.id);
  };

  if (query.isLoading) return <LoadingScreen label="Loading rituals" />;
  const rituals = query.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="The Invitation"
        title="Vivah rituals"
        description="The sacred steps of your ceremony, presented as a graceful sequence."
        actions={
          <AdminButton onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" />
            Add ritual
          </AdminButton>
        }
      />

      {!rituals.length ? (
        <Panel noPadding>
          <EmptyState
            icon={<Sparkles className="h-6 w-6" />}
            title="No rituals yet"
            description="Add the rites and traditions that will shape your Vivah Sanskar section."
            action={<AdminButton onClick={openCreate}>Add the first ritual</AdminButton>}
          />
        </Panel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rituals.map((ritual, index) => {
            const Icon = iconOptions.find((option) => option.value === ritual.icon)?.icon ?? Sparkles;
            return (
              <article key={ritual.id} className="flex flex-col rounded-xl border border-[#e7dccd] bg-white p-5 shadow-[0_18px_50px_-42px_rgba(73,55,47,0.55)]">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-[#e3cfaa] bg-[#f8f0e2] text-[#b89555]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-2xl text-[#e2d6c6]">{String(index + 1).padStart(2, "0")}</span>
                    <Badge tone={ritual.visible ? "success" : "neutral"}>{ritual.visible ? "Visible" : "Hidden"}</Badge>
                  </div>
                </div>
                <h2 className="mt-4 font-display text-2xl leading-tight text-[#49372f]">{ritual.name}</h2>
                {ritual.ritualDate || ritual.ritualTime ? (
                  <p className="mt-1 text-[0.56rem] uppercase tracking-[0.18em] text-[#b89555]">
                    {[ritual.ritualDate ? formatDateMedium(ritual.ritualDate) : "", formatTime(ritual.ritualTime)].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
                {ritual.description ? <p className="mt-3 flex-1 text-[0.74rem] leading-relaxed text-[#8a776a]">{ritual.description}</p> : <div className="flex-1" />}
                <div className="mt-4 flex items-center justify-between border-t border-[#f0e6d8] pt-3">
                  <span className="text-[0.54rem] uppercase tracking-[0.14em] text-[#a08e80]">{ritual.icon ?? "sparkles"} · order {ritual.order}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => toggle.mutate({ id: ritual.id, visible: !ritual.visible })} className="grid h-7 w-7 place-items-center rounded-full text-[#a08e80] transition hover:bg-[#f5ebdd] hover:text-[#762f43]" aria-label={ritual.visible ? "Hide ritual" : "Show ritual"}>
                      {ritual.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button type="button" onClick={() => openEdit(ritual)} className="grid h-7 w-7 place-items-center rounded-full text-[#a08e80] transition hover:bg-[#f5ebdd] hover:text-[#762f43]" aria-label={`Edit ${ritual.name}`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => requestDelete(ritual)} className="grid h-7 w-7 place-items-center rounded-full text-[#a08e80] transition hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${ritual.name}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit ritual" : "Add ritual"}
        description="Rituals appear in the Vivah Sanskar section in display order."
        size="lg"
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setOpen(false)}>Cancel</AdminButton>
            <AdminButton onClick={submit} loading={save.isPending}>{editing ? "Save changes" : "Add ritual"}</AdminButton>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ritual name" htmlFor="ritual-name" required className="sm:col-span-2">
            <input id="ritual-name" className="admin-input" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ganesh Puja" />
          </Field>
          <Field label="Icon" htmlFor="ritual-icon">
            <select id="ritual-icon" className="admin-input" value={form.icon} onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))}>
              {iconOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Display order" htmlFor="ritual-order" hint="Lower numbers appear first.">
            <input id="ritual-order" type="number" min={0} max={9999} className="admin-input" value={form.order} onChange={(event) => setForm((current) => ({ ...current, order: event.target.value }))} />
          </Field>
          <Field label="Date" htmlFor="ritual-date">
            <input id="ritual-date" type="date" className="admin-input" value={form.ritualDate} onChange={(event) => setForm((current) => ({ ...current, ritualDate: event.target.value }))} />
          </Field>
          <Field label="Time" htmlFor="ritual-time">
            <input id="ritual-time" type="time" className="admin-input" value={form.ritualTime} onChange={(event) => setForm((current) => ({ ...current, ritualTime: event.target.value }))} />
          </Field>
          <Field label="Description" htmlFor="ritual-description" className="sm:col-span-2">
            <textarea id="ritual-description" className="admin-input min-h-[6rem]" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          </Field>
          <div className="sm:col-span-2 pt-1">
            <Toggle checked={form.visible} onChange={(value) => setForm((current) => ({ ...current, visible: value }))} label="Show on invitation" description="Hidden rituals remain in the studio." />
          </div>
        </div>
        {error ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[0.75rem] text-red-700">{error}</p> : null}
      </Modal>
    </div>
  );
}
