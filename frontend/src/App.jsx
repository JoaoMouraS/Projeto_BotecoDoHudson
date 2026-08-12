import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Galeria from "./pages/Galeria/Galeria";
import Cadastro from "./pages/Cadastro/Cadastro";
import Reservas from "./pages/Reservas/Reservas";
import Login from "./pages/Login/Login";
import Cardapio from "./pages/Cardapio/Cardapio";
import Eventos from "./pages/Eventos/Eventos";
import Dashboard from "./pages/Dashboard/Dashboard";
import "./styles/global.css";

// Conforme novas telas forem criadas (Cardápio, Eventos, Reservas, Login...),
// adicione novas <Route> aqui.

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/fotos" element={<Galeria />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/reservar" element={<Reservas />} />
        <Route path="/cardapio" element={<Cardapio />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}