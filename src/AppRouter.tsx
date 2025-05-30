import { BrowserRouter, Route, Routes } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import NipPage from "./pages/NipPage";
import CreateNipPage from "./pages/CreateNipPage";
import EditNipPage from "./pages/EditNipPage";
import MyNipsPage from "./pages/MyNipsPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/nip/:id" element={<NipPage />} />
        <Route path="/create" element={<CreateNipPage />} />
        <Route path="/edit/:naddr" element={<EditNipPage />} />
        <Route path="/my-nips" element={<MyNipsPage />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;