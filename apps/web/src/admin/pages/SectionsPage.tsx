import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Eye, EyeOff, ListTree, Save, Undo2 } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import type { InvitationSection } from "../../types";
import { AdminButton, Alert, Badge, LoadingScreen, PageHeader, Panel } from "../components/AdminUI";
import { useToast } from "../AdminProviders";
import { cn } from "../../lib/utils";

const descriptions: Record<string, string> = {
  opening: "The cinematic curtain reveal that introduces the invitation.",
  hero: "The couple's names, date, and opening portrait.",
  ganesh: "The Ganesh invocation and traditional blessing.",
  bride: "The bride's portrait and personal introduction.",
  groom: "The groom's portrait and personal introduction.",
  family: "Parents, siblings, and loved ones from both families.",
  story: "The timeline of moments that brought the couple together.",
  countdown: "A live countdown to the chosen celebration.",
  events: "Every ceremony and gathering with dates and venues.",
  vivah: "The sacred Vivah Sanskar rituals and muhurat.",
  venue: "The wedding venue, directions, and nearby hotels.",
  gallery: "A curated collection of photographs.",
  music: "The invitation soundtrack and track list.",
  rsvp: "The guest response form and attendance choices.",
  blessing: "A final blessing and thank-you from the families."
};

export function SectionsPage() {
  const query = useQuery({ queryKey: ["admin", "sections"], queryFn: api.admin.sections });
  const queryClient = useQueryClient();
  const toast = useToast();
  const [sections, setSections] = useState<InvitationSection[]>([]);
  const [snapshot, setSnapshot] = useState("[]");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query.data) return;
    const ordered = [...query.data].sort((left, right) => left.order - right.order);
    setSections(ordered);
    setSnapshot(JSON.stringify(ordered));
  }, [query.data]);

  const dirty = JSON.stringify(sections) !== snapshot;

  const save = useMutation({
    mutationFn: (payload: InvitationSection[]) =>
      api.admin.updateSections(payload.map((section, index) => ({ id: section.id, visible: section.visible, order: index }))),
    onSuccess: (updated) => {
      const ordered = [...updated].sort((left, right) => left.order - right.order);
      setSections(ordered);
      setSnapshot(JSON.stringify(ordered));
      queryClient.invalidateQueries({ queryKey: ["admin", "sections"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "wedding"] });
      queryClient.invalidateQueries({ queryKey: ["public-site"] });
      toast.success("Invitation sections saved.");
    },
    onError: (caught) => {
      const message = caught instanceof ApiError ? caught.message : "The section order could not be saved.";
      setError(message);
      toast.error(message);
    }
  });

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    setSections((current) => {
      const next = [...current];
      const [item] = next.splice(index, 1);
      if (!item) return current;
      next.splice(target, 0, item);
      return next;
    });
  };

  const toggle = (id: string) => {
    setSections((current) => current.map((section) => (section.id === id ? { ...section, visible: !section.visible } : section)));
  };

  const submit = () => {
    setError("");
    save.mutate(sections);
  };

  if (query.isLoading) return <LoadingScreen label="Loading invitation sections" />;
  if (query.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="font-display text-2xl text-red-800">Sections could not be loaded</h1>
        <AdminButton className="mt-4" variant="danger" onClick={() => query.refetch()}>Try again</AdminButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Design"
        title="Invitation sections"
        description="Choose what appears on the invitation and the order in which guests experience it."
        actions={
          <>
            <Badge tone={dirty ? "warning" : "success"}>{dirty ? "Unsaved changes" : "Saved"}</Badge>
            <AdminButton variant="outline" disabled={!dirty} onClick={() => { setSections(JSON.parse(snapshot) as InvitationSection[]); setError(""); }}>
              <Undo2 className="h-3.5 w-3.5" />
              Discard
            </AdminButton>
            <AdminButton onClick={submit} loading={save.isPending} disabled={!dirty}>
              <Save className="h-3.5 w-3.5" />
              Save sections
            </AdminButton>
          </>
        }
      />

      {error ? <Alert tone="danger">{error}</Alert> : null}

      <Panel title="Section order" description="Use the arrows to move sections. Hidden sections stay in the studio but are removed from the public invitation." noPadding>
        <div className="divide-y divide-[#f0e6d8]">
          {sections.map((section, index) => (
            <div key={section.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f5ebdd] font-display text-sm text-[#762f43]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="grid h-5 w-5 place-items-center rounded text-[#a08e80] transition hover:bg-[#f5ebdd] hover:text-[#762f43] disabled:opacity-30"
                    aria-label={`Move ${section.label} up`}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === sections.length - 1}
                    className="grid h-5 w-5 place-items-center rounded text-[#a08e80] transition hover:bg-[#f5ebdd] hover:text-[#762f43] disabled:opacity-30"
                    aria-label={`Move ${section.label} down`}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[0.84rem] font-medium text-[#49372f]">{section.label}</p>
                  <span className="rounded-full bg-[#faf4eb] px-2 py-0.5 font-mono text-[0.54rem] text-[#a08e80]">{section.key}</span>
                  <Badge tone={section.visible ? "success" : "neutral"}>{section.visible ? "Visible" : "Hidden"}</Badge>
                </div>
                <p className="mt-1 text-[0.66rem] leading-relaxed text-[#8a776a]">{descriptions[section.key] ?? "A section of your invitation."}</p>
              </div>
              <button
                type="button"
                onClick={() => toggle(section.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[0.56rem] font-medium uppercase tracking-[0.12em] transition",
                  section.visible
                    ? "border-[#d9cbb9] bg-white text-[#6f5c4f] hover:border-[#b89555] hover:text-[#762f43]"
                    : "border-transparent bg-[#f5ebdd] text-[#a08e80] hover:text-[#762f43]"
                )}
              >
                {section.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {section.visible ? "Visible" : "Hidden"}
              </button>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#e7dccd] bg-white p-4">
          <p className="text-[0.55rem] uppercase tracking-[0.18em] text-[#a08e80]">Visible sections</p>
          <p className="mt-1 font-display text-3xl text-[#49372f]">{sections.filter((section) => section.visible).length}</p>
        </div>
        <div className="rounded-xl border border-[#e7dccd] bg-white p-4">
          <p className="text-[0.55rem] uppercase tracking-[0.18em] text-[#a08e80]">Hidden sections</p>
          <p className="mt-1 font-display text-3xl text-[#49372f]">{sections.filter((section) => !section.visible).length}</p>
        </div>
        <div className="rounded-xl border border-[#e7dccd] bg-white p-4">
          <p className="text-[0.55rem] uppercase tracking-[0.18em] text-[#a08e80]">Total sections</p>
          <p className="mt-1 font-display text-3xl text-[#49372f]">{sections.length}</p>
        </div>
      </div>

      <p className="flex items-center gap-2 text-[0.62rem] leading-relaxed text-[#a08e80]">
        <ListTree className="h-3.5 w-3.5 shrink-0" />
        The opening curtain is a cinematic layer rather than a page section. Navigation adapts automatically to hidden sections.
      </p>
    </div>
  );
}
