import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Pencil, Plus, Trash2, Users } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import type { FamilyMember, FamilyRelation, FamilySide } from "../../types";
import { AdminButton, Badge, EmptyState, Field, LoadingScreen, Modal, PageHeader, Panel, Toggle } from "../components/AdminUI";
import { MediaField } from "../components/MediaPicker";
import { useConfirm, useToast } from "../AdminProviders";
import { getInitials } from "../../lib/utils";

interface FamilyForm {
  side: FamilySide;
  relation: FamilyRelation;
  role: string;
  fullName: string;
  bio: string;
  photoUrl: string;
  visible: boolean;
  order: string;
}

const emptyForm: FamilyForm = {
  side: "BRIDE",
  relation: "PARENT",
  role: "",
  fullName: "",
  bio: "",
  photoUrl: "",
  visible: true,
  order: "0"
};

const relations: FamilyRelation[] = ["GRANDPARENT", "PARENT", "BROTHER", "SISTER", "UNCLE", "AUNT", "OTHER"];

export function FamilyPage() {
  const query = useQuery({ queryKey: ["admin", "family"], queryFn: api.admin.family });
  const queryClient = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FamilyMember | null>(null);
  const [form, setForm] = useState<FamilyForm>(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) setError("");
  }, [open]);

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editing ? api.admin.updateFamily(editing.id, payload) : api.admin.createFamily(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "family"] });
      queryClient.invalidateQueries({ queryKey: ["public-site"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "wedding"] });
      toast.success(editing ? "Family member updated." : "Family member added.");
      setOpen(false);
      setEditing(null);
    },
    onError: (caught) => {
      const message = caught instanceof ApiError ? caught.message : "The family member could not be saved.";
      setError(message);
      toast.error(message);
    }
  });

  const toggle = useMutation({
    mutationFn: ({ id, visible }: { id: string; visible: boolean }) => api.admin.updateFamily(id, { visible }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "family"] });
      queryClient.invalidateQueries({ queryKey: ["public-site"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "wedding"] });
    },
    onError: (caught) => toast.error(caught instanceof ApiError ? caught.message : "Visibility could not be changed.")
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.admin.deleteFamily(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "family"] });
      queryClient.invalidateQueries({ queryKey: ["public-site"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "wedding"] });
      toast.success("Family member removed.");
    },
    onError: (caught) => toast.error(caught instanceof ApiError ? caught.message : "The family member could not be removed.")
  });

  const openCreate = (side: FamilySide = "BRIDE") => {
    setEditing(null);
    setForm({ ...emptyForm, side, order: String(query.data?.length ?? 0) });
    setOpen(true);
  };

  const openEdit = (member: FamilyMember) => {
    setEditing(member);
    setForm({
      side: member.side,
      relation: member.relation,
      role: member.role,
      fullName: member.fullName,
      bio: member.bio ?? "",
      photoUrl: member.photoUrl ?? "",
      visible: member.visible ?? true,
      order: String(member.order)
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.fullName.trim() || !form.role.trim()) {
      setError("A name and relationship label are required.");
      return;
    }
    save.mutate({
      side: form.side,
      relation: form.relation,
      role: form.role.trim(),
      fullName: form.fullName.trim(),
      bio: form.bio.trim() || null,
      photoUrl: form.photoUrl.trim() || null,
      visible: form.visible,
      order: Number(form.order) || 0
    });
  };

  const requestDelete = async (member: FamilyMember) => {
    const ok = await confirm({
      title: `Remove ${member.fullName}?`,
      message: "This family member will disappear from the public invitation. This cannot be undone.",
      confirmLabel: "Remove",
      tone: "danger"
    });
    if (ok) remove.mutate(member.id);
  };

  const toggleVisibility = (member: FamilyMember) => {
    toggle.mutate({ id: member.id, visible: !(member.visible ?? true) });
  };

  if (query.isLoading) return <LoadingScreen label="Loading family" />;
  const members = query.data ?? [];
  const groups: Array<{ side: FamilySide; label: string; description: string }> = [
    { side: "BRIDE", label: "Bride's family", description: "The people who raised and shaped the bride." },
    { side: "GROOM", label: "Groom's family", description: "The people who raised and shaped the groom." },
    { side: "BOTH", label: "Shared family", description: "Loved ones belonging to both sides." }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="The Invitation"
        title="Family"
        description="Honour the parents, grandparents, siblings, and relatives who make this celebration whole."
        actions={
          <AdminButton onClick={() => openCreate()}>
            <Plus className="h-3.5 w-3.5" />
            Add family member
          </AdminButton>
        }
      />

      {!members.length ? (
        <Panel noPadding>
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="No family members yet"
            description="Add the people who will be named in your family section."
            action={<AdminButton onClick={() => openCreate()}>Add the first member</AdminButton>}
          />
        </Panel>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => {
            const groupMembers = members.filter((member) => member.side === group.side);
            if (!groupMembers.length) return null;
            return (
              <Panel
                key={group.side}
                title={group.label}
                description={group.description}
                actions={
                  <AdminButton size="sm" variant="outline" onClick={() => openCreate(group.side)}>
                    <Plus className="h-3 w-3" />
                    Add
                  </AdminButton>
                }
              >
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {groupMembers.map((member) => (
                    <div key={member.id} className="group relative rounded-lg border border-[#e7dccd] bg-[#fffdf9] p-4">
                      <div className="flex items-start gap-3">
                        <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-[#e2d6c6] bg-[#f5ebdd] font-display text-sm text-[#762f43]">
                          {member.photoUrl ? (
                            <img src={member.photoUrl} alt={member.fullName} className="h-full w-full object-cover" />
                          ) : (
                            getInitials(member.fullName)
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="truncate font-display text-lg leading-tight text-[#49372f]">{member.fullName}</p>
                              <p className="text-[0.55rem] uppercase tracking-[0.16em] text-[#b89555]">{member.role}</p>
                            </div>
                            <Badge tone={member.visible ? "success" : "neutral"}>{member.visible ? "Visible" : "Hidden"}</Badge>
                          </div>
                          {member.bio ? <p className="mt-2 line-clamp-2 text-[0.7rem] leading-relaxed text-[#8a776a]">{member.bio}</p> : null}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-[#f0e6d8] pt-2.5">
                        <span className="text-[0.54rem] uppercase tracking-[0.14em] text-[#a08e80]">{member.relation.toLowerCase()} · order {member.order}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => toggleVisibility(member)} className="grid h-7 w-7 place-items-center rounded-full text-[#a08e80] transition hover:bg-[#f5ebdd] hover:text-[#762f43]" aria-label={member.visible ? "Hide member" : "Show member"}>
                            {member.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          </button>
                          <button type="button" onClick={() => openEdit(member)} className="grid h-7 w-7 place-items-center rounded-full text-[#a08e80] transition hover:bg-[#f5ebdd] hover:text-[#762f43]" aria-label={`Edit ${member.fullName}`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" onClick={() => requestDelete(member)} className="grid h-7 w-7 place-items-center rounded-full text-[#a08e80] transition hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${member.fullName}`}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit family member" : "Add family member"}
        description="Names and roles appear in the family section of the invitation."
        size="lg"
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setOpen(false)}>Cancel</AdminButton>
            <AdminButton onClick={submit} loading={save.isPending}>{editing ? "Save changes" : "Add member"}</AdminButton>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Family side" htmlFor="family-side">
            <select id="family-side" className="admin-input" value={form.side} onChange={(event) => setForm((current) => ({ ...current, side: event.target.value as FamilySide }))}>
              <option value="BRIDE">Bride's family</option>
              <option value="GROOM">Groom's family</option>
              <option value="BOTH">Shared family</option>
            </select>
          </Field>
          <Field label="Relationship" htmlFor="family-relation">
            <select id="family-relation" className="admin-input" value={form.relation} onChange={(event) => setForm((current) => ({ ...current, relation: event.target.value as FamilyRelation }))}>
              {relations.map((relation) => (
                <option key={relation} value={relation}>{relation.charAt(0) + relation.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </Field>
          <Field label="Full name" htmlFor="family-name" required>
            <input id="family-name" className="admin-input" value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
          </Field>
          <Field label="Role label" htmlFor="family-role" required hint="For example: Father, Mother, Sister.">
            <input id="family-role" className="admin-input" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} />
          </Field>
          <Field label="Short biography" htmlFor="family-bio" className="sm:col-span-2">
            <textarea id="family-bio" className="admin-input min-h-[6rem]" value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} />
          </Field>
          <div className="sm:col-span-2">
            <MediaField label="Photograph (optional)" value={form.photoUrl} onChange={(value) => setForm((current) => ({ ...current, photoUrl: value ?? "" }))} />
          </div>
          <Field label="Display order" htmlFor="family-order" hint="Lower numbers appear first.">
            <input id="family-order" type="number" min={0} max={9999} className="admin-input" value={form.order} onChange={(event) => setForm((current) => ({ ...current, order: event.target.value }))} />
          </Field>
          <div className="flex items-end pb-2">
            <Toggle checked={form.visible} onChange={(value) => setForm((current) => ({ ...current, visible: value }))} label="Show on invitation" description="Hidden members remain in the studio." />
          </div>
        </div>
        {error ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[0.75rem] text-red-700">{error}</p> : null}
      </Modal>
    </div>
  );
}
