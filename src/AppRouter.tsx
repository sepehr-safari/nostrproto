import { lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";

// Lazy load page components
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Nip19Page = lazy(() => import("./pages/Nip19Page"));
const NipRedirect = lazy(() => import("./pages/NipRedirect"));
const CreateNipPage = lazy(() => import("./pages/CreateNipPage"));
const EditNipPage = lazy(() => import("./pages/EditNipPage"));
const MyNipsPage = lazy(() => import("./pages/MyNipsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const KindPage = lazy(() => import("./pages/KindPage"));

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/nip/:id" element={<NipRedirect />} />
        <Route path="/create" element={<CreateNipPage />} />
        <Route path="/edit/:naddr" element={<EditNipPage />} />
        <Route path="/my-nips" element={<MyNipsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/kind/:k" element={<KindPage />} />
        <Route path="/:nip19" element={<Nip19Page />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;