import { useEffect } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "gold" | "outline" | "ghost" | "danger" | "subtle";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function AdminButton({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  ...props
}: AdminButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium uppercase tracking-[0.14em] transition disabled:cursor-not-allowed disabled:opacity-55",
        size === "sm" && "min-h-8 px-3 py-1.5 text-[0.58rem]",
        size === "md" && "min-h-10 px-4 py-2 text-[0.64rem]",
        size === "lg" && "min-h-11 px-5 py-2.5 text-[0.68rem]",
        variant === "primary" && "bg-[#762f43] text-white hover:bg-[#5e2435]",
        variant === "gold" && "bg-[#b89555] text-[#2f0e18] hover:bg-[#a58245]",
        variant === "outline" && "border border-[#d9cbb9] bg-white text-[#6f5c4f] hover:border-[#b89555] hover:text-[#762f43]",
        variant === "ghost" && "text-[#8a776a] hover:bg-[#f5ebdd] hover:text-[#49372f]",
        variant === "subtle" && "bg-[#f5ebdd] text-[#762f43] hover:bg-[#efe1cf]",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        className
      )}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
      {children}
    </button>
  );
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-[0.58rem] font-medium uppercase tracking-[0.28em] text-[#b89555]">{eyebrow}</p> : null}
        <h1 className="mt-1 font-display text-[2rem] leading-tight text-[#49372f] sm:text-[2.6rem]">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-[0.82rem] leading-relaxed text-[#8a776a]">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

interface PanelProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}

export function Panel({ title, description, actions, children, className, bodyClassName, noPadding = false }: PanelProps) {
  return (
    <section className={cn("overflow-hidden rounded-xl border border-[#e7dccd] bg-white shadow-[0_18px_50px_-42px_rgba(73,55,47,0.55)]", className)}>
      {title || description || actions ? (
        <div className="flex flex-col gap-3 border-b border-[#f0e6d8] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            {title ? <h2 className="font-display text-xl leading-tight text-[#49372f]">{title}</h2> : null}
            {description ? <p className="mt-0.5 text-[0.72rem] text-[#8a776a]">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className={cn(!noPadding && "p-5 sm:p-6", bodyClassName)}>{children}</div>
    </section>
  );
}

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, hint, required, children, className }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="admin-label">
        {label}
        {required ? <span className="ml-1 text-[#b89555]">*</span> : null}
      </label>
      {children}
      {hint ? <p className="mt-1 text-[0.64rem] leading-relaxed text-[#a08e80]">{hint}</p> : null}
    </div>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[0.8rem] font-medium text-[#49372f]">{label}</p>
        {description ? <p className="mt-0.5 text-[0.68rem] leading-relaxed text-[#8a776a]">{description}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition disabled:opacity-50",
          checked ? "border-[#762f43] bg-[#762f43]" : "border-[#d9cbb9] bg-[#ede2d3]"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-[1.1rem] w-[1.1rem] rounded-full bg-white shadow-sm transition-all",
            checked ? "left-[1.4rem]" : "left-0.5"
          )}
        />
      </button>
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "gold" | "deep";
  className?: string;
}

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.56rem] font-medium uppercase tracking-[0.14em]",
        tone === "neutral" && "bg-[#f0e6d8] text-[#8a776a]",
        tone === "success" && "bg-emerald-50 text-emerald-700",
        tone === "warning" && "bg-amber-50 text-amber-700",
        tone === "danger" && "bg-red-50 text-red-700",
        tone === "gold" && "bg-[#f5ebdd] text-[#9d7a3d]",
        tone === "deep" && "bg-[#762f43] text-white",
        className
      )}
    >
      {children}
    </span>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {icon ? <div className="grid h-14 w-14 place-items-center rounded-full bg-[#f5ebdd] text-[#b89555]">{icon}</div> : null}
      <h3 className="mt-4 font-display text-2xl text-[#49372f]">{title}</h3>
      {description ? <p className="mt-2 max-w-sm text-[0.78rem] leading-relaxed text-[#8a776a]">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg" | "xl";
}

export function Modal({ open, onClose, title, description, children, footer, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-[#2f0e18]/55 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close dialog" />
      <div
        className={cn(
          "relative flex max-h-[92vh] w-full flex-col rounded-t-2xl border border-[#e2d6c6] bg-white shadow-2xl sm:rounded-xl",
          size === "md" && "sm:max-w-lg",
          size === "lg" && "sm:max-w-2xl",
          size === "xl" && "sm:max-w-4xl"
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#f0e6d8] px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-2xl leading-tight text-[#49372f]">{title}</h2>
            {description ? <p className="mt-1 text-[0.72rem] leading-relaxed text-[#8a776a]">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#8a776a] transition hover:bg-[#f5ebdd] hover:text-[#49372f]"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer ? <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#f0e6d8] px-5 py-4 sm:px-6">{footer}</div> : null}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: "deep" | "gold" | "blush" | "neutral";
}

export function StatCard({ label, value, hint, icon, tone = "neutral" }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-5",
        tone === "deep" && "border-[#762f43] bg-[#762f43] text-white",
        tone === "gold" && "border-[#e3cfaa] bg-[#f8f0e2] text-[#49372f]",
        tone === "blush" && "border-[#e9c9cf] bg-[#f9ecee] text-[#49372f]",
        tone === "neutral" && "border-[#e7dccd] bg-white text-[#49372f]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={cn("text-[0.58rem] font-medium uppercase tracking-[0.2em]", tone === "deep" ? "text-white/60" : "text-[#8a776a]")}>
            {label}
          </p>
          <p className="mt-2 font-display text-4xl leading-none">{value}</p>
          {hint ? <p className={cn("mt-2 text-[0.64rem]", tone === "deep" ? "text-white/55" : "text-[#a08e80]")}>{hint}</p> : null}
        </div>
        {icon ? (
          <span className={cn("grid h-10 w-10 place-items-center rounded-full", tone === "deep" ? "bg-white/10 text-[#e8cf9b]" : "bg-[#f5ebdd] text-[#b89555]")}>
            {icon}
          </span>
        ) : null}
      </div>
    </div>
  );
}

interface AlertProps {
  tone?: "info" | "warning" | "danger" | "success";
  children: ReactNode;
  className?: string;
}

export function Alert({ tone = "info", children, className }: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-[0.76rem] leading-relaxed",
        tone === "info" && "border-[#e2d6c6] bg-[#faf4eb] text-[#6f5c4f]",
        tone === "warning" && "border-amber-200 bg-amber-50 text-amber-800",
        tone === "danger" && "border-red-200 bg-red-50 text-red-700",
        tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        className
      )}
      role={tone === "danger" || tone === "warning" ? "alert" : undefined}
    >
      {children}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin text-[#b89555]", className)} />;
}

export function LoadingScreen({ label = "Loading" }: { label?: string }) {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="text-center">
        <Spinner className="mx-auto h-6 w-6" />
        <p className="mt-3 text-[0.62rem] uppercase tracking-[0.24em] text-[#8a776a]">{label}</p>
      </div>
    </div>
  );
}
