import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookHeart,
  CalendarDays,
  ClipboardList,
  ExternalLink,
  GalleryVerticalEnd,
  HeartHandshake,
  Hotel,
  Images,
  LayoutDashboard,
  ListTree,
  LogOut,
  Menu,
  Music2,
  Palette,
  Settings,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { api, ApiError } from "../lib/api";
import { useAdminStatus } from "./AdminAuth";
import { useToast } from "./AdminProviders";
import { cn } from "../lib/utils";
import { Monogram } from "../components/decor/Ornament";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true }]
  },
  {
    label: "The Invitation",
    items: [
      { to: "/admin/wedding", label: "Wedding Details", icon: HeartHandshake },
      { to: "/admin/family", label: "Family", icon: Users },
      { to: "/admin/events", label: "Events", icon: CalendarDays },
      { to: "/admin/rituals", label: "Vivah Rituals", icon: Sparkles },
      { to: "/admin/story", label: "Our Story", icon: BookHeart },
      { to: "/admin/hotels", label: "Nearby Hotels", icon: Hotel }
    ]
  },
  {
    label: "Content",
    items: [
      { to: "/admin/media", label: "Media Library", icon: Images },
      { to: "/admin/gallery", label: "Gallery", icon: GalleryVerticalEnd },
      { to: "/admin/music", label: "Music", icon: Music2 }
    ]
  },
  {
    label: "Design",
    items: [
      { to: "/admin/theme", label: "Theme", icon: Palette },
      { to: "/admin/sections", label: "Sections", icon: ListTree }
    ]
  },
  {
    label: "Guests",
    items: [{ to: "/admin/rsvps", label: "RSVP Responses", icon: ClipboardList }]
  },
  {
    label: "Studio",
    items: [
      { to: "/admin/settings", label: "Invitation Settings", icon: Settings },
      { to: "/admin/account", label: "My Account", icon: UserCog }
    ]
  }
];

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const status = useAdminStatus();
  const queryClient = useQueryClient();
  const toast = useToast();
  const admin = status.data?.admin;

  const current = useMemo(() => {
    const all = navGroups.flatMap((group) => group.items);
    return (
      all.find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to))) ??
      all[0]!
    );
  }, [location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await api.auth.logout();
      queryClient.clear();
      navigate("/admin/login", { replace: true });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Sign-out failed.");
      setSigningOut(false);
    }
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Link to="/admin" className="flex items-center gap-3 text-[#fff8ee]">
          <Monogram initials="RB" className="h-10 w-10 text-[#d8bd83]" />
          <div>
            <p className="font-display text-lg leading-none">Royal Blush</p>
            <p className="mt-1 text-[0.46rem] uppercase tracking-[0.3em] text-[#d8bd83]/70">Wedding Studio</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="grid h-9 w-9 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-[#d8bd83]/25 to-transparent" />
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-3 pb-2 text-[0.48rem] font-medium uppercase tracking-[0.28em] text-[#d8bd83]/45">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-[0.76rem] transition",
                        isActive
                          ? "bg-[#d8bd83]/[0.12] text-[#fff8ee] shadow-[inset_2px_0_0_#d8bd83]"
                          : "text-[#f7e6c2]/55 hover:bg-white/[0.05] hover:text-[#fff8ee]"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[#e8cf9b]" : "text-[#f7e6c2]/35 group-hover:text-[#e8cf9b]/70")} />
                        <span className="flex-1">{item.label}</span>
                        {isActive ? <span className="h-1 w-1 rounded-full bg-[#e8cf9b]" /> : null}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-white/[0.04] px-3 py-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#d8bd83]/15 text-[#e8cf9b]">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.68rem] font-medium text-[#fff8ee]">{admin?.name ?? "Administrator"}</p>
            <p className="truncate text-[0.52rem] text-[#f7e6c2]/40">{admin?.email ?? ""}</p>
          </div>
          <button type="button" onClick={signOut} disabled={signingOut} className="text-[#f7e6c2]/45 transition hover:text-[#e8cf9b]" aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf4eb]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[17rem] bg-[#3b111d] lg:block">{sidebar}</aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button type="button" className="absolute inset-0 bg-[#2f0e18]/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-label="Close menu" />
          <aside className="absolute inset-y-0 left-0 w-[17rem] max-w-[86vw] bg-[#3b111d] shadow-2xl">{sidebar}</aside>
        </div>
      ) : null}

      <div className="lg:pl-[17rem]">
        <header className="sticky top-0 z-30 border-b border-[#e7dccd] bg-[#faf4eb]/[0.92] backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-[#e2d6c6] text-[#762f43] transition hover:bg-white lg:hidden"
              aria-label="Open admin menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[0.48rem] uppercase tracking-[0.28em] text-[#a08e80]">Studio</p>
              <p className="truncate font-display text-lg leading-tight text-[#49372f]">{current.label}</p>
            </div>
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 rounded-full border border-[#e2d6c6] bg-white px-4 py-2 text-[0.58rem] font-medium uppercase tracking-[0.16em] text-[#6f5c4f] transition hover:border-[#b89555] hover:text-[#762f43] sm:inline-flex"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View invitation
            </Link>
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((value) => !value)}
                className="flex items-center gap-2 rounded-full border border-[#e2d6c6] bg-white py-1 pl-1 pr-3 transition hover:border-[#b89555]"
                aria-expanded={accountOpen}
                aria-label="Open account menu"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#762f43] font-display text-xs text-[#f7e6c2]">
                  {admin?.name?.slice(0, 2).toUpperCase() ?? "AD"}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block max-w-[8rem] truncate text-[0.66rem] font-medium leading-tight text-[#49372f]">{admin?.name}</span>
                  <span className="block text-[0.48rem] uppercase tracking-[0.14em] text-[#a08e80]">{admin?.role}</span>
                </span>
              </button>
              {accountOpen ? (
                <>
                  <button type="button" className="fixed inset-0 z-10 cursor-default" onClick={() => setAccountOpen(false)} aria-label="Close account menu" />
                  <div className="absolute right-0 top-12 z-20 w-56 overflow-hidden rounded-xl border border-[#e7dccd] bg-white shadow-xl">
                    <div className="border-b border-[#f0e6d8] px-4 py-3">
                      <p className="truncate text-[0.78rem] font-medium text-[#49372f]">{admin?.name}</p>
                      <p className="truncate text-[0.6rem] text-[#8a776a]">{admin?.email}</p>
                    </div>
                    <Link to="/admin/account" className="flex items-center gap-2 px-4 py-2.5 text-[0.72rem] text-[#6f5c4f] transition hover:bg-[#faf4eb]">
                      <UserCog className="h-3.5 w-3.5" />
                      My account
                    </Link>
                    <Link to="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 text-[0.72rem] text-[#6f5c4f] transition hover:bg-[#faf4eb]">
                      <ExternalLink className="h-3.5 w-3.5" />
                      View invitation
                    </Link>
                    <button type="button" onClick={signOut} disabled={signingOut} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[0.72rem] text-red-600 transition hover:bg-red-50">
                      <LogOut className="h-3.5 w-3.5" />
                      Sign out
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1500px] px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
