/** @type {import('tailwindcss').Config} */
export default {
  // Ajuste os caminhos abaixo se a estrutura do seu projeto for diferente.
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta oficial do Boteco do Hudson
        bg: {
          DEFAULT: '#1A110C', // fundo principal (quase preto, tom de madeira queimada)
          surface: '#221711', // fundo de cards / painéis (um tom acima do fundo principal)
        },
        brand: {
          DEFAULT: '#FF6B00', // laranja de destaque (CTAs, títulos, ícones ativos)
          hover: '#E65F00',   // hover levemente mais escuro que o padrão (usar junto de orange-600 já usado no código)
        },
      },
      fontFamily: {
        // Permite usar font-heading / font-sans como utilities do Tailwind,
        // além da regra manual já definida em index.css
        heading: ['Oswald', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.25em',
      },
    },
  },
  plugins: [],
};