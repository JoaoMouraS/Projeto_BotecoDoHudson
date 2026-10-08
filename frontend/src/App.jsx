import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RotaAdmin, RotaAutenticada, RotaVisitante } from "./routes/RotasProtegidas";
import Home from "./pages/Home/Home";
import Galeria from "./pages/Galeria/Galeria";
import Cadastro from "./pages/Cadastro/Cadastro";
import Reservas from "./pages/Reservas/Reservas";
import Login from "./pages/Login/Login";
import Eventos from "./pages/Eventos/Eventos";
import Dashboard from "./pages/Dashboard/Dashboard";
import Perfil from "./pages/Perfil/Perfil";
import AdminConteudo from "./pages/AdminConteudo/AdminConteudo";
import "./styles/global.css";

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
          <Route
            path="/reservar"
            element={
              <RotaAutenticada>
                <Reservas />
              </RotaAutenticada>
            }
          />
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
          <Route
            path="/admin/eventos"
            element={
              <RotaAdmin>
                <AdminConteudo tipo="eventos" />
              </RotaAdmin>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}