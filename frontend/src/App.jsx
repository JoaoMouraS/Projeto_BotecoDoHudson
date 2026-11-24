import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RotaAdmin, RotaLogado, RotaVisitante } from "./routes/RotasProtegidas";
import Home from "./pages/Home/Home";
import Galeria from "./pages/Galeria/Galeria";
import Cadastro from "./pages/Cadastro/Cadastro";
import Reservas from "./pages/Reservas/Reservas";
import Login from "./pages/Login/Login";
import Eventos from "./pages/Eventos/Eventos";
import Dashboard from "./pages/Dashboard/Dashboard";
import Perfil from "./pages/Perfil/Perfil";
import Convite from "./pages/Convite/Convite";
import Ingresso from "./pages/Ingresso/Ingresso";
import VerificarEmail from "./pages/Conta/VerificarEmail";
import EsqueciSenha from "./pages/Conta/EsqueciSenha";
import RedefinirSenha from "./pages/Conta/RedefinirSenha";
import ConfirmarConvite from "./pages/Conta/ConfirmarConvite";
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
          {/* Link público que o anfitrião manda para os amigos */}
          <Route path="/convite/:codigo" element={<Convite />} />
          <Route path="/ingresso/:codigo" element={<Ingresso />} />
          {/* Destinos dos links enviados por e-mail */}
          <Route path="/verificar-email" element={<VerificarEmail />} />
          <Route path="/confirmar-convite" element={<ConfirmarConvite />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          <Route
            path="/esqueci-senha"
            element={
              <RotaVisitante>
                <EsqueciSenha />
              </RotaVisitante>
            }
          />
          <Route path="/eventos" element={<Eventos />} />
          <Route
            path="/perfil"
            element={
              <RotaLogado>
                <Perfil />
              </RotaLogado>
            }
          />
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