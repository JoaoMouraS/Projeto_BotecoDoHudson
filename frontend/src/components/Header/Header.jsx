import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const [isLogado, setIsLogado] = useState(false);
  const navigate = useNavigate();

  // Verifica se o usuário tem um token salvo ao carregar o Header
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLogado(true);
    }
  }, []);

  // Função para fazer logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLogado(false);
    navigate('/');
  };

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
            >
              {link.label}
            </Link>
          ))}
          
          <div className="header__auth-links">
            {isLogado ? (
              // Mostra o avatar e botão de sair se estiver logado
              <div className="header__user-profile">
                <Link to="/dashboard" className="header__avatar" title="Acessar Dashboard">
                  H
                </Link>
                <button onClick={handleLogout} className="header__logout">
                  SAIR
                </button>
              </div>
            ) : (
              // Mostra o botão de login padrão se não estiver logado
              <Link to="/login" className="header__cta">
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