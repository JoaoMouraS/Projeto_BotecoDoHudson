import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";

const NAV_LINKS = [
  { label: "Início", href: "/" },
  { label: "Cardápio", href: "/cardapio" },
  { label: "Eventos", href: "/eventos" },
  { label: "Fotos", href: "/fotos" },
  { label: "Reservar Mesa", href: "/reservar" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Toda a lógica de "quem está logado / é admin" vem do contexto único.
  // Assim o Header nunca fica dessincronizado do resto do app (Login, Perfil,
  // rotas protegidas etc. todos leem do mesmo lugar).
  const { isAutenticado, isAdmin, usuario, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  // Link/rota do avatar: admin vai pro painel, usuário comum vai pro próprio perfil.
  const avatarDestino = isAdmin ? "/dashboard" : "/perfil";
  const avatarTitulo = isAdmin ? "Acessar Dashboard" : "Meu perfil";
  const inicialAvatar = usuario?.nome ? usuario.nome.charAt(0).toUpperCase() : "?";

  return (
    <header className="header">
      <div className="header__inner container">
        <Link to="/" className="header__brand">
          <span className="header__brand-icon" aria-hidden="true">
            🍺
          </span>
          <span className="header__brand-text">
            Boteco
            <span className="header__brand-text--accent">do Hudson</span>
          </span>
        </Link>

        <nav
          className={`header__nav ${menuOpen ? "header__nav--open" : ""}`}
          aria-label="Navegação principal"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={
                link.label === "Reservar Mesa"
                  ? "header__link header__link--highlight"
                  : "header__link"
              }
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* Link extra de navegação, visível só para ADMIN */}
          {isAdmin && (
            <Link
              to="/dashboard"
              className="header__link"
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>
          )}

          <div className="header__auth-links">
            {isAutenticado ? (
              // Logado (USER ou ADMIN): mostra avatar + sair.
              // O destino do avatar muda de acordo com a role.
              <div className="header__user-profile">
                <Link
                  to={avatarDestino}
                  className="header__avatar"
                  title={avatarTitulo}
                  onClick={() => setMenuOpen(false)}
                >
                  {inicialAvatar}
                </Link>
                <button onClick={handleLogout} className="header__logout">
                  SAIR
                </button>
              </div>
            ) : (
              // Visitante: mostra o CTA de login padrão
              <Link
                to="/login"
                className="header__cta"
                onClick={() => setMenuOpen(false)}
              >
                Vem pro Samba
              </Link>
            )}
          </div>
        </nav>

        <button
          className="header__toggle"
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}