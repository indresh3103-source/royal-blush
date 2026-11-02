import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  ArchiveRestore,
  CalendarDays,
  CalendarPlus,
  Eye,
  EyeOff,
  MapPin,
  Pencil,
  Plus,
  Shirt,
  Trash2
} from "lucide-react";
import { api, ApiError, downloadIcs, eventIcsUrl } from "../../lib/api";
import type { AdminEvent } from "../../types";
import { AdminButton, Badge, EmptyState, Field, LoadingScreen, Modal, PageHeader, Panel, Toggle } from "../components/AdminUI";
import { MediaField } from "../components/MediaPicker";
import { useConfirm, useToast } from "../AdminProviders";
import { formatDateMedium, formatMonth, formatDay, formatTimeRange } from "../../lib/utils";

interface EventForm {
  name: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  timezone: string;
  venueName: string;
  venueAddress: string;
  city: string;
  state: string;
  pinCode: string;
  mapsUrl: string;
  dressCode: string;
  imageUrl: string;
  contactName: string;
  contactPhone: string;
  parkingInfo: string;
  visible: boolean;
  archived: boolean;
  order: string;
}

const emptyForm: EventForm = {
  name: "",
  description: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  timezone: "Asia/Kolkata",
  venueName: "",
  venueAddress: "",
  city: "",
  state: "",
  pinCode: "",
  mapsUrl: "",
  dressCode: "",
  imageUrl: "",
  contactName: "",
  contactPhone: "",
  parkingInfo: "",
  visible: true,
  archived: false,
  order: "0"
};

function nullable(value: string) {
  return value.trim() ? value.trim() : null;
}

export function EventsPage() {
  const eventsQuery = useQuery({ queryKey: ["admin", "events"], queryFn: api.admin.events });
  const weddingQuery = useQuery({ queryKey: ["admin", "wedding"], queryFn: api.admin.wedding });
  const queryClient = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminEvent | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [error, setError] = useState("");

  const weddingTimezone = weddingQuery.data?.timezone ?? "Asia/Kolkata";

  useEffect(() => {
    if (!open) setError("");
  }, [open]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["public-site"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "rsvps"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "rsvp-stats"] });
  };

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editing ? api.admin.updateEvent(editing.id, payload) : api.admin.createEvent(payload),
    onSuccess: () => {
      invalidate();
      toast.success(editing ? "Event updated." : "Event added to the celebration.");
      setOpen(false);
      setEditing(null);
    },
    onError: (caught) => {
      const message = caught instanceof ApiError ? caught.message : "The event could not be saved.";
      setError(message);
      toast.error(message);
    }
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => api.admin.updateEvent(id, payload),
    onSuccess: () => {
      invalidate();
    },
    onError: (caught) => toast.error(caught instanceof ApiError ? caught.message : "The event could not be updated.")
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.admin.deleteEvent(id),
    onSuccess: () => {
      invalidate();
      toast.success("Event removed.");
    },
    onError: (caught) => toast.error(caught instanceof ApiError ? caught.message : "The event could not be removed.")
  });

  const events = useMemo(() => {
    const list = eventsQuery.data ?? [];
    return [...list].sort((left, right) => {
      const dateCompare = left.eventDate.localeCompare(right.eventDate);
      return dateCompare !== 0 ? dateCompare : left.startTime.localeCompare(right.startTime);
    });
  }, [eventsQuery.data]);

  const openCreate = () => {
    const next = eventsQuery.data?.length ?? 0;
    setEditing(null);
    setForm({ ...emptyForm, timezone: weddingTimezone, order: String(next) });
    setOpen(true);
  };

  const openEdit = (event: AdminEvent) => {
    setEditing(event);
    setForm({
      name: event.name,
      description: event.description ?? "",
      eventDate: event.eventDate,
      startTime: event.startTime,
      endTime: event.endTime ?? "",
      timezone: event.timezone ?? weddingTimezone,
      venueName: event.venueName ?? "",
      venueAddress: event.venueAddress ?? "",
      city: event.city ?? "",
      state: event.state ?? "",
      pinCode: event.pinCode ?? "",
      mapsUrl: event.mapsUrl ?? "",
      dressCode: event.dressCode ?? "",
      imageUrl: event.imageUrl ?? "",
      contactName: event.contactName ?? "",
      contactPhone: event.contactPhone ?? "",
      parkingInfo: event.parkingInfo ?? "",
      visible: event.visible,
      archived: event.archived,
      order: String(event.order)
    });
    setOpen(true);
  };

  const submit = () => {
    setError("");
    if (!form.name.trim()) {
      setError("Give the event a name.");
      return;
    }
    if (!form.eventDate || !form.startTime) {
      setError("Choose a date and start time for the event.");
      return;
    }
    if (form.endTime && form.endTime <= form.startTime) {
      setError("The end time should be later than the start time.");
      return;
    }
    save.mutate({
      name: form.name.trim(),
      description: nullable(form.description),
      eventDate: form.eventDate,
      startTime: form.startTime,
      endTime: nullable(form.endTime),
      timezone: form.timezone || null,
      venueName: nullable(form.venueName),
      venueAddress: nullable(form.venueAddress),
      city: nullable(form.city),
      state: nullable(form.state),
      pinCode: nullable(form.pinCode),
      mapsUrl: nullable(form.mapsUrl),
      dressCode: nullable(form.dressCode),
      imageUrl: nullable(form.imageUrl),
      contactName: nullable(form.contactName),
      contactPhone: nullable(form.contactPhone),
      parkingInfo: nullable(form.parkingInfo),
      visible: form.visible,
      archived: form.archived,
      order: Number(form.order) || 0
    });
  };

  const requestDelete = async (event: AdminEvent) => {
    const ok = await confirm({
      title: `Remove ${event.name}?`,
      message: "The event and its guest responses will be permanently removed. This cannot be undone.",
      confirmLabel: "Remove event",
      tone: "danger"
    });
    if (ok) remove.mutate(event.id);
  };

  if (eventsQuery.isLoading) return <LoadingScreen label="Loading events" />;
  if (eventsQuery.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="font-display text-2xl text-red-800">Events could not be loaded</h1>
        <AdminButton className="mt-4" variant="danger" onClick={() => eventsQuery.refetch()}>Try again</AdminButton>
      </div>
    );
  }

  const upcoming = events.filter((event) => !event.archived);
  const archived = events.filter((event) => event.archived);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="The Invitation"
        title="Events"
        description="Every celebration, ceremony, and gathering that guests can attend."
        actions={
          <AdminButton onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" />
            Add event
          </AdminButton>
        }
      />

      {!events.length ? (
        <Panel noPadding>
          <EmptyState
            icon={<CalendarDays className="h-6 w-6" />}
            title="No events yet"
            description="Add the ceremonies and celebrations that make up your wedding."
            action={<AdminButton onClick={openCreate}>Create the first event</AdminButton>}
          />
        </Panel>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-2">
            {upcoming.map((event) => {
              const timezone = event.timezone ?? weddingTimezone;
              return (
                <article key={event.id} className="overflow-hidden rounded-xl border border-[#e7dccd] bg-white shadow-[0_18px_50px_-42px_rgba(73,55,47,0.55)]">
                  <div className="flex gap-4 p-5">
                    <div className="grid h-20 w-16 shrink-0 place-items-center rounded-lg bg-[#762f43] text-center text-white">
                      <div>
                        <p className="text-[0.52rem] uppercase tracking-[0.18em] text-[#e8cf9b]">{formatMonth(event.eventDate, timezone)}</p>
                        <p className="font-display text-3xl leading-none">{formatDay(event.eventDate, timezone)}</p>
                        <p className="mt-0.5 text-[0.5rem] uppercase tracking-[0.14em] text-white/50">{formatDateMedium(event.eventDate, timezone).split(" ").slice(-1)}</p>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h2 className="font-display text-2xl leading-tight text-[#49372f]">{event.name}</h2>
                          <p className="mt-0.5 text-[0.6rem] uppercase tracking-[0.16em] text-[#b89555]">
                            {formatDateMedium(event.eventDate, timezone)} · {formatTimeRange(event.startTime, event.endTime)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge tone={event.visible ? "success" : "neutral"}>{event.visible ? "Visible" : "Hidden"}</Badge>
                          {event.archived ? <Badge tone="warning">Archived</Badge> : null}
                        </div>
                      </div>
                      {event.description ? <p className="mt-2 line-clamp-2 text-[0.72rem] leading-relaxed text-[#8a776a]">{event.description}</p> : null}
                      <div className="mt-3 space-y-1 text-[0.68rem] text-[#8a776a]">
                        {event.venueName ? (
                          <p className="flex items-start gap-1.5">
                            <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-[#b89555]" />
                            <span>{[event.venueName, event.city].filter(Boolean).join(", ")}</span>
                          </p>
                        ) : null}
                        {event.dressCode ? (
                          <p className="flex items-start gap-1.5">
                            <Shirt className="mt-0.5 h-3 w-3 shrink-0 text-[#b89555]" />
                            <span>{event.dressCode}</span>
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#f0e6d8] bg-[#fffdf9] px-5 py-3">
                    {event.visible && !event.archived ? (
                      <button
                        type="button"
                        onClick={() => downloadIcs(eventIcsUrl(event.id), `${event.name.replace(/\s+/g, "-").toLowerCase()}.ics`)}
                        className="inline-flex items-center gap-1.5 text-[0.58rem] font-medium uppercase tracking-[0.14em] text-[#762f43] transition hover:text-[#b89555]"
                      >
                        <CalendarPlus className="h-3.5 w-3.5" />
                        Calendar file
                      </button>
                    ) : (
                      <span className="text-[0.58rem] uppercase tracking-[0.14em] text-[#a08e80]">
                        {event.archived ? "Archived" : "Hidden"}
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => update.mutate({ id: event.id, payload: { visible: !event.visible } })} className="grid h-8 w-8 place-items-center rounded-full text-[#a08e80] transition hover:bg-[#f5ebdd] hover:text-[#762f43]" aria-label={event.visible ? "Hide event" : "Show event"}>
                        {event.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                      <button type="button" onClick={() => update.mutate({ id: event.id, payload: { archived: !event.archived } })} className="grid h-8 w-8 place-items-center rounded-full text-[#a08e80] transition hover:bg-[#f5ebdd] hover:text-[#762f43]" aria-label={event.archived ? "Restore event" : "Archive event"}>
                        {event.archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                      </button>
                      <button type="button" onClick={() => openEdit(event)} className="grid h-8 w-8 place-items-center rounded-full text-[#a08e80] transition hover:bg-[#f5ebdd] hover:text-[#762f43]" aria-label={`Edit ${event.name}`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => requestDelete(event)} className="grid h-8 w-8 place-items-center rounded-full text-[#a08e80] transition hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${event.name}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {archived.length ? (
            <Panel title="Archived events" description="Past celebrations kept for reference.">
              <div className="space-y-2">
                {archived.map((event) => (
                  <div key={event.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#f0e6d8] bg-[#faf4eb] px-4 py-3">
                    <div>
                      <p className="text-[0.82rem] font-medium text-[#49372f]">{event.name}</p>
                      <p className="text-[0.62rem] text-[#8a776a]">{formatDateMedium(event.eventDate, event.timezone ?? weddingTimezone)} · {formatTimeRange(event.startTime, event.endTime)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <AdminButton size="sm" variant="outline" onClick={() => update.mutate({ id: event.id, payload: { archived: false } })}>
                        <ArchiveRestore className="h-3 w-3" />
                        Restore
                      </AdminButton>
                      <button type="button" onClick={() => openEdit(event)} className="grid h-8 w-8 place-items-center rounded-full text-[#a08e80] transition hover:bg-white hover:text-[#762f43]" aria-label={`Edit ${event.name}`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          ) : null}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit event" : "Add event"}
        description="These details appear on the invitation and in guests' calendar files."
        size="xl"
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setOpen(false)}>Cancel</AdminButton>
            <AdminButton onClick={submit} loading={save.isPending}>{editing ? "Save changes" : "Add event"}</AdminButton>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Event name" htmlFor="event-name" required className="sm:col-span-2">
            <input id="event-name" className="admin-input" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Sangeet Night" />
          </Field>
          <Field label="Date" htmlFor="event-date" required>
            <input id="event-date" type="date" className="admin-input" value={form.eventDate} onChange={(event) => setForm((current) => ({ ...current, eventDate: event.target.value }))} />
          </Field>
          <Field label="Timezone" htmlFor="event-timezone" hint="Use the wedding's local timezone.">
            <input id="event-timezone" className="admin-input" value={form.timezone} onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))} placeholder="Asia/Kolkata" />
          </Field>
          <Field label="Start time" htmlFor="event-start" required>
            <input id="event-start" type="time" className="admin-input" value={form.startTime} onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))} />
          </Field>
          <Field label="End time" htmlFor="event-end">
            <input id="event-end" type="time" className="admin-input" value={form.endTime} onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))} />
          </Field>
          <Field label="Description" htmlFor="event-description" className="sm:col-span-2">
            <textarea id="event-description" className="admin-input min-h-[5rem]" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          </Field>
          <Field label="Venue name" htmlFor="event-venue">
            <input id="event-venue" className="admin-input" value={form.venueName} onChange={(event) => setForm((current) => ({ ...current, venueName: event.target.value }))} />
          </Field>
          <Field label="City" htmlFor="event-city">
            <input id="event-city" className="admin-input" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />
          </Field>
          <Field label="Venue address" htmlFor="event-address" className="sm:col-span-2">
            <input id="event-address" className="admin-input" value={form.venueAddress} onChange={(event) => setForm((current) => ({ ...current, venueAddress: event.target.value }))} />
          </Field>
          <Field label="State / region" htmlFor="event-state">
            <input id="event-state" className="admin-input" value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} />
          </Field>
          <Field label="PIN / postal code" htmlFor="event-pin">
            <input id="event-pin" className="admin-input" value={form.pinCode} onChange={(event) => setForm((current) => ({ ...current, pinCode: event.target.value }))} />
          </Field>
          <Field label="Google Maps link" htmlFor="event-maps">
            <input id="event-maps" className="admin-input" value={form.mapsUrl} onChange={(event) => setForm((current) => ({ ...current, mapsUrl: event.target.value }))} placeholder="https://maps.google.com/…" />
          </Field>
          <Field label="Dress code" htmlFor="event-dress">
            <input id="event-dress" className="admin-input" value={form.dressCode} onChange={(event) => setForm((current) => ({ ...current, dressCode: event.target.value }))} placeholder="Traditional festive attire" />
          </Field>
          <Field label="Contact name" htmlFor="event-contact">
            <input id="event-contact" className="admin-input" value={form.contactName} onChange={(event) => setForm((current) => ({ ...current, contactName: event.target.value }))} />
          </Field>
          <Field label="Contact phone" htmlFor="event-phone">
            <input id="event-phone" className="admin-input" value={form.contactPhone} onChange={(event) => setForm((current) => ({ ...current, contactPhone: event.target.value }))} />
          </Field>
          <Field label="Parking information" htmlFor="event-parking" className="sm:col-span-2">
            <textarea id="event-parking" className="admin-input min-h-[4.5rem]" value={form.parkingInfo} onChange={(event) => setForm((current) => ({ ...current, parkingInfo: event.target.value }))} />
          </Field>
          <div className="sm:col-span-2">
            <MediaField label="Event photograph (optional)" value={form.imageUrl} onChange={(value) => setForm((current) => ({ ...current, imageUrl: value ?? "" }))} />
          </div>
          <Field label="Display order" htmlFor="event-order" hint="Lower numbers appear first within the same date.">
            <input id="event-order" type="number" min={0} max={9999} className="admin-input" value={form.order} onChange={(event) => setForm((current) => ({ ...current, order: event.target.value }))} />
          </Field>
          <div className="space-y-4 pt-1">
            <Toggle checked={form.visible} onChange={(value) => setForm((current) => ({ ...current, visible: value }))} label="Show on invitation" description="Hidden events remain in the studio." />
            <Toggle checked={form.archived} onChange={(value) => setForm((current) => ({ ...current, archived: value }))} label="Archive this event" description="Archived events are hidden and excluded from RSVP choices." />
          </div>
        </div>
        {error ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[0.75rem] text-red-700">{error}</p> : null}
      </Modal>
    </div>
  );
}
