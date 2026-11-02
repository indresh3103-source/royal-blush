import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { InvitationPage } from "./components/public/InvitationPage";
import { CreditsPage } from "./pages/CreditsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

const AdminApp = lazy(() => import("./admin/AdminApp").then((module) => ({ default: module.AdminApp })));

function AdminFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#faf4eb]">
      <div className="text-center">
        <p className="text-[0.55rem] uppercase tracking-[0.34em] text-[#b89555]">Wedding Studio</p>
        <p className="mt-3 font-display text-3xl text-[#49372f]">Opening the studio</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<InvitationPage />} />
      <Route path="/credits" element={<CreditsPage />} />
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<AdminFallback />}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
