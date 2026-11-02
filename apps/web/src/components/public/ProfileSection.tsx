import { motion, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import type { FamilyMember, SiteData } from "../../types";
import { CornerFlourish, OrnamentDivider } from "../decor/Ornament";
import { Reveal } from "./Reveal";
import { cn, getInitials } from "../../lib/utils";

interface ProfileSectionProps {
  site: SiteData;
  person: "bride" | "groom";
}

function parentLine(members: FamilyMember[], side: "BRIDE" | "GROOM", person: "bride" | "groom") {
  const parents = members.filter((member) => member.side === side && member.relation === "PARENT");
  if (!parents.length) return "";
  const names = parents.map((parent) => parent.fullName).join(" & ");
  return `${person === "bride" ? "Daughter" : "Son"} of ${names}`;
}

export function ProfileSection({ site, person }: ProfileSectionProps) {
  const { wedding, family } = site;
  const reduce = useReducedMotion();
  const isBride = person === "bride";
  const name = isBride ? wedding.brideName : wedding.groomName;
  const shortName = (isBride ? wedding.brideShortName : wedding.groomShortName) || name.split(" ")[0] || name;
  const intro = isBride ? wedding.brideIntro : wedding.groomIntro;
  const portrait = isBride ? wedding.bridePortraitUrl : wedding.groomPortraitUrl;
  const familyPhoto = isBride ? wedding.brideFamilyPhotoUrl : wedding.groomFamilyPhotoUrl;
  const side = isBride ? "BRIDE" : "GROOM";
  const parents = parentLine(family, side, person);
  const members = family.filter((member) => member.side === side).slice(0, 4);

  return (
    <section className={cn("relative overflow-hidden py-20 sm:py-28", isBride ? "bg-[#f4e3e4]" : "paper grain")}>
      <div className="pointer-events-none absolute -left-20 top-16 h-72 w-72 rounded-full bg-royal-accent/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-royal-primary/10 blur-3xl" />
      <div className="container-rb relative z-10">
        <div className={cn("grid items-center gap-12 lg:grid-cols-2 lg:gap-20", !isBride && "lg:[&>*:first-child]:order-2")}>
          <Reveal className="relative mx-auto w-full max-w-[27rem] lg:max-w-[32rem]">
            <div className="relative">
              <div className="absolute -inset-3 rounded-t-[15rem] rounded-b-2xl border border-royal-primary/40 sm:-inset-5" />
              <div className="absolute -inset-3 rounded-t-[15rem] rounded-b-2xl border border-royal-primary/15 sm:-inset-8" />
              <div className="relative aspect-[3/4] overflow-hidden rounded-t-[14rem] rounded-b-xl bg-royal-deep/10 shadow-[0_40px_90px_-50px_rgba(73,55,47,0.8)]">
                {portrait ? (
                  <motion.img
                    src={portrait}
                    alt={name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    initial={reduce ? false : { scale: 1.05 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                ) : (
                  <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_50%_35%,#a95468,#762f43)]">
                    <span className="font-display text-6xl text-[#f7e6c2]">{getInitials(name)}</span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#2f0e18]/60 to-transparent" />
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center text-[#fff8ee]">
                  <p className="text-[0.48rem] uppercase tracking-[0.4em] text-[#e8cf9b]">{isBride ? "The Bride" : "The Groom"}</p>
                  <p className="mt-1 font-display text-2xl">{shortName}</p>
                </div>
              </div>
              <CornerFlourish className="absolute -left-8 -top-8 h-20 w-20 text-royal-primary/60" />
              <CornerFlourish className="absolute -bottom-8 -right-8 h-20 w-20 rotate-180 text-royal-primary/60" />
            </div>
            <div className="absolute -right-4 top-1/3 hidden rounded-full border border-royal-primary/40 bg-[#fbf7ef]/90 px-3 py-2 text-royal-deep shadow-md sm:block">
              <Heart className="h-4 w-4" />
            </div>
          </Reveal>

          <div className={cn("relative", !isBride && "lg:text-right")}>
            <Reveal>
              <p className={cn("kicker", !isBride && "lg:justify-end")}>{isBride ? "The Bride" : "The Groom"}</p>
              <h2 className="mt-4 font-display text-[clamp(2.8rem,6vw,5.2rem)] leading-[0.95] text-royal-deep">{name}</h2>
              {parents ? (
                <p className="mt-3 text-[0.62rem] uppercase tracking-[0.26em] text-royal-primary">{parents}</p>
              ) : null}
            </Reveal>
            <Reveal delay={0.1}>
              <OrnamentDivider
                variant={site.theme.ornamentStyle as "classic" | "floral" | "minimal"}
                className={cn("mt-6", !isBride && "lg:ml-auto lg:mr-0")}
              />
            </Reveal>
            {intro ? (
              <Reveal delay={0.16}>
                <p className="lede mt-6 max-w-xl text-pretty lg:ml-auto">{intro}</p>
              </Reveal>
            ) : null}
            <Reveal delay={0.24}>
              <p className="script mt-7 text-4xl text-royal-deep/75 sm:text-5xl">{shortName}</p>
            </Reveal>
            {members.length ? (
              <Reveal delay={0.3} className="mt-8">
                <div className={cn("flex flex-wrap gap-x-6 gap-y-3", !isBride && "lg:justify-end")}>
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-royal-primary/30 bg-royal-primary/10 text-[0.55rem] font-medium text-royal-deep">
                        {member.photoUrl ? (
                          <img src={member.photoUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          getInitials(member.fullName)
                        )}
                      </span>
                      <span className="text-[0.58rem] uppercase tracking-[0.14em] text-royal-ink/65">
                        {member.role}
                        <span className="block font-display text-sm normal-case tracking-normal text-royal-ink/80">
                          {member.fullName}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </Reveal>
            ) : null}
            {familyPhoto ? (
              <Reveal delay={0.36} className="mt-8">
                <div className={cn("flex items-center gap-4", !isBride && "lg:justify-end")}>
                  <img
                    src={familyPhoto}
                    alt={`${isBride ? "Bride" : "Groom"}'s family`}
                    className="h-16 w-24 rounded-sm border border-royal-primary/30 object-cover"
                    loading="lazy"
                  />
                  <div className={cn(!isBride && "text-right")}>
                    <p className="text-[0.5rem] uppercase tracking-[0.3em] text-royal-primary">With love, from</p>
                    <p className="font-display text-lg text-royal-deep">the family</p>
                  </div>
                </div>
              </Reveal>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
