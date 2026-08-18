import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RotaAdmin, RotaVisitante } from "./routes/RotasProtegidas";
import Home from "./pages/Home/Home";
import Galeria from "./pages/Galeria/Galeria";
import Cadastro from "./pages/Cadastro/Cadastro";
import Reservas from "./pages/Reservas/Reservas";
import Login from "./pages/Login/Login";
import Cardapio from "./pages/Cardapio/Cardapio";
import Eventos from "./pages/Eventos/Eventos";
import Dashboard from "./pages/Dashboard/Dashboard";
import Perfil from "./pages/Perfil/Perfil";
import "./styles/global.css";

// Conforme novas telas forem criadas (Cardápio, Eventos, Reservas, Login...),
// adicione novas <Route> aqui.

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/fotos" element={<Galeria />} />
          <Route
            path="/login"
            element={
              <RotaVisitante>
                <Login />
              </RotaVisitante>
            }
          />
          <Route
            path="/cadastro"
            element={
              <RotaVisitante>
                <Cadastro />
              </RotaVisitante>
            }
          />
          <Route path="/reservar" element={<Reservas />} />
          <Route path="/cardapio" element={<Cardapio />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route
            path="/dashboard"
            element={
              <RotaAdmin>
                <Dashboard />
              </RotaAdmin>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}