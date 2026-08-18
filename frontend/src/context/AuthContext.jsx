import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem("role"));
  const [usuario, setUsuario] = useState(null); // { id, nome, email, role } — nunca tem senha
  const [carregando, setCarregando] = useState(true);

  // Busca o perfil do usuário logado no backend (rota /api/usuarios/me).
  // Se o token estiver ausente/expirado/inválido, limpa tudo e desloga.
  const carregarPerfil = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUsuario(null);
      setRole(null);
      setCarregando(false);
      return;
    }

    try {
      const { data } = await api.get("/api/usuarios/me");
      setUsuario(data);
      setRole(data.role);
      localStorage.setItem("role", data.role);
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      setUsuario(null);
      setRole(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarPerfil();
  }, [carregarPerfil]);

  // Chame isso logo depois do POST /api/login der certo
  const login = useCallback(
    async (token, roleRecebida) => {
      localStorage.setItem("token", token);
      localStorage.setItem("role", roleRecebida);
      setRole(roleRecebida);
      await carregarPerfil();
    },
    [carregarPerfil]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUsuario(null);
    setRole(null);
  }, []);

  const value = {
    usuario, // dados públicos do usuário (id, nome, email, role)
    role,
    carregando, // true enquanto ainda não sabemos se há sessão válida
    isAutenticado: !!usuario,
    isAdmin: role === "ADMIN",
    login,
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