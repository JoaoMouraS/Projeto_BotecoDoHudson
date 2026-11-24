import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Aceita acesso pela rede local (ex.: testar no celular pelo IP do computador).
    host: true,
    // Em desenvolvimento, o Vite repassa /api para o Spring Boot. Assim front e API
    // ficam no MESMO endereço: o cookie de sessão (HttpOnly, SameSite=Strict) funciona
    // e não é preciso liberar CORS. Em produção, faça o mesmo no proxy/hospedagem.
    proxy: {
      '/api': 'http://localhost:8080',
      // Link curto do convite com prévia (foto/título) para WhatsApp.
      '/c/': 'http://localhost:8080',
    },
  },
})
