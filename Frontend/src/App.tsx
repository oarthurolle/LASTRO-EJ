import { Routes, Route } from "react-router-dom";

import { Navbar } from "./components/common/NavBar/Navbar";
import Footer from "./components/common/Footer/Footer";

import Home from "./pages/Home/Home";
import About from "./pages/About/About";

function App() {
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

        </Routes>

      </main>

      <Footer />

    </div>
  );
}

export default App;