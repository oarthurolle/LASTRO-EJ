import { Routes, Route } from "react-router-dom";

import { Navbar } from "./components/common/NavBar/Navbar";
import Footer from "./components/common/Footer/Footer";

import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Services from "./pages/Services/Services";
import { AuthProvider } from "./auth/AuthContext";
import AdminAccess from "./pages/Auth/AdminAccess";
import Blog from "./pages/Blog/Blog";
import UnavailablePage from "./pages/Unavailable/UnavailablePage";

const UNAVAILABLE_ROUTES: Record<string, string> = {
  "/sobre": "Sobre nós",
  "/servicos": "Serviços",
  "/casos": "Cases de sucesso",
  "/cases": "Cases de sucesso",
  "/contato": "Contato",
  "/privacidade": "Política de Privacidade",
};

function App() {
  const pathname =
    window.location.pathname.replace(/\/+$/, "").toLocaleLowerCase("pt-BR") ||
    "/";

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return (
      <AuthProvider>
        <AdminAccess />
      </AuthProvider>
    );
  }

  if (pathname === "/blog" || pathname.startsWith("/blog/")) {
    return (
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Blog />
        </main>
        <Footer />
      </div>
    );
  }

  const unavailableTitle = UNAVAILABLE_ROUTES[pathname];
  if (unavailableTitle) {
    return (
      <div className="app">
        <Navbar />
        <main className="main-content">
          <UnavailablePage title={unavailableTitle} />
        </main>
        <Footer />
      </div>
    );
  }

  if (pathname !== "/") {
    return (
      <div className="app">
        <Navbar />
        <main className="main-content">
          <UnavailablePage title="Não encontramos esta página" notFound />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app">

      <Navbar />

      <main className="main-content">

        <Routes>

          <Route path="/" element={<Home />} />

          <Route
            path="/sobre-nos"
            element={<About />}
          />
          <Route path="/servicos" element={<Services />} />

        </Routes>

      </main>

      <Footer />

    </div>
  );
}

export default App;