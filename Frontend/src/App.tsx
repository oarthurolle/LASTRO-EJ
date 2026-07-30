// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/admin/Toast";

import Cases from "./pages/site/Cases";
import CaseDetalhe from "./pages/site/CaseDetalhe";
import AdminCasesLista from "./pages/admin/AdminCasesLista";
import AdminCasesForm from "./pages/admin/AdminCasesForm";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/cases" element={<Cases />} />
          <Route path="/cases/:id" element={<CaseDetalhe />} />

          <Route path="/admin/cases" element={<AdminCasesLista />} />
          <Route path="/admin/cases/novo" element={<AdminCasesForm />} />
          <Route path="/admin/cases/:id/editar" element={<AdminCasesForm />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}