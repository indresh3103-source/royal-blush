import { Navigate, Route, Routes } from "react-router-dom";
import { AdminProviders } from "./AdminProviders";
import { AdminLayout } from "./AdminLayout";
import { LoginPage, RequireAdmin, SetupPage } from "./AdminAuth";
import { DashboardPage } from "./pages/DashboardPage";
import { WeddingPage } from "./pages/WeddingPage";
import { FamilyPage } from "./pages/FamilyPage";
import { EventsPage } from "./pages/EventsPage";
import { RitualsPage } from "./pages/RitualsPage";
import { StoryPage } from "./pages/StoryPage";
import { HotelsPage } from "./pages/HotelsPage";
import { MediaPage } from "./pages/MediaPage";
import { GalleryPage } from "./pages/GalleryPage";
import { MusicPage } from "./pages/MusicPage";
import { ThemePage } from "./pages/ThemePage";
import { SectionsPage } from "./pages/SectionsPage";
import { RsvpPage } from "./pages/RsvpPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AccountPage } from "./pages/AccountPage";

export function AdminApp() {
  return (
    <AdminProviders>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="setup" element={<SetupPage />} />
        <Route element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="wedding" element={<WeddingPage />} />
            <Route path="family" element={<FamilyPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="rituals" element={<RitualsPage />} />
            <Route path="story" element={<StoryPage />} />
            <Route path="hotels" element={<HotelsPage />} />
            <Route path="media" element={<MediaPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="music" element={<MusicPage />} />
            <Route path="theme" element={<ThemePage />} />
            <Route path="sections" element={<SectionsPage />} />
            <Route path="rsvps" element={<RsvpPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="account" element={<AccountPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminProviders>
  );
}
