import type { ReactNode } from "react";
import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./auth/AuthContext";
import { ToastProvider } from "./components/admin/Toast";
import Footer from "./components/common/Footer/Footer";
import { Navbar } from "./components/common/NavBar/Navbar";

import About from "./pages/About/About";
import AdminAccess from "./pages/Auth/AdminAccess";
import Blog from "./pages/Blog/Blog";
import Home from "./pages/Home/Home";
import Services from "./pages/Services/Services";
import UnavailablePage from "./pages/Unavailable/UnavailablePage";

import AdminCasesForm from "./pages/Admin/AdminCasesForm";
import AdminCasesLista from "./pages/Admin/AdminCasesLista";
import CaseDetalhe from "./pages/site/CaseDetalhe";
import Cases from "./pages/site/Cases";

function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app">
      <Navbar />

      <main className="main-content">
        {children}
      </main>

      <Footer />
    </div>
  );
}

function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
      />

      <Route
        path="/sobre-nos"
        element={
          <PublicLayout>
            <About />
          </PublicLayout>
        }
      />

      <Route
        path="/sobre"
        element={<Navigate to="/sobre-nos" replace />}
      />

      <Route
        path="/servicos"
        element={
          <PublicLayout>
            <Services />
          </PublicLayout>
        }
      />

      <Route
        path="/blog/*"
        element={
          <PublicLayout>
            <Blog />
          </PublicLayout>
        }
      />

      <Route
        path="/cases"
        element={<Cases />}
      />

      <Route
        path="/cases/:id"
        element={<CaseDetalhe />}
      />

      <Route
        path="/contato"
        element={
          <PublicLayout>
            <UnavailablePage title="Contato" />
          </PublicLayout>
        }
      />

      <Route
        path="/privacidade"
        element={
          <PublicLayout>
            <UnavailablePage title="Política de Privacidade" />
          </PublicLayout>
        }
      />

      <Route
        path="/admin/cases"
        element={
          <AdminLayout>
            <AdminCasesLista />
          </AdminLayout>
        }
      />

      <Route
        path="/admin/cases/novo"
        element={
          <AdminLayout>
            <AdminCasesForm />
          </AdminLayout>
        }
      />

      <Route
        path="/admin/cases/:id/editar"
        element={
          <AdminLayout>
            <AdminCasesForm />
          </AdminLayout>
        }
      />

      <Route
        path="/admin/*"
        element={
          <AdminLayout>
            <AdminAccess />
          </AdminLayout>
        }
      />

      <Route
        path="*"
        element={
          <PublicLayout>
            <UnavailablePage
              title="Não encontramos esta página"
              notFound
            />
          </PublicLayout>
        }
      />
    </Routes>
  );
}