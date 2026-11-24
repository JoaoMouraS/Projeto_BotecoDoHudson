import axios from "axios";

// O front NUNCA fala direto com o banco/Supabase: tudo passa pela API Spring.
// Mesma origem (proxy do Vite em dev): nada de URL nem chave em variável de ambiente.
//
// Segurança da sessão:
//  - o login fica num cookie HttpOnly que o JavaScript não consegue ler (nada em localStorage);
//  - o axios lê o cookie XSRF-TOKEN e manda o header X-XSRF-TOKEN sozinho (proteção CSRF).
const api = axios.create({
  baseURL: "/",
  timeout: 15000,
  withXSRFToken: true,
});

// Sessão expirada/revogada em qualquer chamada → avisa o AuthContext para deslogar
// (exceto no login, onde 401 = senha errada).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    if (error.response?.status === 401 && !url.includes("/api/login")) {
      window.dispatchEvent(new Event("auth:expirada"));
    }
    return Promise.reject(error);
  }
);

/** Extrai uma mensagem amigável de um erro da API, sem expor detalhes internos. */
export function mensagemDeErro(error, padrao = "Erro no servidor. Tente novamente mais tarde.") {
  if (!error.response) return "Não foi possível conectar ao servidor.";
  if (error.response.status === 429) return "Muitas tentativas. Aguarde alguns minutos.";
  const erro = error.response.data?.erro;
  return typeof erro === "string" ? erro : padrao;
}

export default api;
