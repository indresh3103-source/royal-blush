import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { Check, Palette, RotateCcw, Save, Sparkles } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import type { ThemeSettings } from "../../types";
import { AdminButton, Alert, Badge, Field, LoadingScreen, PageHeader, Panel, Toggle } from "../components/AdminUI";
import { useToast } from "../AdminProviders";
import { cn } from "../../lib/utils";
import { themeVariables } from "../../lib/theme";

type ThemeForm = Omit<ThemeSettings, "id">;

const defaults: ThemeForm = {
  preset: "royal-blush",
  primaryColor: "#B89555",
  accentColor: "#E9BFC7",
  backgroundColor: "#F5EBDD",
  deepColor: "#762F43",
  textColor: "#49372F",
  headingFont: "Cormorant Garamond",
  bodyFont: "Poppins",
  curtainStyle: "blush-velvet",
  ornamentStyle: "classic",
  animationIntensity: "balanced",
  showMandala: true,
  showFlorals: true,
  galleryLayout: "editorial"
};

const presets: Array<{ id: string; name: string; description: string; values: Partial<ThemeForm> }> = [
  {
    id: "royal-blush",
    name: "Royal Blush",
    description: "Rose velvet, warm ivory, and antique gold.",
    values: { ...defaults }
  },
  {
    id: "ivory-gold",
    name: "Ivory & Gold",
    description: "Sunlit ivory with restrained gilded details.",
    values: {
      preset: "ivory-gold",
      primaryColor: "#C0A062",
      accentColor: "#E7D7BE",
      backgroundColor: "#FBF6EC",
      deepColor: "#6E5534",
      textColor: "#4A3E31",
      curtainStyle: "ivory-silk",
      ornamentStyle: "minimal",
      animationIntensity: "subtle",
      showMandala: false,
      showFlorals: true,
      galleryLayout: "masonry"
    }
  },
  {
    id: "burgundy-heirloom",
    name: "Burgundy Heirloom",
    description: "Deep wine velvet and heirloom gold.",
    values: {
      preset: "burgundy-heirloom",
      primaryColor: "#D8BD83",
      accentColor: "#C98C97",
      backgroundColor: "#F3E7E4",
      deepColor: "#5B1E2D",
      textColor: "#402A2C",
      curtainStyle: "burgundy-velvet",
      ornamentStyle: "classic",
      animationIntensity: "cinematic",
      showMandala: true,
      showFlorals: true,
      galleryLayout: "editorial"
    }
  },
  {
    id: "emerald-mehndi",
    name: "Emerald Mehndi",
    description: "Sacred green, soft henna, and warm gold.",
    values: {
      preset: "emerald-mehndi",
      primaryColor: "#C6A15B",
      accentColor: "#B9C6A1",
      backgroundColor: "#F1EDE1",
      deepColor: "#1F4A3D",
      textColor: "#33443B",
      curtainStyle: "ivory-silk",
      ornamentStyle: "floral",
      animationIntensity: "balanced",
      showMandala: true,
      showFlorals: true,
      galleryLayout: "grid"
    }
  },
  {
    id: "midnight-plum",
    name: "Midnight Plum",
    description: "A moonlit, modern interpretation of the celebration.",
    values: {
      preset: "midnight-plum",
      primaryColor: "#D9B978",
      accentColor: "#D7A4B2",
      backgroundColor: "#F0E7E9",
      deepColor: "#3A1D33",
      textColor: "#3D2B36",
      curtainStyle: "blush-velvet",
      ornamentStyle: "minimal",
      animationIntensity: "cinematic",
      showMandala: false,
      showFlorals: false,
      galleryLayout: "masonry"
    }
  }
];

const colorFields: Array<{ key: keyof Pick<ThemeForm, "primaryColor" | "accentColor" | "backgroundColor" | "deepColor" | "textColor">; label: string; hint: string }> = [
  { key: "primaryColor", label: "Gold & ornament", hint: "Accents, dividers, and fine details." },
  { key: "accentColor", label: "Blush accent", hint: "Soft highlights and secondary accents." },
  { key: "backgroundColor", label: "Paper background", hint: "The warm base behind invitation sections." },
  { key: "deepColor", label: "Velvet deep", hint: "Dark panels, buttons, and cinematic sections." },
  { key: "textColor", label: "Ink", hint: "Primary text colour on light paper." }
];

const headingFonts = ["Cormorant Garamond", "Cinzel", "Marcellus", "Poppins"];
const bodyFonts = ["Poppins", "Cormorant Garamond", "Marcellus"];
const curtainStyles = [
  { value: "blush-velvet", label: "Blush velvet" },
  { value: "ivory-silk", label: "Ivory silk" },
  { value: "burgundy-velvet", label: "Burgundy velvet" }
];
const ornamentStyles = [
  { value: "classic", label: "Classic" },
  { value: "floral", label: "Floral" },
  { value: "minimal", label: "Minimal" }
];
const animations = [
  { value: "subtle", label: "Subtle" },
  { value: "balanced", label: "Balanced" },
  { value: "cinematic", label: "Cinematic" }
];
const galleryLayouts = [
  { value: "editorial", label: "Editorial" },
  { value: "masonry", label: "Masonry" },
  { value: "grid", label: "Grid" }
];

function toForm(theme: ThemeSettings): ThemeForm {
  return {
    preset: theme.preset,
    primaryColor: theme.primaryColor,
    accentColor: theme.accentColor,
    backgroundColor: theme.backgroundColor,
    deepColor: theme.deepColor,
    textColor: theme.textColor,
    headingFont: theme.headingFont,
    bodyFont: theme.bodyFont,
    curtainStyle: theme.curtainStyle,
    ornamentStyle: theme.ornamentStyle,
    animationIntensity: theme.animationIntensity,
    showMandala: theme.showMandala,
    showFlorals: theme.showFlorals,
    galleryLayout: theme.galleryLayout
  };
}

const hexPattern = /^#[0-9a-fA-F]{6}$/;

export function ThemePage() {
  const query = useQuery({ queryKey: ["admin", "wedding"], queryFn: api.admin.wedding });
  const queryClient = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState<ThemeForm>(defaults);
  const [snapshot, setSnapshot] = useState(JSON.stringify(defaults));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query.data?.theme) return;
    const next = toForm(query.data.theme);
    setForm(next);
    setSnapshot(JSON.stringify(next));
  }, [query.data?.theme?.id]);

  const dirty = JSON.stringify(form) !== snapshot;
  const wedding = query.data;
  const bride = wedding?.brideShortName || wedding?.brideName || "The bride";
  const groom = wedding?.groomShortName || wedding?.groomName || "The groom";
  const dateLine = wedding
    ? [DateTime.fromISO(wedding.weddingDate, { zone: wedding.timezone }).toFormat("d LLLL yyyy"), wedding.city]
        .filter(Boolean)
        .join(" · ")
    : "";

  const save = useMutation({
    mutationFn: (payload: ThemeForm) => api.admin.updateTheme(payload as unknown as Record<string, unknown>),
    onSuccess: (theme) => {
      const next = toForm(theme);
      setForm(next);
      setSnapshot(JSON.stringify(next));
      queryClient.invalidateQueries({ queryKey: ["admin", "wedding"] });
      queryClient.invalidateQueries({ queryKey: ["public-site"] });
      toast.success("Theme saved.");
    },
    onError: (caught) => {
      const message = caught instanceof ApiError ? caught.message : "The theme could not be saved.";
      setError(message);
      toast.error(message);
    }
  });

  const submit = () => {
    setError("");
    for (const field of colorFields) {
      if (!hexPattern.test(form[field.key])) {
        setError(`${field.label} must be a six-digit hex colour, for example #B89555.`);
        return;
      }
    }
    save.mutate(form);
  };

  const applyPreset = (preset: (typeof presets)[number]) => {
    setForm((current) => ({ ...current, ...preset.values }));
    setError("");
  };

  const previewTheme = useMemo(() => ({ ...defaults, ...form, id: "preview" }) as ThemeSettings, [form]);
  const previewStyle = themeVariables(previewTheme);

  if (query.isLoading) return <LoadingScreen label="Preparing the theme studio" />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Design"
        title="Theme studio"
        description="Shape the palette, typography, and atmosphere of your invitation."
        actions={
          <>
            <Badge tone={dirty ? "warning" : "success"}>{dirty ? "Unsaved changes" : "Saved"}</Badge>
            <AdminButton variant="outline" disabled={!dirty} onClick={() => { setForm(JSON.parse(snapshot) as ThemeForm); setError(""); }}>
              <RotateCcw className="h-3.5 w-3.5" />
              Discard
            </AdminButton>
            <AdminButton onClick={submit} loading={save.isPending} disabled={!dirty}>
              <Save className="h-3.5 w-3.5" />
              Save theme
            </AdminButton>
          </>
        }
      />

      {error ? <Alert tone="danger">{error}</Alert> : null}

      <Panel title="Signature palettes" description="Begin with a considered starting point, then refine every detail.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {presets.map((preset) => {
            const active = form.preset === preset.id;
            const values = { ...defaults, ...preset.values };
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={cn(
                  "relative overflow-hidden rounded-lg border p-3 text-left transition",
                  active ? "border-[#b89555] bg-[#faf4eb] shadow-[inset_0_0_0_1px_#b89555]" : "border-[#e7dccd] bg-white hover:border-[#d9cbb9]"
                )}
              >
                <div className="flex h-14 overflow-hidden rounded-md">
                  <span className="flex-1" style={{ backgroundColor: values.deepColor }} />
                  <span className="flex-1" style={{ backgroundColor: values.primaryColor }} />
                  <span className="flex-1" style={{ backgroundColor: values.accentColor }} />
                  <span className="flex-1" style={{ backgroundColor: values.backgroundColor }} />
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-1">
                  <span className="font-display text-lg leading-tight text-[#49372f]">{preset.name}</span>
                  {active ? <Check className="h-4 w-4 shrink-0 text-[#762f43]" /> : null}
                </div>
                <span className="mt-0.5 block text-[0.6rem] leading-relaxed text-[#8a776a]">{preset.description}</span>
              </button>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Panel title="Colour palette" description="Each colour is applied across the invitation through a shared design system.">
            <div className="space-y-4">
              {colorFields.map((field) => (
                <div key={field.key} className="grid items-end gap-3 sm:grid-cols-[7rem_1fr]">
                  <div>
                    <span className="admin-label">{field.label}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        aria-label={`${field.label} colour picker`}
                        value={hexPattern.test(form[field.key]) ? form[field.key] : "#000000"}
                        onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value.toUpperCase(), preset: "custom" }))}
                        className="h-10 w-12 cursor-pointer rounded-md border border-[#e2d6c6] bg-white p-1"
                      />
                      <input
                        value={form[field.key]}
                        onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value, preset: "custom" }))}
                        className="admin-input font-mono text-[0.72rem] uppercase"
                        maxLength={7}
                        aria-label={`${field.label} hex value`}
                      />
                    </div>
                  </div>
                  <p className="pb-2 text-[0.66rem] leading-relaxed text-[#a08e80]">{field.hint}</p>
                </div>
              ))}
            </div>
          </Panel>

          <div className="grid gap-6 sm:grid-cols-2">
            <Panel title="Typography" description="A refined pairing for names and body text.">
              <div className="space-y-4">
                <Field label="Heading font" htmlFor="heading-font">
                  <select id="heading-font" className="admin-input" value={form.headingFont} onChange={(event) => setForm((current) => ({ ...current, headingFont: event.target.value }))}>
                    {headingFonts.map((font) => <option key={font} value={font}>{font}</option>)}
                  </select>
                </Field>
                <Field label="Body font" htmlFor="body-font">
                  <select id="body-font" className="admin-input" value={form.bodyFont} onChange={(event) => setForm((current) => ({ ...current, bodyFont: event.target.value }))}>
                    {bodyFonts.map((font) => <option key={font} value={font}>{font}</option>)}
                  </select>
                </Field>
              </div>
            </Panel>

            <Panel title="Atmosphere" description="The textures and motion that frame the story.">
              <div className="space-y-4">
                <Field label="Curtain style" htmlFor="curtain-style">
                  <select id="curtain-style" className="admin-input" value={form.curtainStyle} onChange={(event) => setForm((current) => ({ ...current, curtainStyle: event.target.value }))}>
                    {curtainStyles.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </Field>
                <Field label="Ornament style" htmlFor="ornament-style">
                  <select id="ornament-style" className="admin-input" value={form.ornamentStyle} onChange={(event) => setForm((current) => ({ ...current, ornamentStyle: event.target.value }))}>
                    {ornamentStyles.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </Field>
                <Field label="Animation intensity" htmlFor="animation-style">
                  <select id="animation-style" className="admin-input" value={form.animationIntensity} onChange={(event) => setForm((current) => ({ ...current, animationIntensity: event.target.value }))}>
                    {animations.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </Field>
              </div>
            </Panel>
          </div>

          <Panel title="Details & layout" description="Choose which decorative layers and gallery arrangement to use.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Toggle checked={form.showMandala} onChange={(value) => setForm((current) => ({ ...current, showMandala: value }))} label="Mandala motifs" description="Sacred circular ornaments behind key sections." />
              <Toggle checked={form.showFlorals} onChange={(value) => setForm((current) => ({ ...current, showFlorals: value }))} label="Floral flourishes" description="Delicate botanical details and corner ornaments." />
              <Field label="Gallery layout" htmlFor="gallery-layout" className="sm:col-span-2">
                <select id="gallery-layout" className="admin-input" value={form.galleryLayout} onChange={(event) => setForm((current) => ({ ...current, galleryLayout: event.target.value }))}>
                  {galleryLayouts.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </Field>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Live preview" description="A miniature of the invitation's visual language." className="xl:sticky xl:top-24">
            <div className="overflow-hidden rounded-lg border border-[#e2d6c6]" style={previewStyle}>
              <div className="relative overflow-hidden px-6 py-10 text-center" style={{ backgroundColor: form.deepColor, color: "#fff8ee" }}>
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-20"
                  style={{ borderColor: form.primaryColor }}
                />
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-10" style={{ borderColor: form.primaryColor }} />
                <p className="relative text-[0.45rem] uppercase tracking-[0.38em]" style={{ color: form.primaryColor }}>Together with our families</p>
                <p className="relative mt-4 font-display text-4xl leading-none" style={{ fontFamily: `"${form.headingFont}", Georgia, serif` }}>{groom}</p>
                <p className="relative my-1 font-script text-3xl" style={{ color: form.primaryColor }}>&amp;</p>
                <p className="relative font-display text-4xl leading-none" style={{ fontFamily: `"${form.headingFont}", Georgia, serif` }}>{bride}</p>
                <div className="relative mx-auto mt-5 h-px w-24" style={{ backgroundColor: form.primaryColor, opacity: 0.55 }} />
                <p className="relative mt-4 text-[0.5rem] uppercase tracking-[0.28em]" style={{ color: form.primaryColor }}>{dateLine}</p>
              </div>
              <div className="px-6 py-7" style={{ backgroundColor: form.backgroundColor, color: form.textColor }}>
                <p className="text-center text-[0.45rem] uppercase tracking-[0.3em]" style={{ color: form.primaryColor }}>The Celebration</p>
                <p className="mt-3 text-center font-display text-2xl leading-tight" style={{ fontFamily: `"${form.headingFont}", Georgia, serif` }}>A sacred union awaits</p>
                <p className="mt-3 text-center text-[0.65rem] leading-relaxed" style={{ fontFamily: `"${form.bodyFont}", sans-serif`, opacity: 0.72 }}>
                  With joyful hearts, we invite you to share in the vows, rituals, and celebrations that begin our forever.
                </p>
                <div className="mt-5 flex justify-center">
                  <span className="rounded-full px-5 py-2 text-[0.48rem] font-medium uppercase tracking-[0.18em] text-white" style={{ backgroundColor: form.deepColor }}>
                    Accept invitation
                  </span>
                </div>
                <div className="mt-6 flex justify-center gap-2">
                  {[form.primaryColor, form.accentColor, form.backgroundColor, form.deepColor, form.textColor].map((color) => (
                    <span key={color} className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: color }} title={color} />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 text-[0.6rem] text-[#8a776a]">
              <span className="inline-flex items-center gap-1.5"><Palette className="h-3 w-3" /> {form.preset === "custom" ? "Custom palette" : presets.find((preset) => preset.id === form.preset)?.name ?? form.preset}</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> {form.animationIntensity}</span>
            </div>
          </Panel>

          <Panel title="Theme notes" description="How these choices reach your guests.">
            <ul className="space-y-3 text-[0.7rem] leading-relaxed text-[#8a776a]">
              <li>Colours are applied through shared CSS variables, so the entire invitation stays consistent.</li>
              <li>Reduced-motion preferences are always respected, regardless of animation intensity.</li>
              <li>The gallery layout changes how photographs are arranged on the public invitation.</li>
              <li>Theme changes are published the next time a guest opens the invitation.</li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
