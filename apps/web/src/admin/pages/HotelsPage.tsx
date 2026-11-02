import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Hotel as HotelIcon, MapPin, Pencil, Phone, Plus, Trash2 } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import type { Hotel } from "../../types";
import { AdminButton, Badge, EmptyState, Field, LoadingScreen, Modal, PageHeader, Panel, Toggle } from "../components/AdminUI";
import { useConfirm, useToast } from "../AdminProviders";

interface HotelForm {
  name: string;
  description: string;
  distance: string;
  phone: string;
  mapsUrl: string;
  visible: boolean;
  order: string;
}

const emptyForm: HotelForm = {
  name: "",
  description: "",
  distance: "",
  phone: "",
  mapsUrl: "",
  visible: true,
  order: "0"
};

export function HotelsPage() {
  const query = useQuery({ queryKey: ["admin", "hotels"], queryFn: api.admin.hotels });
  const queryClient = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Hotel | null>(null);
  const [form, setForm] = useState<HotelForm>(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) setError("");
  }, [open]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "hotels"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "wedding"] });
    queryClient.invalidateQueries({ queryKey: ["public-site"] });
  };

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editing ? api.admin.updateHotel(editing.id, payload) : api.admin.createHotel(payload),
    onSuccess: () => {
      invalidate();
      toast.success(editing ? "Hotel updated." : "Hotel added.");
      setOpen(false);
      setEditing(null);
    },
    onError: (caught) => {
      const message = caught instanceof ApiError ? caught.message : "The hotel could not be saved.";
      setError(message);
      toast.error(message);
    }
  });

  const toggle = useMutation({
    mutationFn: ({ id, visible }: { id: string; visible: boolean }) => api.admin.updateHotel(id, { visible }),
    onSuccess: invalidate,
    onError: (caught) => toast.error(caught instanceof ApiError ? caught.message : "Visibility could not be changed.")
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.admin.deleteHotel(id),
    onSuccess: () => {
      invalidate();
      toast.success("Hotel removed.");
    },
    onError: (caught) => toast.error(caught instanceof ApiError ? caught.message : "The hotel could not be removed.")
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, order: String(query.data?.length ?? 0) });
    setOpen(true);
  };

  const openEdit = (hotel: Hotel) => {
    setEditing(hotel);
    setForm({
      name: hotel.name,
      description: hotel.description ?? "",
      distance: hotel.distance ?? "",
      phone: hotel.phone ?? "",
      mapsUrl: hotel.mapsUrl ?? "",
      visible: hotel.visible ?? true,
      order: String(hotel.order)
    });
    setOpen(true);
  };

  const submit = () => {
    setError("");
    if (!form.name.trim()) {
      setError("Give the hotel a name.");
      return;
    }
    save.mutate({
      name: form.name.trim(),
      description: form.description.trim() || null,
      distance: form.distance.trim() || null,
      phone: form.phone.trim() || null,
      mapsUrl: form.mapsUrl.trim() || null,
      visible: form.visible,
      order: Number(form.order) || 0
    });
  };

  const requestDelete = async (hotel: Hotel) => {
    const ok = await confirm({
      title: `Remove ${hotel.name}?`,
      message: "This hotel will disappear from the nearby stays list on the invitation.",
      confirmLabel: "Remove hotel",
      tone: "danger"
    });
    if (ok) remove.mutate(hotel.id);
  };

  if (query.isLoading) return <LoadingScreen label="Loading hotels" />;
  const hotels = query.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="The Invitation"
        title="Nearby hotels"
        description="Considered places for travelling guests to stay close to the celebration."
        actions={
          <AdminButton onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" />
            Add hotel
          </AdminButton>
        }
      />

      {!hotels.length ? (
        <Panel noPadding>
          <EmptyState
            icon={<HotelIcon className="h-6 w-6" />}
            title="No hotels added"
            description="Help your guests find a comfortable place to stay near the venue."
            action={<AdminButton onClick={openCreate}>Add the first hotel</AdminButton>}
          />
        </Panel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {hotels.map((hotel) => (
            <article key={hotel.id} className="flex flex-col rounded-xl border border-[#e7dccd] bg-white p-5 shadow-[0_18px_50px_-42px_rgba(73,55,47,0.55)]">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full border border-[#e3cfaa] bg-[#f8f0e2] text-[#b89555]">
                  <HotelIcon className="h-4 w-4" />
                </span>
                <Badge tone={hotel.visible ? "success" : "neutral"}>{hotel.visible ? "Visible" : "Hidden"}</Badge>
              </div>
              <h2 className="mt-4 font-display text-2xl leading-tight text-[#49372f]">{hotel.name}</h2>
              {hotel.distance ? (
                <p className="mt-1 inline-flex items-center gap-1.5 text-[0.58rem] uppercase tracking-[0.16em] text-[#b89555]">
                  <MapPin className="h-3 w-3" />
                  {hotel.distance}
                </p>
              ) : null}
              {hotel.description ? <p className="mt-3 flex-1 text-[0.74rem] leading-relaxed text-[#8a776a]">{hotel.description}</p> : <div className="flex-1" />}
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#f0e6d8] pt-3">
                {hotel.phone ? (
                  <a href={`tel:${hotel.phone}`} className="inline-flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.12em] text-[#762f43] hover:text-[#b89555]">
                    <Phone className="h-3 w-3" />
                    Call
                  </a>
                ) : null}
                {hotel.mapsUrl ? (
                  <a href={hotel.mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.12em] text-[#762f43] hover:text-[#b89555]">
                    <MapPin className="h-3 w-3" />
                    Directions
                  </a>
                ) : null}
                <span className="ml-auto flex items-center gap-1">
                  <button type="button" onClick={() => toggle.mutate({ id: hotel.id, visible: !hotel.visible })} className="grid h-7 w-7 place-items-center rounded-full text-[#a08e80] transition hover:bg-[#f5ebdd] hover:text-[#762f43]" aria-label={hotel.visible ? "Hide hotel" : "Show hotel"}>
                    {hotel.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                  <button type="button" onClick={() => openEdit(hotel)} className="grid h-7 w-7 place-items-center rounded-full text-[#a08e80] transition hover:bg-[#f5ebdd] hover:text-[#762f43]" aria-label={`Edit ${hotel.name}`}>
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => requestDelete(hotel)} className="grid h-7 w-7 place-items-center rounded-full text-[#a08e80] transition hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${hotel.name}`}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit hotel" : "Add hotel"}
        description="Recommendations appear in the venue section of the invitation."
        size="lg"
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setOpen(false)}>Cancel</AdminButton>
            <AdminButton onClick={submit} loading={save.isPending}>{editing ? "Save changes" : "Add hotel"}</AdminButton>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Hotel name" htmlFor="hotel-name" required className="sm:col-span-2">
            <input id="hotel-name" className="admin-input" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="The Raj Palace" />
          </Field>
          <Field label="Distance from venue" htmlFor="hotel-distance" hint="For example: 2.4 km from the venue.">
            <input id="hotel-distance" className="admin-input" value={form.distance} onChange={(event) => setForm((current) => ({ ...current, distance: event.target.value }))} />
          </Field>
          <Field label="Reservations phone" htmlFor="hotel-phone">
            <input id="hotel-phone" className="admin-input" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
          </Field>
          <Field label="Google Maps link" htmlFor="hotel-maps" className="sm:col-span-2">
            <input id="hotel-maps" className="admin-input" value={form.mapsUrl} onChange={(event) => setForm((current) => ({ ...current, mapsUrl: event.target.value }))} placeholder="https://maps.google.com/…" />
          </Field>
          <Field label="Description" htmlFor="hotel-description" className="sm:col-span-2">
            <textarea id="hotel-description" className="admin-input min-h-[5rem]" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          </Field>
          <Field label="Display order" htmlFor="hotel-order" hint="Lower numbers appear first.">
            <input id="hotel-order" type="number" min={0} max={9999} className="admin-input" value={form.order} onChange={(event) => setForm((current) => ({ ...current, order: event.target.value }))} />
          </Field>
          <div className="pt-1">
            <Toggle checked={form.visible} onChange={(value) => setForm((current) => ({ ...current, visible: value }))} label="Show on invitation" description="Hidden hotels remain in the studio." />
          </div>
        </div>
        {error ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[0.75rem] text-red-700">{error}</p> : null}
      </Modal>
    </div>
  );
}
