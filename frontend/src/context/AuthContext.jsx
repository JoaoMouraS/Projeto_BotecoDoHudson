import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

/**
 * Estado de login do app. O token NÃO fica no navegador ao alcance do JS:
 * ele mora num cookie HttpOnly. Aqui guardamos só os dados públicos do perfil.
 */
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null); // { id, nome, email, telefone, dataNascimento, role }
  const [carregando, setCarregando] = useState(true);

  // Pergunta à API quem está logado (204 = ninguém). Também recebe o cookie CSRF.
  const carregarPerfil = useCallback(async () => {
    try {
      const { data, status } = await api.get("/api/usuarios/me");
      setUsuario(status === 200 ? data : null);
    } catch {
      setUsuario(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarPerfil();
  }, [carregarPerfil]);

  // Login/cadastro já devolvem o perfil: só guardamos no estado.
  const entrar = useCallback((perfil) => setUsuario(perfil), []);

  const logout = useCallback(async () => {
    try {
      await api.post("/api/logout");
    } catch {
      // mesmo se falhar, limpa o estado local
    }
    setUsuario(null);
  }, []);

  // Disparado pelo services/api.js quando a API responde 401 (sessão expirada).
  useEffect(() => {
    const limpar = () => setUsuario(null);
    window.addEventListener("auth:expirada", limpar);
    return () => window.removeEventListener("auth:expirada", limpar);
  }, []);

  const value = {
    usuario,
    carregando, // true enquanto ainda não sabemos se há sessão válida
    isAutenticado: !!usuario,
    isAdmin: usuario?.role === "ADMIN",
    entrar,
    atualizarUsuario: setUsuario,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth precisa ser usado dentro de um <AuthProvider>");
  }
  return ctx;
}
