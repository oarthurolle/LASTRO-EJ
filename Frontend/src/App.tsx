import { Navbar } from "./components/common/Navbar";
import Footer from "./components/common/Footer";

function App() {
  return (
    <div className="app">
      <Navbar />

      <main className="main-content">
        {/* Conteúdo das páginas */}
      </main>

      <Footer />
    </div>
  );
}

export default App;
