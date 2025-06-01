import { BrowserRouter, Route, Routes } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Nip19Page from "./pages/Nip19Page";
import NipRedirect from "./pages/NipRedirect";
import CreateNipPage from "./pages/CreateNipPage";
import EditNipPage from "./pages/EditNipPage";
import MyNipsPage from "./pages/MyNipsPage";
import { ScrollToTop } from "./components/ScrollToTop";

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
        <Route path="/:nip19" element={<Nip19Page />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;