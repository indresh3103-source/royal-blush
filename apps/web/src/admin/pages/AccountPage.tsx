import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, KeyRound, Lock, LogOut, Mail, ShieldCheck, User } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import { useAdminStatus } from "../AdminAuth";
import { AdminButton, Alert, Field, PageHeader, Panel } from "../components/AdminUI";
import { useToast } from "../AdminProviders";

export function AccountPage() {
  const status = useAdminStatus();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const admin = status.data?.admin;
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword !== confirmPassword) {
      setError("The two new passwords do not match.");
      return;
    }
    if (newPassword.length < 12 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError("Use at least 12 characters, including a letter and a number.");
      return;
    }
    setSubmitting(true);
    try {
      await api.auth.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Your password has been updated. Other active sessions remain valid until they expire.");
      toast.success("Password updated.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "The password could not be changed.");
    } finally {
      setSubmitting(false);
    }
  };

  const signOut = async () => {
    setSigningOut(true);
    try {
      await api.auth.logout();
      queryClient.clear();
      navigate("/admin/login", { replace: true });
    } catch (caught) {
      toast.error(caught instanceof ApiError ? caught.message : "Sign-out failed.");
      setSigningOut(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Studio"
        title="My account"
        description="Your private administrator profile and security settings."
        actions={
          <AdminButton variant="outline" loading={signingOut} onClick={signOut}>
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </AdminButton>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <Panel title="Profile" description="The owner account for this studio.">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-[#762f43] font-display text-xl text-[#f7e6c2]">
                {admin?.name?.slice(0, 2).toUpperCase() ?? "AD"}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-2xl text-[#49372f]">{admin?.name ?? "Administrator"}</p>
                <p className="truncate text-[0.72rem] text-[#8a776a]">{admin?.email ?? ""}</p>
                <span className="mt-1 inline-flex rounded-full bg-[#f5ebdd] px-2.5 py-1 text-[0.52rem] font-medium uppercase tracking-[0.14em] text-[#9d7a3d]">
                  {admin?.role ?? "OWNER"}
                </span>
              </div>
            </div>
            <div className="mt-6 space-y-3 border-t border-[#f0e6d8] pt-4">
              <p className="flex items-center gap-2 text-[0.72rem] text-[#6f5c4f]">
                <User className="h-3.5 w-3.5 text-[#b89555]" />
                {admin?.name}
              </p>
              <p className="flex items-center gap-2 text-[0.72rem] text-[#6f5c4f]">
                <Mail className="h-3.5 w-3.5 text-[#b89555]" />
                {admin?.email}
              </p>
              <p className="flex items-center gap-2 text-[0.72rem] text-[#6f5c4f]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#b89555]" />
                Password-protected studio access
              </p>
            </div>
          </Panel>

          <Panel title="Security notes" description="How your studio stays protected.">
            <ul className="space-y-3 text-[0.7rem] leading-relaxed text-[#8a776a]">
              <li className="flex gap-2"><Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b89555]" /> Sessions use secure, HttpOnly cookies with strict same-site protection.</li>
              <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b89555]" /> Sign-in attempts are rate-limited and protected against cross-site requests.</li>
              <li className="flex gap-2"><KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b89555]" /> Passwords are hashed with bcrypt and never stored in plain text.</li>
              <li className="flex gap-2"><LogOut className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b89555]" /> Always sign out on shared devices after editing the invitation.</li>
            </ul>
          </Panel>
        </div>

        <Panel title="Change password" description="Choose a strong, unique password for the studio.">
          <form onSubmit={submit} className="space-y-4">
            <Field label="Current password" htmlFor="current-password" required>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="admin-input"
                autoComplete="current-password"
                required
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="New password" htmlFor="new-password" required hint="At least 12 characters with a letter and a number.">
                <div className="relative">
                  <input
                    id="new-password"
                    type={visible ? "text" : "password"}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="admin-input pr-10"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setVisible((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a08e80] transition hover:text-[#49372f]"
                    aria-label={visible ? "Hide passwords" : "Show passwords"}
                  >
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
              <Field label="Confirm new password" htmlFor="confirm-password" required>
                <input
                  id="confirm-password"
                  type={visible ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="admin-input"
                  autoComplete="new-password"
                  required
                />
              </Field>
            </div>
            {error ? <Alert tone="danger">{error}</Alert> : null}
            {success ? <Alert tone="success">{success}</Alert> : null}
            <div className="flex items-center justify-between gap-3 pt-2">
              <p className="text-[0.62rem] leading-relaxed text-[#a08e80]">You will stay signed in after changing your password.</p>
              <AdminButton type="submit" loading={submitting}>
                <KeyRound className="h-3.5 w-3.5" />
                Update password
              </AdminButton>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  );
}
