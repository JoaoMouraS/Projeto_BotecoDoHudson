import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Só deixa passar se o usuário estiver logado E for ADMIN.
 * Usada na rota /dashboard.
 */
export function RotaAdmin({ children }) {
  const { isAutenticado, isAdmin, carregando } = useAuth();

  if (carregando) return null; // evita "flash" de redirecionamento enquanto valida o token

  if (!isAutenticado) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}

/**
 * Só deixa passar se o usuário NÃO estiver logado.
 * Usada nas rotas /login e /cadastro — quem já está logado é mandado embora
 * pra não ficar "preso" na tela de login/cadastro.
 */
export function RotaVisitante({ children }) {
  const { isAutenticado, carregando } = useAuth();

  if (carregando) return null;

  if (isAutenticado) return <Navigate to="/" replace />;

  return children;
}