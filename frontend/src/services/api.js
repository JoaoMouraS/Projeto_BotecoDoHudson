import axios from "axios";

// Instância central do axios. Use ela (em vez de axios direto) em qualquer
// chamada que precise ir autenticada — ela já injeta o Bearer token.
const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;