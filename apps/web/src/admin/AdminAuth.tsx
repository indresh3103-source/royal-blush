import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { api, ApiError } from "../lib/api";
import type { AdminAuthStatus } from "../types";
import { AdminButton, Alert, Spinner } from "./components/AdminUI";
import { Ganesh } from "../components/decor/Ganesh";
import { Mandala } from "../components/decor/Mandala";
import { cn } from "../lib/utils";

export function useAdminStatus() {
  return useQuery({
    queryKey: ["admin", "status"],
    queryFn: api.auth.status,
    staleTime: 20_000,
    retry: false
  });
}

export function RequireAdmin() {
  const status = useAdminStatus();
  const location = useLocation();

  if (status.isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#faf4eb]">
        <div className="text-center">
          <Spinner className="mx-auto h-6 w-6" />
          <p className="mt-3 text-[0.6rem] uppercase tracking-[0.26em] text-[#8a776a]">Opening the studio</p>
        </div>
      </div>
    );
  }

  if (status.isError) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#faf4eb] px-6">
        <div className="max-w-sm text-center">
          <h1 className="font-display text-3xl text-[#49372f]">The studio is unavailable</h1>
          <p className="mt-2 text-sm text-[#8a776a]">Please check that the API is running and try again.</p>
          <AdminButton className="mt-5" onClick={() => status.refetch()}>Try again</AdminButton>
        </div>
      </div>
    );
  }

  if (status.data?.setupRequired) {
    return <Navigate to="/admin/setup" replace />;
  }

  if (!status.data?.authenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

function AuthShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="grid min-h-screen bg-[#faf4eb] lg:grid-cols-[1.05fr_0.95fr]">
      <div className="paper-deep grain relative hidden overflow-hidden p-12 text-[#fff8ee] lg:flex lg:flex-col">
        <Mandala className="pointer-events-none absolute -right-40 top-1/2 h-[48rem] w-[48rem] -translate-y-1/2 text-[#d8bd83]/[0.12] animate-spin-slow" />
        <div className="relative z-10 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full border border-[#d8bd83]/45 font-display text-sm tracking-[0.1em] text-[#e8cf9b]">
            RB
          </span>
          <div>
            <p className="font-display text-xl leading-none">Royal Blush</p>
            <p className="mt-1 text-[0.48rem] uppercase tracking-[0.32em] text-[#d8bd83]">Wedding Studio</p>
          </div>
        </div>
        <div className="relative z-10 my-auto max-w-lg">
          <Ganesh className="h-24 w-20 text-[#d8bd83]/80" />
          <p className="mt-8 text-[0.55rem] uppercase tracking-[0.4em] text-[#d8bd83]">A private workspace</p>
          <h2 className="mt-4 font-display text-5xl leading-[0.98]">
            Every detail,
            <span className="script block text-[#e8cf9b]">beautifully composed</span>
          </h2>
          <p className="mt-6 max-w-md text-[0.82rem] font-light leading-relaxed text-[#f7e6c2]/60">
            Shape your invitation, welcome your guests, and keep every celebration in one calm, considered place.
          </p>
        </div>
        <p className="relative z-10 text-[0.5rem] uppercase tracking-[0.3em] text-[#f7e6c2]/35">
          Private administration · Authorised access only
        </p>
      </div>

      <div className="flex min-h-screen flex-col px-5 py-7 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between lg:hidden">
          <Link to="/" className="flex items-center gap-2 text-[#762f43]">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-[#b89555]/50 font-display text-xs">RB</span>
            <span className="font-display text-lg">Royal Blush</span>
          </Link>
          <Link to="/" className="text-[0.55rem] uppercase tracking-[0.2em] text-[#8a776a]">Invitation</Link>
        </div>
        <div className="my-auto w-full max-w-md self-center py-10">
          <p className="text-[0.55rem] uppercase tracking-[0.3em] text-[#b89555]">Wedding Studio</p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-[#49372f] sm:text-5xl">{title}</h1>
          <p className="mt-3 text-[0.82rem] leading-relaxed text-[#8a776a]">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
        <div className="flex items-center justify-between text-[0.52rem] uppercase tracking-[0.2em] text-[#a08e80]">
          <Link to="/" className="inline-flex items-center gap-2 transition hover:text-[#762f43]">
            <ArrowLeft className="h-3 w-3" />
            Back to invitation
          </Link>
          <span>Royal Blush</span>
        </div>
      </div>
    </div>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a08e80]" />
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="admin-input py-3 pl-10 pr-11"
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a08e80] transition hover:text-[#49372f]"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function LoginPage() {
  const status = useAdminStatus();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const from = (location.state as { from?: string } | null)?.from ?? "/admin";

  useEffect(() => {
    if (status.data?.authenticated) {
      navigate("/admin", { replace: true });
    }
  }, [status.data?.authenticated, navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await api.auth.login({ email, password });
      const next: AdminAuthStatus = { setupRequired: false, authenticated: true, admin: result.admin };
      queryClient.setQueryData(["admin", "status"], next);
      navigate(from, { replace: true });
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Sign-in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to compose, refine, and share your celebration.">
      {status.data?.setupRequired ? (
        <Alert tone="warning" className="mb-5">
          No administrator account exists yet.{" "}
          <Link to="/admin/setup" className="font-medium underline">
            Complete the secure setup
          </Link>
          .
        </Alert>
      ) : null}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="admin-label">Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a08e80]" />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="admin-input py-3 pl-10"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="login-password" className="admin-label">Password</label>
          <PasswordInput id="login-password" value={password} onChange={setPassword} placeholder="Your password" autoComplete="current-password" />
        </div>
        {error ? <Alert tone="danger">{error}</Alert> : null}
        <AdminButton type="submit" size="lg" loading={submitting} className="w-full">
          Enter the studio
          <ArrowRight className="h-4 w-4" />
        </AdminButton>
      </form>
      <div className="mt-7 flex items-center gap-3">
        <span className="h-px flex-1 bg-[#e7dccd]" />
        <ShieldCheck className="h-4 w-4 text-[#b89555]" />
        <span className="h-px flex-1 bg-[#e7dccd]" />
      </div>
      <p className="mt-5 text-center text-[0.6rem] leading-relaxed text-[#a08e80]">
        Protected by encrypted sessions, secure cookies, and rate-limited access.
      </p>
    </AuthShell>
  );
}

export function SetupPage() {
  const status = useAdminStatus();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [setupToken, setSetupToken] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const setupComplete = status.data ? !status.data.setupRequired : false;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    if (password.length < 12 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Use at least 12 characters, including a letter and a number.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await api.auth.setup({ setupToken, name, email, password });
      const next: AdminAuthStatus = { setupRequired: false, authenticated: true, admin: result.admin };
      queryClient.setQueryData(["admin", "status"], next);
      navigate("/admin", { replace: true });
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Setup failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Create your studio" subtitle="This one-time step creates the owner account for your wedding workspace.">
      {setupComplete ? (
        <div className="rounded-xl border border-[#e7dccd] bg-white p-6 text-center">
          <ShieldCheck className="mx-auto h-9 w-9 text-emerald-600" />
          <h2 className="mt-3 font-display text-2xl text-[#49372f]">Setup is already complete</h2>
          <p className="mt-2 text-[0.78rem] text-[#8a776a]">An administrator account already exists for this studio.</p>
          <Link to="/admin/login" className="mt-5 inline-flex">
            <AdminButton type="button">Go to sign in</AdminButton>
          </Link>
        </div>
      ) : (
        <>
          <Alert tone="info" className="mb-5">
            Your private setup token is stored as <code className="rounded bg-white/70 px-1 py-0.5 text-[0.7rem]">SETUP_TOKEN</code> in{" "}
            <code className="rounded bg-white/70 px-1 py-0.5 text-[0.7rem]">apps/api/.env</code>. It is required once to create the owner account.
          </Alert>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="setup-token" className="admin-label">Setup token</label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a08e80]" />
                <input
                  id="setup-token"
                  value={setupToken}
                  onChange={(event) => setSetupToken(event.target.value)}
                  className="admin-input py-3 pl-10"
                  placeholder="Paste your private setup token"
                  autoComplete="off"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="setup-name" className="admin-label">Your name</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a08e80]" />
                <input
                  id="setup-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="admin-input py-3 pl-10"
                  placeholder="Wedding planner or family member"
                  autoComplete="name"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="setup-email" className="admin-label">Email address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a08e80]" />
                <input
                  id="setup-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="admin-input py-3 pl-10"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="setup-password" className="admin-label">Create a password</label>
              <PasswordInput id="setup-password" value={password} onChange={setPassword} placeholder="At least 12 characters" autoComplete="new-password" />
              <p className="mt-1 text-[0.62rem] text-[#a08e80]">Use at least 12 characters, including a letter and a number.</p>
            </div>
            <div>
              <label htmlFor="setup-confirm" className="admin-label">Confirm password</label>
              <PasswordInput id="setup-confirm" value={confirm} onChange={setConfirm} placeholder="Repeat your password" autoComplete="new-password" />
            </div>
            {error ? <Alert tone="danger">{error}</Alert> : null}
            <AdminButton type="submit" size="lg" loading={submitting} className="w-full">
              Create my studio
              <ArrowRight className="h-4 w-4" />
            </AdminButton>
          </form>
          <p className={cn("mt-5 text-center text-[0.58rem] leading-relaxed text-[#a08e80]")}>
            Already configured?{" "}
            <Link to="/admin/login" className="font-medium text-[#762f43] underline">
              Sign in instead
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
