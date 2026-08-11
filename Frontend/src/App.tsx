import { Routes, Route, BrowserRouter, Outlet, Navigate } from "react-router-dom";

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
import Contato from "./pages/Contato/Contato";
import Privacidade from "./pages/Privacidade/Privacidade";

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
              <Route path="/contato" element={<Contato />} />
              <Route path="/privacidade" element={<Privacidade />} />
            </Route>

            {/* Layout with main-content wrapper */}
            <Route element={<MainContentLayout />}>
              <Route path="/blog/*" element={<Blog />} />

              {/* Redirect antigo para a rota atual de cases */}
              <Route path="/casos" element={<Navigate to="/cases" replace />} />

              {/* Not Found */}
              <Route path="*" element={<UnavailablePage title="Não encontramos esta página" notFound />} />
            </Route>

            {/* Admin Dashboard */}
            <Route path="/admin" element={<AdminAccess />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}