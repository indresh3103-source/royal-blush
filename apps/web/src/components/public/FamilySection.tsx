import { Mail, Phone } from "lucide-react";
import type { FamilyMember, SiteData } from "../../types";
import { OrnamentDivider } from "../decor/Ornament";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { getInitials } from "../../lib/utils";

interface FamilySectionProps {
  site: SiteData;
}

const relationLabels: Record<string, string> = {
  GRANDPARENT: "Grandparent",
  PARENT: "Parent",
  BROTHER: "Brother",
  SISTER: "Sister",
  UNCLE: "Uncle",
  AUNT: "Aunt",
  OTHER: "Family"
};

function FamilyColumn({ members, title, surname }: { members: FamilyMember[]; title: string; surname: string }) {
  return (
    <div className="relative">
      <Reveal>
        <div className="flex items-end justify-between gap-4 border-b border-royal-primary/25 pb-4">
          <div>
            <p className="text-[0.55rem] uppercase tracking-[0.32em] text-royal-primary">{title}</p>
            <h3 className="mt-1 font-display text-3xl text-royal-deep sm:text-4xl">{surname} Family</h3>
          </div>
          <span className="font-display text-5xl leading-none text-royal-primary/20">{String(members.length).padStart(2, "0")}</span>
        </div>
      </Reveal>
      <div className="mt-2">
        {members.map((member, index) => (
          <Reveal key={member.id} delay={index * 0.05}>
            <div className="group flex gap-4 border-b border-royal-primary/[0.12] py-5">
              <div className="relative mt-1 h-12 w-12 shrink-0 overflow-hidden rounded-full border border-royal-primary/35 bg-royal-primary/10">
                {member.photoUrl ? (
                  <img src={member.photoUrl} alt={member.fullName} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <span className="grid h-full w-full place-items-center font-display text-base text-royal-deep/80">
                    {getInitials(member.fullName)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <p className="font-display text-xl leading-tight text-royal-ink sm:text-2xl">{member.fullName}</p>
                  <span className="text-[0.5rem] uppercase tracking-[0.24em] text-royal-primary">
                    {member.role || relationLabels[member.relation]}
                  </span>
                </div>
                {member.bio ? (
                  <p className="mt-1.5 text-[0.78rem] font-light leading-relaxed text-royal-ink/60">{member.bio}</p>
                ) : null}
              </div>
            </div>
          </Reveal>
        ))}
        {!members.length ? (
          <p className="py-8 text-sm italic text-royal-ink/45">Family details will be shared soon.</p>
        ) : null}
      </div>
    </div>
  );
}

export function FamilySection({ site }: FamilySectionProps) {
  const { wedding, family } = site;
  const brideMembers = family.filter((member) => member.side === "BRIDE" || member.side === "BOTH");
  const groomMembers = family.filter((member) => member.side === "GROOM" || member.side === "BOTH");
  const brideSurname = wedding.brideName.split(/\s+/).slice(-1)[0] || "Bride";
  const groomSurname = wedding.groomName.split(/\s+/).slice(-1)[0] || "Groom";

  return (
    <section className="paper grain relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute left-1/2 top-24 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full border border-royal-primary/10" />
      <div className="container-rb relative z-10">
        <SectionHeading
          kicker="Our Families"
          title="Two families, one celebration"
          description={wedding.familyIntro}
          ornament={site.theme.ornamentStyle as "classic" | "floral" | "minimal"}
        />

        {wedding.familyPhotoUrl ? (
          <Reveal className="mt-12">
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute -inset-2 border border-royal-primary/30 sm:-inset-3" />
              <div className="image-wash relative aspect-[16/8] overflow-hidden rounded-sm sm:aspect-[16/7]">
                <img
                  src={wedding.familyPhotoUrl}
                  alt="Our families together"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 z-10 p-6 text-center sm:p-8">
                  <p className="text-[0.5rem] uppercase tracking-[0.4em] text-[#e8cf9b]">With the blessings of</p>
                  <p className="mt-2 font-display text-2xl text-[#fff8ee] sm:text-3xl">
                    The {brideSurname} & {groomSurname} Families
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        ) : null}

        <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-20">
          <FamilyColumn members={brideMembers} title="The Bride's Family" surname={brideSurname} />
          <FamilyColumn members={groomMembers} title="The Groom's Family" surname={groomSurname} />
        </div>

        <Reveal className="mt-12">
          <OrnamentDivider variant={site.theme.ornamentStyle as "classic" | "floral" | "minimal"} />
        </Reveal>

        {wedding.familyContactName ? (
          <Reveal delay={0.1} className="mt-8 text-center">
            <p className="text-[0.55rem] uppercase tracking-[0.3em] text-royal-primary">For family assistance</p>
            <p className="mt-2 font-display text-xl text-royal-deep">{wedding.familyContactName}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[0.75rem] text-royal-ink/65">
              {wedding.familyContactPhone ? (
                <a href={`tel:${wedding.familyContactPhone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-royal-deep">
                  <Phone className="h-3.5 w-3.5 text-royal-primary" />
                  {wedding.familyContactPhone}
                </a>
              ) : null}
              {wedding.familyContactEmail ? (
                <a href={`mailto:${wedding.familyContactEmail}`} className="flex items-center gap-2 hover:text-royal-deep">
                  <Mail className="h-3.5 w-3.5 text-royal-primary" />
                  {wedding.familyContactEmail}
                </a>
              ) : null}
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
