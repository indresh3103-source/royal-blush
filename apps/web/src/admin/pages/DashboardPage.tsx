import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Heart,
  Image as ImageIcon,
  Music2,
  Palette,
  Plus,
  Users,
  XCircle
} from "lucide-react";
import { api } from "../../lib/api";
import { formatDateMedium, formatDateLong, formatDateTime, formatTime } from "../../lib/utils";
import { AdminButton, Badge, LoadingScreen, PageHeader, Panel, StatCard } from "../components/AdminUI";
import { useAdminStatus } from "../AdminAuth";

export function DashboardPage() {
  const query = useQuery({ queryKey: ["admin", "dashboard"], queryFn: api.admin.dashboard });
  const status = useAdminStatus();
  const admin = status.data?.admin;
  const data = query.data;

  if (query.isLoading) return <LoadingScreen label="Preparing your studio" />;
  if (query.isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="font-display text-2xl text-red-800">The dashboard could not be loaded</h1>
        <p className="mt-2 text-sm text-red-700">Please check the API connection and try again.</p>
        <AdminButton className="mt-4" variant="danger" onClick={() => query.refetch()}>Try again</AdminButton>
      </div>
    );
  }

  const { stats, wedding, nextEvent, latestResponses } = data;
  const attendanceRate = stats.attendingResponses + stats.declinedResponses
    ? Math.round((stats.attendingResponses / (stats.attendingResponses + stats.declinedResponses)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={formatDateLong(wedding.weddingDate, wedding.timezone)}
        title={`Welcome back${admin?.name ? `, ${admin.name.split(" ")[0]}` : ""}`}
        description={`${wedding.title} · ${[wedding.venueName, wedding.city].filter(Boolean).join(", ")}`}
        actions={
          <>
            <Link to="/" target="_blank" rel="noreferrer">
              <AdminButton variant="outline">Preview invitation</AdminButton>
            </Link>
            <Link to="/admin/wedding">
              <AdminButton>
                Edit details
                <ArrowRight className="h-3.5 w-3.5" />
              </AdminButton>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total responses" value={stats.totalResponses} hint="All RSVP submissions" icon={<ClipboardList className="h-4 w-4" />} />
        <StatCard label="Attending" value={stats.attendingResponses} hint={`${attendanceRate}% of responses`} icon={<CheckCircle2 className="h-4 w-4" />} tone="gold" />
        <StatCard label="Expected guests" value={stats.expectedGuests} hint="Including named guests" icon={<Users className="h-4 w-4" />} tone="blush" />
        <StatCard label="Media library" value={stats.mediaCount} hint={`${stats.galleryCount} in gallery · ${stats.musicCount} tracks`} icon={<ImageIcon className="h-4 w-4" />} tone="deep" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel
          title="RSVP overview"
          description="A live snapshot of your guest list."
          actions={<Badge tone={data.rsvpOpen ? "success" : "warning"}>{data.rsvpOpen ? "RSVP open" : "RSVP closed"}</Badge>}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-lg bg-[#faf4eb] p-4">
              <p className="text-[0.58rem] uppercase tracking-[0.2em] text-[#8a776a]">Attending</p>
              <p className="mt-2 font-display text-4xl text-[#49372f]">{stats.attendingResponses}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eadfce]">
                <div className="h-full rounded-full bg-[#762f43]" style={{ width: `${attendanceRate}%` }} />
              </div>
              <p className="mt-2 text-[0.62rem] text-[#a08e80]">{attendanceRate}% of all responses</p>
            </div>
            <div className="rounded-lg bg-[#faf4eb] p-4">
              <p className="text-[0.58rem] uppercase tracking-[0.2em] text-[#8a776a]">Declined</p>
              <p className="mt-2 font-display text-4xl text-[#49372f]">{stats.declinedResponses}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eadfce]">
                <div className="h-full rounded-full bg-[#b89555]" style={{ width: `${100 - attendanceRate}%` }} />
              </div>
              <p className="mt-2 text-[0.62rem] text-[#a08e80]">We will miss them</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/admin/rsvps">
              <AdminButton variant="subtle" size="sm">
                <ClipboardList className="h-3.5 w-3.5" />
                Manage responses
              </AdminButton>
            </Link>
            <Link to="/admin/settings">
              <AdminButton variant="ghost" size="sm">RSVP settings</AdminButton>
            </Link>
          </div>
        </Panel>

        <Panel
          title="Next celebration"
          description="The next event on your calendar."
          actions={<Badge tone="gold">{stats.eventCount} events</Badge>}
        >
          {nextEvent ? (
            <div>
              <div className="flex items-start gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-[#762f43] text-center text-white">
                  <span className="font-display text-2xl leading-none">{formatDateMedium(nextEvent.eventDate, wedding.timezone).split(" ")[0]}</span>
                  <span className="mt-0.5 text-[0.48rem] uppercase tracking-[0.2em] text-[#e8cf9b]">{formatDateMedium(nextEvent.eventDate, wedding.timezone).split(" ")[1]}</span>
                </div>
                <div>
                  <h3 className="font-display text-2xl leading-tight text-[#49372f]">{nextEvent.name}</h3>
                  <p className="mt-1 text-[0.68rem] uppercase tracking-[0.16em] text-[#b89555]">{formatTime(nextEvent.startTime)}</p>
                  <p className="mt-1 text-[0.75rem] text-[#8a776a]">{nextEvent.venueName}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link to="/admin/events">
                  <AdminButton variant="subtle" size="sm">
                    <CalendarDays className="h-3.5 w-3.5" />
                    View all events
                  </AdminButton>
                </Link>
                <Link to="/admin/events">
                  <AdminButton variant="ghost" size="sm">
                    <Plus className="h-3.5 w-3.5" />
                    Add event
                  </AdminButton>
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <CalendarDays className="mx-auto h-8 w-8 text-[#b89555]" />
              <p className="mt-3 font-display text-xl text-[#49372f]">No upcoming events</p>
              <Link to="/admin/events" className="mt-3 inline-flex">
                <AdminButton size="sm">Create an event</AdminButton>
              </Link>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <Panel title="Latest responses" description="The most recent replies from your guests." noPadding>
          {latestResponses.length ? (
            <div className="overflow-x-auto">
              <table className="admin-table w-full min-w-[38rem]">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Response</th>
                    <th>Guests</th>
                    <th>Events</th>
                    <th>Received</th>
                  </tr>
                </thead>
                <tbody>
                  {latestResponses.map((response) => (
                    <tr key={response.id}>
                      <td className="font-medium">{response.guestName}</td>
                      <td>
                        <span className={`inline-flex items-center gap-1.5 text-[0.68rem] font-medium ${response.attendance === "ATTENDING" ? "text-emerald-700" : "text-red-600"}`}>
                          {response.attendance === "ATTENDING" ? <Heart className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {response.attendance === "ATTENDING" ? "Attending" : "Declined"}
                        </span>
                      </td>
                      <td>{response.guestCount}</td>
                      <td className="max-w-[12rem] truncate text-[#8a776a]">{response.events.join(", ") || "—"}</td>
                      <td className="whitespace-nowrap text-[#8a776a]">{formatDateTime(response.createdAt, wedding.timezone)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <ClipboardList className="mx-auto h-8 w-8 text-[#b89555]" />
              <p className="mt-3 font-display text-xl text-[#49372f]">No responses yet</p>
              <p className="mt-1 text-[0.75rem] text-[#8a776a]">Share your invitation to begin receiving RSVPs.</p>
            </div>
          )}
          <div className="border-t border-[#f0e6d8] px-5 py-3 text-right">
            <Link to="/admin/rsvps" className="inline-flex items-center gap-1.5 text-[0.6rem] font-medium uppercase tracking-[0.16em] text-[#762f43] hover:text-[#b89555]">
              View all responses
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Panel>

        <Panel title="Quick actions" description="Keep the celebration moving.">
          <div className="space-y-2">
            {[
              { to: "/admin/media", label: "Upload photographs", icon: ImageIcon },
              { to: "/admin/gallery", label: "Curate the gallery", icon: ImageIcon },
              { to: "/admin/music", label: "Manage the soundtrack", icon: Music2 },
              { to: "/admin/theme", label: "Refine the theme", icon: Palette },
              { to: "/admin/sections", label: "Reorder sections", icon: Users }
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex items-center gap-3 rounded-lg border border-[#f0e6d8] px-3 py-2.5 text-[0.75rem] text-[#6f5c4f] transition hover:border-[#d9cbb9] hover:bg-[#faf4eb]"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f5ebdd] text-[#b89555]">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex-1">{action.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#c4b4a5]" />
                </Link>
              );
            })}
          </div>
          <div className="mt-4 rounded-lg border border-[#e7dccd] bg-[#faf4eb] p-3 text-[0.64rem] text-[#8a776a]">
            <p className="flex items-center justify-between">
              <span>Storage mode</span>
              <Badge tone={data.storageMode === "s3" ? "success" : "warning"}>{data.storageMode === "s3" ? "Cloud" : "Local"}</Badge>
            </p>
            <p className="mt-2 leading-relaxed">
              {data.storageMode === "s3" ? "Media is stored in your persistent cloud bucket." : "Media is stored locally. Configure object storage before deployment."}
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
