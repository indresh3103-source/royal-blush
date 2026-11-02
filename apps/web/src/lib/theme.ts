import type { CSSProperties } from "react";
import type { ThemeSettings } from "../types";

const defaults = {
  primaryColor: "#B89555",
  accentColor: "#E9BFC7",
  backgroundColor: "#F5EBDD",
  deepColor: "#762F43",
  textColor: "#49372F",
  headingFont: "Cormorant Garamond",
  bodyFont: "Poppins"
};

const headingFallbacks: Record<string, string> = {
  "Cormorant Garamond": "Cormorant Garamond, Georgia, serif",
  Cinzel: "Cinzel, Georgia, serif",
  Marcellus: "Marcellus, Georgia, serif",
  Poppins: "Poppins, sans-serif"
};

const bodyFallbacks: Record<string, string> = {
  Poppins: "Poppins, sans-serif",
  "Cormorant Garamond": "Cormorant Garamond, Georgia, serif",
  Marcellus: "Marcellus, Georgia, serif"
};

export function applyTheme(theme: ThemeSettings | null | undefined) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const values = { ...defaults, ...(theme ?? {}) };
  root.style.setProperty("--rb-primary", values.primaryColor);
  root.style.setProperty("--rb-accent", values.accentColor);
  root.style.setProperty("--rb-bg", values.backgroundColor);
  root.style.setProperty("--rb-deep", values.deepColor);
  root.style.setProperty("--rb-text", values.textColor);
  root.style.setProperty("--rb-heading", headingFallbacks[values.headingFont] ?? headingFallbacks["Cormorant Garamond"]);
  root.style.setProperty("--rb-body", bodyFallbacks[values.bodyFont] ?? bodyFallbacks.Poppins);
  root.dataset.curtain = theme?.curtainStyle ?? "blush-velvet";
  root.dataset.ornament = theme?.ornamentStyle ?? "classic";
  root.dataset.animation = theme?.animationIntensity ?? "balanced";
}

export function themeVariables(theme: ThemeSettings | null | undefined) {
  const values = { ...defaults, ...(theme ?? {}) };
  return {
    "--rb-primary": values.primaryColor,
    "--rb-accent": values.accentColor,
    "--rb-bg": values.backgroundColor,
    "--rb-deep": values.deepColor,
    "--rb-text": values.textColor,
    "--rb-heading": headingFallbacks[values.headingFont] ?? headingFallbacks["Cormorant Garamond"],
    "--rb-body": bodyFallbacks[values.bodyFont] ?? bodyFallbacks.Poppins
  } as CSSProperties;
}
