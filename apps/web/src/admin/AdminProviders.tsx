import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "../lib/utils";

type ToastTone = "success" | "error" | "info";

interface ToastItem {
  id: string;
  tone: ToastTone;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      setItems((current) => [...current.slice(-3), { id, tone, message }]);
      window.setTimeout(() => remove(id), 4600);
    },
    [remove]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
      info: (message) => push("info", message)
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[220] flex w-[min(92vw,22rem)] flex-col gap-2" aria-live="polite">
        {items.map((item) => {
          const Icon = item.tone === "success" ? CheckCircle2 : item.tone === "error" ? XCircle : Info;
          return (
            <div
              key={item.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-lg border bg-white px-4 py-3 shadow-[0_20px_50px_-24px_rgba(73,55,47,0.55)]",
                item.tone === "success" && "border-emerald-200",
                item.tone === "error" && "border-red-200",
                item.tone === "info" && "border-[#e2d6c6]"
              )}
              role={item.tone === "error" ? "alert" : "status"}
            >
              <Icon
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0",
                  item.tone === "success" && "text-emerald-600",
                  item.tone === "error" && "text-red-600",
                  item.tone === "info" && "text-[#b89555]"
                )}
              />
              <p className="flex-1 text-[0.8rem] leading-snug text-[#49372f]">{item.message}</p>
              <button type="button" onClick={() => remove(item.id)} className="text-[#a08e80] transition hover:text-[#49372f]" aria-label="Dismiss notification">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used within ToastProvider");
  return value;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
}

interface ConfirmState {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ options, resolve });
    });
  }, []);

  const close = (value: boolean) => {
    state?.resolve(value);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state ? (
        <div className="fixed inset-0 z-[210] grid place-items-center bg-[#2f0e18]/55 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={state.options.title}>
          <button type="button" className="absolute inset-0 cursor-default" onClick={() => close(false)} aria-label="Cancel" />
          <div className="relative w-full max-w-md rounded-xl border border-[#e2d6c6] bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <span
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-full",
                  state.options.tone === "danger" ? "bg-red-50 text-red-600" : "bg-[#f5ebdd] text-[#762f43]"
                )}
              >
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-2xl leading-tight text-[#49372f]">{state.options.title}</h2>
                <p className="mt-2 text-[0.82rem] leading-relaxed text-[#8a776a]">{state.options.message}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => close(false)} className="rounded-full border border-[#e2d6c6] px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[#8a776a] transition hover:bg-[#faf4eb]">
                {state.options.cancelLabel ?? "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                className={cn(
                  "rounded-full px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-white transition",
                  state.options.tone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-[#762f43] hover:bg-[#5e2435]"
                )}
              >
                {state.options.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const value = useContext(ConfirmContext);
  if (!value) throw new Error("useConfirm must be used within ConfirmProvider");
  return value.confirm;
}

export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ConfirmProvider>{children}</ConfirmProvider>
    </ToastProvider>
  );
}
