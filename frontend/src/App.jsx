import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Galeria from "./pages/Galeria/Galeria";
import "./styles/global.css";

// Conforme novas telas forem criadas (Cardápio, Eventos, Reservas, Login...),
// adicione novas <Route> aqui.

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/fotos" element={<Galeria />} />
      </Routes>
    </BrowserRouter>
  );
}