import { Routes, Route, BrowserRouter, Outlet } from "react-router-dom";

import { Navbar } from "./components/common/NavBar/Navbar";
import Footer from "./components/common/Footer/Footer";

import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Services from "./pages/Services/Services";
import { AuthProvider } from "./auth/AuthContext";
import AdminAccess from "./pages/Auth/AdminAccess";
import Blog from "./pages/Blog/Blog";
import UnavailablePage from "./pages/Unavailable/UnavailablePage";
import { ToastProvider } from "./components/admin/Toast.tsx";
import Cases from "./pages/site/Cases.tsx";
import CaseDetalhe from "./pages/site/CaseDetalhe.tsx";
import AdminCasesLista from "./pages/admin/AdminCasesLista.tsx";
import AdminCasesForm from "./pages/admin/AdminCasesForm.tsx";

const AppLayout = () => {
  return (
    <div className="app">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

const MainContentLayout = () => {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Base App Layout (No main-co.ntent wrapper) */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/servicos" element={<Services />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/cases/:id" element={<CaseDetalhe />} />
            </Route>

            {/* Layout with main-content wrapper */}
            <Route element={<MainContentLayout />}>
              <Route path="/blog/*" element={<Blog />} />
              
              {/* Unavailable Pages */}
              <Route path="/casos" element={<UnavailablePage title="Cases de sucesso" />} />
              <Route path="/contato" element={<UnavailablePage title="Contato" />} />
              <Route path="/privacidade" element={<UnavailablePage title="Política de Privacidade" />} />
              
              {/* Not Found */}
              <Route path="*" element={<UnavailablePage title="Não encontramos esta página" notFound />} />
            </Route>

            {/* Standalone Routes (Pages handle their own Header/Footer) */}
            {/* removed /cases and /cases/:id from here */}

            {/* Admin Dashboard */}
            <Route path="/admin" element={<AdminAccess />} />

            {/* Admin Nested Routes (Protected) */}
            <Route 
              path="/admin/cases" 
              element={
                <AdminAccess>
                  <AdminCasesLista />
                </AdminAccess>
              } 
            />
            <Route 
              path="/admin/cases/novo" 
              element={
                <AdminAccess>
                  <AdminCasesForm />
                </AdminAccess>
              } 
            />
            <Route 
              path="/admin/cases/:id/editar" 
              element={
                <AdminAccess>
                  <AdminCasesForm />
                </AdminAccess>
              } 
            />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
