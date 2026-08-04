import React, { useState } from 'react';

const Register = ({ onNavigate, onLogin }) => {
  const [form, setForm] = useState({
    name: '',
    birthDate: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim() || !form.birthDate || !form.email.trim() || !form.password || !form.confirmPassword) {
      setError('Preencha todos os campos para concluir o cadastro.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('As senhas precisam ser iguais.');
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('boteco-users') || '[]');
    const alreadyExists = storedUsers.some((user) => user.email.toLowerCase() === form.email.trim().toLowerCase());

    if (alreadyExists) {
      setError('Este e-mail já está cadastrado.');
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      name: form.name.trim(),
      birthDate: form.birthDate,
      email: form.email.trim().toLowerCase(),
      password: form.password,
      provider: 'site',
      countryCode: '55',
      phoneNumber: '',
      notificationsEnabled: false,
      createdAt: new Date().toISOString(),
    };

    const nextUsers = [...storedUsers, newUser];
    localStorage.setItem('boteco-users', JSON.stringify(nextUsers));
    localStorage.setItem('boteco-user', JSON.stringify(newUser));
    onLogin?.(newUser);
    onNavigate('/profile');
  };

  return (
    <div className="min-h-screen bg-[#1A110C] text-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-5xl rounded-[32px] border border-gray-800 bg-[#221711] shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-between bg-gradient-to-br from-[#2b180f] to-[#1A110C]">
          <div>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="flex items-center gap-3 mb-8 transition hover:opacity-90"
            >
              <div className="bg-[#FF6B00] p-2 rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-[#1A110C]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"></path></svg>
              </div>
              <span className="font-heading font-bold text-xl leading-none text-[#FF6B00]">BOTECO<br/><span className="text-white">DO HUDSON</span></span>
            </button>
            <p className="text-[#FF6B00] tracking-[0.3em] text-xs font-semibold uppercase mb-4">Seu acesso à casa</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold uppercase leading-tight">
              CRIE SUA<br />
              <span className="text-[#FF6B00]">CONTA.</span>
            </h1>
            <p className="mt-5 text-gray-300 leading-relaxed">
              Cadastre-se para reservar mesas, acompanhar eventos e receber novidades do Boteco do Hudson.
            </p>
          </div>

          <div className="mt-10 border-t border-gray-800 pt-6 text-sm text-gray-400">
            <p className="font-semibold uppercase tracking-[0.25em] text-gray-500 mb-2">Já tem conta?</p>
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="text-[#FF6B00] hover:text-orange-400 font-semibold"
            >
              Entrar agora
            </button>
          </div>
        </div>

        <div className="lg:w-1/2 p-8 md:p-12">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm text-gray-300">
                <span className="font-semibold uppercase tracking-[0.2em] text-gray-400">Nome</span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-gray-700 px-4 py-3 rounded text-white outline-none focus:border-[#FF6B00]"
                  placeholder="Seu nome"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-gray-300">
                <span className="font-semibold uppercase tracking-[0.2em] text-gray-400">Data de nascimento</span>
                <input
                  type="date"
                  name="birthDate"
                  value={form.birthDate}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-gray-700 px-4 py-3 rounded text-white outline-none focus:border-[#FF6B00]"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm text-gray-300">
              <span className="font-semibold uppercase tracking-[0.2em] text-gray-400">E-mail</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-transparent border border-gray-700 px-4 py-3 rounded text-white outline-none focus:border-[#FF6B00]"
                placeholder="seu@email.com"
              />
            </label>

            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm text-gray-300">
                <span className="font-semibold uppercase tracking-[0.2em] text-gray-400">Senha</span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-gray-700 px-4 py-3 rounded text-white outline-none focus:border-[#FF6B00]"
                  placeholder="********"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-gray-300">
                <span className="font-semibold uppercase tracking-[0.2em] text-gray-400">Confirmar senha</span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-gray-700 px-4 py-3 rounded text-white outline-none focus:border-[#FF6B00]"
                  placeholder="********"
                />
              </label>
            </div>

            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <button
              type="submit"
              className="w-full bg-[#FF6B00] text-[#1A110C] font-bold uppercase tracking-[0.25em] px-6 py-3 rounded hover:bg-orange-600 transition"
            >
              Cadastrar conta
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
