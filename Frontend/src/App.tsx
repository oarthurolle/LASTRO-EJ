import { Navbar } from "./components/common/NavBar/Navbar";
import Footer from "./components/common/Footer/Footer";
import Home from "./pages/Home/Home";
function App() {
  return (
    <div className="app">
      <Navbar />

      <main className="main-content">
        <Home />
      </main>

      <Footer />
    </div>
  );
}

export default App;
