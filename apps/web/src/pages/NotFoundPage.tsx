import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Ganesh } from "../components/decor/Ganesh";
import { Mandala } from "../components/decor/Mandala";
import { OrnamentDivider } from "../components/decor/Ornament";

export function NotFoundPage() {
  return (
    <div className="paper-deep relative grid min-h-screen place-items-center overflow-hidden px-6 py-20 text-center text-[#fff8ee]">
      <Mandala className="pointer-events-none absolute left-1/2 top-1/2 h-[72vmin] w-[72vmin] -translate-x-1/2 -translate-y-1/2 text-[#d8bd83]/[0.12] animate-spin-slow" />
      <div className="relative max-w-lg">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[#d8bd83]/40 text-[#d8bd83]">
          <Ganesh className="h-9 w-9" />
        </span>
        <p className="mt-6 text-[0.55rem] uppercase tracking-[0.4em] text-[#d8bd83]">Page not found</p>
        <h1 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">This path leads elsewhere</h1>
        <OrnamentDivider className="mt-6 text-[#d8bd83]" />
        <p className="mt-6 text-sm font-light leading-relaxed text-[#f3ddb9]/65">
          The page you are looking for may have moved, or the address may have been mistyped. The celebration
          is waiting for you at the invitation.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn btn-gold">
            <Home className="h-4 w-4" />
            Open the invitation
          </Link>
          <Link to="/admin" className="btn btn-outline-light">
            Wedding studio
          </Link>
        </div>
      </div>
    </div>
  );
}
