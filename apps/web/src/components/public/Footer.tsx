import { Heart } from "lucide-react";
import type { SiteData } from "../../types";
import { Monogram } from "../decor/Ornament";

interface FooterProps {
  site: SiteData;
}

export function Footer({ site }: FooterProps) {
  const initials = site.wedding.coupleInitials || `${site.wedding.groomName[0] ?? ""} & ${site.wedding.brideName[0] ?? ""}`;
  return (
    <footer className="border-t border-[#d8bd83]/20 bg-[#2a0c15] py-10 text-[#f7e6c2]">
      <div className="container-rb flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-4">
          <Monogram initials={initials} className="h-12 w-12 text-[#d8bd83]" />
          <div>
            <p className="font-display text-lg text-[#fff8ee]">{site.wedding.title}</p>
            <p className="text-[0.5rem] uppercase tracking-[0.3em] text-[#d8bd83]/70">
              {site.wedding.city ? `${site.wedding.city} · ` : ""}
              {site.wedding.weddingDate.slice(0, 4)}
            </p>
          </div>
        </div>
        <p className="flex items-center gap-2 text-[0.55rem] uppercase tracking-[0.24em] text-[#f7e6c2]/45">
          Made with <Heart className="h-3 w-3 text-[#d8bd83]" /> for our forever
        </p>
        <div className="flex items-center gap-5 text-[0.5rem] uppercase tracking-[0.22em] text-[#f7e6c2]/45">
          <a href="/credits" className="transition hover:text-[#e8cf9b]">
            Credits
          </a>
          <a href="/admin" className="transition hover:text-[#e8cf9b]">
            Admin
          </a>
        </div>
      </div>
    </footer>
  );
}
