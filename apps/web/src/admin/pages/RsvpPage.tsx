import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Eye,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Users,
  XCircle
} from "lucide-react";
import { api, ApiError } from "../../lib/api";
import type { RsvpQuery } from "../../lib/api";
import type { RsvpListItem } from "../../types";
import { AdminButton, Badge, EmptyState, LoadingScreen, Modal, PageHeader, Panel, StatCard } from "../components/AdminUI";
import { useConfirm, useToast } from "../AdminProviders";
import { cn, formatDateShort, formatDateTime } from "../../lib/utils";

const statusOptions = [
  { value: "", label: "All responses" },
  { value: "ATTENDING", label: "Attending" },
  { value: "DECLINED", label: "Declined" }
] as const;

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Guest name" }
] as const;

export function RsvpPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [status, setStatus] = useState<"" | "ATTENDING" | "DECLINED">("");
  const [eventId, setEventId] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "name">("newest");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"csv" | "xlsx" | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(search.trim());
      setPage(1);
    }, 320);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [status, eventId, sort]);

  const filters: RsvpQuery = {
    search: appliedSearch || undefined,
    status: status || undefined,
    eventId: eventId || undefined,
    sort,
    page,
    pageSize: 25
  };

  const weddingQuery = useQuery({ queryKey: ["admin", "wedding"], queryFn: api.admin.wedding });
  const eventsQuery = useQuery({ queryKey: ["admin", "events"], queryFn: api.admin.events });
  const statsQuery = useQuery({ queryKey: ["admin", "rsvp-stats"], queryFn: api.admin.rsvpStats });
  const listQuery = useQuery({
    queryKey: ["admin", "rsvps", appliedSearch, status, eventId, sort, page],
    queryFn: () => api.admin.rsvps(filters)
  });
  const detailQuery = useQuery({
    queryKey: ["admin", "rsvp-detail", selected],
    queryFn: () => api.admin.rsvpDetail(selected!),
    enabled: Boolean(selected)
  });

  const timezone = weddingQuery.data?.timezone ?? "Asia/Kolkata";

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "rsvps"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "rsvp-stats"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
  };

  const remove = useMutation({
    mutationFn: (id: string) => api.admin.deleteRsvp(id),
    onSuccess: () => {
      invalidate();
      setSelected(null);
      toast.success("Response removed.");
    },
    onError: (caught) => toast.error(caught instanceof ApiError ? caught.message : "The response could not be removed.")
  });

  const requestDelete = async (response: RsvpListItem) => {
    const ok = await confirm({
      title: `Remove ${response.guestName}'s response?`,
      message: "The guest's RSVP will be permanently deleted from the guest list and exports.",
      confirmLabel: "Delete response",
      tone: "danger"
    });
    if (ok) remove.mutate(response.id);
  };

  const exportData = async (format: "csv" | "xlsx") => {
    setExporting(format);
    try {
      await api.admin.exportRsvps(format, filters);
      toast.success(`${format.toUpperCase()} export downloaded.`);
    } catch (caught) {
      toast.error(caught instanceof ApiError ? caught.message : "The export could not be generated.");
    } finally {
      setExporting(null);
    }
  };

  const stats = statsQuery.data;
  const list = listQuery.data;
  const responses = list?.responses ?? [];
  const events = useMemo(() => (eventsQuery.data ?? []).filter((event) => !event.archived), [eventsQuery.data]);
  const maxDaily = useMemo(() => Math.max(1, ...(stats?.daily.map((item) => item.count) ?? [1])), [stats?.daily]);
  const maxEventGuests = useMemo(() => Math.max(1, ...(stats?.eventAttendance.map((item) => item.guests) ?? [1])), [stats?.eventAttendance]);
  const hasFilters = Boolean(appliedSearch || status || eventId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Guests"
        title="RSVP responses"
        description="Every reply, guest count, and celebration preference in one place."
        actions={
          <>
            <AdminButton variant="outline" loading={exporting === "csv"} onClick={() => exportData("csv")}>
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </AdminButton>
            <AdminButton loading={exporting === "xlsx"} onClick={() => exportData("xlsx")}>
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Export Excel
            </AdminButton>
          </>
        }
      />

      {statsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-xl border border-[#e7dccd] bg-white" />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total responses" value={stats.total} hint="All guest replies" icon={<ClipboardList className="h-4 w-4" />} />
            <StatCard label="Attending" value={stats.attending} hint={`${stats.attendanceRate}% attendance rate`} icon={<CheckCircle2 className="h-4 w-4" />} tone="gold" />
            <StatCard label="Declined" value={stats.declined} hint="Guests who cannot attend" icon={<XCircle className="h-4 w-4" />} tone="blush" />
            <StatCard label="Expected guests" value={stats.expectedGuests} hint="Including named guests" icon={<Users className="h-4 w-4" />} tone="deep" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Panel title="Responses over time" description="Replies received in the last fourteen days.">
              {stats.daily.length ? (
                <div>
                  <div className="flex h-40 items-end gap-1.5 sm:gap-2">
                    {stats.daily.map((item) => (
                      <div key={item.date} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                        <span className="text-[0.52rem] font-medium text-[#8a776a] opacity-0 transition group-hover:opacity-100">{item.count}</span>
                        <div
                          className="w-full rounded-t-sm bg-gradient-to-t from-[#762f43] to-[#b89555] transition-all duration-500"
                          style={{ height: `${Math.max(item.count ? 8 : 2, (item.count / maxDaily) * 100)}%` }}
                          title={`${item.date}: ${item.count} responses`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-1.5 sm:gap-2">
                    {stats.daily.map((item) => (
                      <span key={item.date} className="flex-1 text-center text-[0.48rem] uppercase tracking-[0.04em] text-[#a08e80]">
                        {formatDateShort(item.date)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="py-10 text-center text-[0.75rem] text-[#8a776a]">No response history yet.</p>
              )}
            </Panel>

            <Panel title="Attendance by event" description="Where your guests plan to celebrate with you.">
              {stats.eventAttendance.length ? (
                <div className="space-y-4">
                  {stats.eventAttendance.map((event) => (
                    <div key={event.eventId}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[0.74rem] font-medium text-[#49372f]">{event.name}</p>
                        <span className="shrink-0 text-[0.6rem] text-[#8a776a]">{event.guests} guests</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#eadfce]">
                        <div className="h-full rounded-full bg-[#b89555]" style={{ width: `${(event.guests / maxEventGuests) * 100}%` }} />
                      </div>
                      <p className="mt-1 text-[0.54rem] text-[#a08e80]">{formatDateShort(event.eventDate)} · {event.responses} {event.responses === 1 ? "response" : "responses"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-10 text-center text-[0.75rem] text-[#8a776a]">No event attendance recorded yet.</p>
              )}
            </Panel>
          </div>
        </>
      ) : null}

      <Panel title="Guest responses" description="Search, filter, and review every reply." noPadding>
        <div className="grid gap-3 border-b border-[#f0e6d8] p-4 sm:grid-cols-2 xl:grid-cols-[1.4fr_0.8fr_1fr_0.8fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a08e80]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="admin-input pl-9" placeholder="Search guest, phone, or message" aria-label="Search responses" />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value as "" | "ATTENDING" | "DECLINED")} className="admin-input" aria-label="Filter by response">
            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select value={eventId} onChange={(event) => setEventId(event.target.value)} className="admin-input" aria-label="Filter by event">
            <option value="">All events</option>
            {events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value as "newest" | "oldest" | "name")} className="admin-input" aria-label="Sort responses">
            {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>

        {listQuery.isLoading ? (
          <div className="grid place-items-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[#b89555]" />
          </div>
        ) : listQuery.isError ? (
          <div className="p-8 text-center">
            <p className="text-[0.8rem] text-red-700">Responses could not be loaded.</p>
            <AdminButton className="mt-4" size="sm" variant="outline" onClick={() => listQuery.refetch()}>
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </AdminButton>
          </div>
        ) : !responses.length ? (
          <EmptyState
            icon={<ClipboardList className="h-6 w-6" />}
            title={hasFilters ? "No matching responses" : "No responses yet"}
            description={hasFilters ? "Try clearing the search or choosing a different filter." : "Share your invitation to begin receiving RSVPs."}
            action={hasFilters ? <AdminButton variant="outline" onClick={() => { setSearch(""); setStatus(""); setEventId(""); }}>Clear filters</AdminButton> : undefined}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="admin-table w-full min-w-[54rem]">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Contact</th>
                    <th>Response</th>
                    <th>Guests</th>
                    <th>Events</th>
                    <th>Received</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.map((response) => (
                    <tr key={response.id}>
                      <td>
                        <button type="button" onClick={() => setSelected(response.id)} className="text-left font-medium text-[#49372f] transition hover:text-[#762f43]">
                          {response.guestName}
                        </button>
                        {response.message ? <p className="mt-0.5 line-clamp-1 max-w-[16rem] text-[0.6rem] font-normal text-[#a08e80]">{response.message}</p> : null}
                      </td>
                      <td className="text-[#8a776a]">{response.phone ?? "—"}</td>
                      <td>
                        <span className={cn("inline-flex items-center gap-1.5 text-[0.66rem] font-medium", response.attendance === "ATTENDING" ? "text-emerald-700" : "text-red-600")}>
                          {response.attendance === "ATTENDING" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {response.attendance === "ATTENDING" ? "Attending" : "Declined"}
                        </span>
                      </td>
                      <td>{response.guestCount}</td>
                      <td className="max-w-[13rem]">
                        {response.events.length ? (
                          <div className="flex flex-wrap gap-1">
                            {response.events.slice(0, 2).map((event) => (
                              <span key={event.id} className="rounded-full bg-[#f5ebdd] px-2 py-0.5 text-[0.54rem] text-[#762f43]">{event.name}</span>
                            ))}
                            {response.events.length > 2 ? <span className="text-[0.54rem] text-[#a08e80]">+{response.events.length - 2}</span> : null}
                          </div>
                        ) : (
                          <span className="text-[#a08e80]">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap text-[#8a776a]">{formatDateTime(response.createdAt, timezone)}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => setSelected(response.id)} className="grid h-7 w-7 place-items-center rounded-full text-[#a08e80] transition hover:bg-[#f5ebdd] hover:text-[#762f43]" aria-label={`View ${response.guestName}`}>
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" onClick={() => requestDelete(response)} className="grid h-7 w-7 place-items-center rounded-full text-[#a08e80] transition hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${response.guestName}`}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-3 border-t border-[#f0e6d8] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[0.64rem] text-[#8a776a]">
                Showing {responses.length ? (page - 1) * 25 + 1 : 0}–{Math.min(page * 25, list?.total ?? 0)} of {list?.total ?? 0} responses
              </p>
              <div className="flex items-center gap-2">
                <AdminButton size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </AdminButton>
                <span className="text-[0.6rem] uppercase tracking-[0.12em] text-[#a08e80]">Page {page} of {list?.pages ?? 1}</span>
                <AdminButton size="sm" variant="outline" disabled={page >= (list?.pages ?? 1)} onClick={() => setPage((current) => current + 1)}>
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </AdminButton>
              </div>
            </div>
          </>
        )}
      </Panel>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Guest response"
        description="The full details of this RSVP."
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setSelected(null)}>Close</AdminButton>
            {detailQuery.data ? (
              <AdminButton
                variant="danger"
                loading={remove.isPending}
                onClick={() => {
                  const detail = detailQuery.data;
                  if (!detail) return;
                  void requestDelete({
                    id: detail.id,
                    guestName: detail.guestName,
                    phone: detail.phone,
                    attendance: detail.attendance,
                    guestCount: detail.guestCount,
                    message: detail.message,
                    notified: detail.notified,
                    createdAt: detail.createdAt,
                    events: detail.events.map((event) => ({ id: event.id, name: event.name }))
                  });
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete response
              </AdminButton>
            ) : null}
          </>
        }
      >
        {detailQuery.isLoading ? (
          <div className="grid place-items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#b89555]" />
          </div>
        ) : detailQuery.data ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-3xl leading-tight text-[#49372f]">{detailQuery.data.guestName}</h2>
                <p className="mt-1 text-[0.68rem] text-[#8a776a]">Received {formatDateTime(detailQuery.data.createdAt, timezone)}</p>
              </div>
              <Badge tone={detailQuery.data.attendance === "ATTENDING" ? "success" : "danger"}>
                {detailQuery.data.attendance === "ATTENDING" ? "Attending" : "Declined"}
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-[#faf4eb] p-3">
                <p className="text-[0.54rem] uppercase tracking-[0.16em] text-[#a08e80]">Mobile</p>
                <p className="mt-1 text-[0.8rem] text-[#49372f]">{detailQuery.data.phone ?? "Not provided"}</p>
              </div>
              <div className="rounded-lg bg-[#faf4eb] p-3">
                <p className="text-[0.54rem] uppercase tracking-[0.16em] text-[#a08e80]">Guests</p>
                <p className="mt-1 text-[0.8rem] text-[#49372f]">{detailQuery.data.guestCount}</p>
              </div>
            </div>
            <div>
              <p className="text-[0.54rem] uppercase tracking-[0.16em] text-[#a08e80]">Events</p>
              {detailQuery.data.events.length ? (
                <div className="mt-2 space-y-2">
                  {detailQuery.data.events.map((event) => (
                    <div key={event.id} className="flex items-center gap-3 rounded-lg border border-[#f0e6d8] px-3 py-2">
                      <CalendarDays className="h-4 w-4 shrink-0 text-[#b89555]" />
                      <div>
                        <p className="text-[0.76rem] font-medium text-[#49372f]">{event.name}</p>
                        <p className="text-[0.58rem] text-[#8a776a]">{formatDateShort(event.eventDate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-[0.72rem] text-[#8a776a]">No specific events selected.</p>
              )}
            </div>
            {detailQuery.data.message ? (
              <div>
                <p className="text-[0.54rem] uppercase tracking-[0.16em] text-[#a08e80]">Message</p>
                <p className="mt-2 rounded-lg border border-[#f0e6d8] bg-[#fffdf9] p-3 text-[0.76rem] leading-relaxed text-[#6f5c4f]">{detailQuery.data.message}</p>
              </div>
            ) : null}
            <p className="text-[0.6rem] text-[#a08e80]">
              {detailQuery.data.notified ? "The notification email was sent successfully." : "No notification email has been sent for this response."}
            </p>
          </div>
        ) : (
          <p className="py-8 text-center text-[0.8rem] text-red-700">This response could not be loaded.</p>
        )}
      </Modal>
    </div>
  );
}
