import React, { useState } from 'react';

const Login = ({ onNavigate, onLogin }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    const storedUsers = JSON.parse(localStorage.getItem('boteco-users') || '[]');
    const user = storedUsers.find(
      (item) => item.email.toLowerCase() === form.email.trim().toLowerCase() && item.password === form.password
    );

    if (!user) {
      setError('E-mail ou senha inválidos.');
      return;
    }

    localStorage.setItem('boteco-user', JSON.stringify(user));
    onLogin?.(user);
    onNavigate('/profile');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#1A110C] text-white">
      <div className="lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-between">
        <div>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex items-center gap-3 mb-10 transition hover:opacity-90"
          >
            <div className="bg-[#FF6B00] p-2 rounded flex items-center justify-center">
              <svg className="w-5 h-5 text-[#1A110C]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"></path></svg>
            </div>
            <span className="font-heading font-bold text-xl leading-none text-[#FF6B00]">BOTECO<br/><span className="text-white">DO HUDSON</span></span>
          </button>

          <p className="text-[#FF6B00] tracking-[0.3em] text-xs font-semibold uppercase mb-4">Entre para aproveitar a casa</p>
          <h1 className="text-5xl md:text-6xl font-heading font-bold uppercase leading-tight">
            ACESSE<br/><span className="text-[#FF6B00]">SEU ESPAÇO.</span>
          </h1>
          <p className="mt-5 text-gray-400 text-lg max-w-md leading-relaxed">
            Faça login para reservar mesas, salvar seus dados e receber novidades da casa.
          </p>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 text-sm text-gray-400">
          <p className="font-semibold uppercase tracking-[0.25em] text-gray-500 mb-2">Ainda não tem conta?</p>
          <button type="button" onClick={() => onNavigate('/register')} className="text-[#FF6B00] hover:text-orange-400 font-semibold">
            Criar conta agora
          </button>
        </div>
      </div>

      <div className="lg:w-1/2 bg-[#221711] p-8 md:p-12 lg:p-16 flex flex-col justify-center">
        <p className="text-[#FF6B00] tracking-[0.3em] text-xs font-semibold mb-4 uppercase">Login do usuário</p>
        <h2 className="text-4xl font-heading font-bold uppercase mb-3">ENTRAR</h2>
        <p className="text-gray-400 text-sm mb-8">Use seu e-mail e senha cadastrados no site ou entre com Google.</p>

        <button
          type="button"
          onClick={() => onNavigate('/register')}
          className="mb-6 flex items-center justify-center gap-3 border border-gray-700 px-4 py-3 rounded text-white hover:border-[#FF6B00] transition"
        >
          <span className="text-lg">G</span>
          Entrar com Google
        </button>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="flex flex-col gap-2 text-sm text-gray-300">
            <span className="font-semibold uppercase tracking-[0.2em] text-gray-400">E-mail</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="bg-transparent border border-gray-700 px-4 py-3 rounded text-white outline-none focus:border-[#FF6B00]"
              placeholder="seu@email.com"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-gray-300">
            <span className="font-semibold uppercase tracking-[0.2em] text-gray-400">Senha</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="bg-transparent border border-gray-700 px-4 py-3 rounded text-white outline-none focus:border-[#FF6B00]"
              placeholder="********"
            />
          </label>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            className="bg-[#FF6B00] text-[#1A110C] font-bold uppercase tracking-[0.25em] px-6 py-3 rounded hover:bg-orange-600 transition"
          >
            Entrar
          </button>

          <div className="flex justify-between items-center pt-2">
            <button type="button" onClick={() => onNavigate('/')} className="text-xs text-gray-500 hover:text-white underline">Voltar ao site</button>
            <span className="text-xs text-gray-500">🛡 Acesso seguro</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
