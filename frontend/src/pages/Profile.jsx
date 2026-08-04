import React, { useEffect, useMemo, useState } from 'react';

const Profile = ({ onNavigate, user, onLogout, onUpdateUser }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    countryCode: '55',
    phoneNumber: '',
    notificationsEnabled: false,
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        countryCode: user.countryCode || '55',
        phoneNumber: user.phoneNumber || '',
        notificationsEnabled: Boolean(user.notificationsEnabled),
      });
    }
  }, [user]);

  const initials = useMemo(() => {
    if (!form.name) return 'U';
    return form.name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('');
  }, [form.name]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!user) return;

    const updatedUser = {
      ...user,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      countryCode: form.countryCode,
      phoneNumber: form.phoneNumber,
      notificationsEnabled: form.notificationsEnabled,
    };

    const storedUsers = JSON.parse(localStorage.getItem('boteco-users') || '[]');
    const nextUsers = storedUsers.map((item) => (item.id === user.id ? updatedUser : item));
    localStorage.setItem('boteco-users', JSON.stringify(nextUsers));
    localStorage.setItem('boteco-user', JSON.stringify(updatedUser));
    onUpdateUser?.(updatedUser);
    setMessage('Informações atualizadas com sucesso.');
  };

  const handleDelete = () => {
    if (!user) return;
    const storedUsers = JSON.parse(localStorage.getItem('boteco-users') || '[]');
    const nextUsers = storedUsers.filter((item) => item.id !== user.id);
    localStorage.setItem('boteco-users', JSON.stringify(nextUsers));
    localStorage.removeItem('boteco-user');
    onLogout?.();
    onNavigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1A110C] text-white flex items-center justify-center px-6 py-16">
        <div className="max-w-lg w-full rounded-[32px] border border-gray-800 bg-[#221711] p-10 text-center">
          <h1 className="text-3xl font-heading font-bold uppercase mb-4">FAÇA LOGIN</h1>
          <p className="text-gray-400 mb-8">Entre para acessar seu perfil e personalizar suas preferências.</p>
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            className="bg-[#FF6B00] text-[#1A110C] font-bold uppercase tracking-[0.25em] px-6 py-3 rounded"
          >
            Ir para login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A110C] text-white px-6 py-16">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
        <section className="rounded-[32px] border border-gray-800 bg-[#221711] p-8 md:p-10">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 rounded-full bg-[#FF6B00] text-[#1A110C] flex items-center justify-center text-2xl font-black">
              {initials}
            </div>
            <div>
              <p className="text-[#FF6B00] text-xs font-semibold uppercase tracking-[0.25em]">Perfil do usuário</p>
              <h1 className="text-3xl font-heading font-bold uppercase">{user.name}</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm text-gray-300">
              <span className="font-semibold uppercase tracking-[0.2em] text-gray-400">Nome</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="bg-transparent border border-gray-700 px-4 py-3 rounded text-white outline-none focus:border-[#FF6B00]"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-gray-300">
              <span className="font-semibold uppercase tracking-[0.2em] text-gray-400">E-mail</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="bg-transparent border border-gray-700 px-4 py-3 rounded text-white outline-none focus:border-[#FF6B00]"
              />
            </label>

            <div className="grid md:grid-cols-[120px_1fr] gap-4">
              <label className="flex flex-col gap-2 text-sm text-gray-300">
                <span className="font-semibold uppercase tracking-[0.2em] text-gray-400">DDD do país</span>
                <input
                  type="text"
                  name="countryCode"
                  value={form.countryCode}
                  onChange={handleChange}
                  className="bg-transparent border border-gray-700 px-4 py-3 rounded text-white outline-none focus:border-[#FF6B00]"
                  placeholder="55"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-gray-300">
                <span className="font-semibold uppercase tracking-[0.2em] text-gray-400">Número</span>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  className="bg-transparent border border-gray-700 px-4 py-3 rounded text-white outline-none focus:border-[#FF6B00]"
                  placeholder="31 98920-6085"
                />
              </label>
            </div>

            <label className="flex items-center gap-3 border border-gray-800 rounded p-4 text-sm text-gray-300">
              <input
                type="checkbox"
                name="notificationsEnabled"
                checked={form.notificationsEnabled}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-700 bg-transparent accent-[#FF6B00]"
              />
              Quero receber novidades e links de reservas por WhatsApp.
            </label>

            {message ? <p className="text-sm text-green-400">{message}</p> : null}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="bg-[#FF6B00] text-[#1A110C] font-bold uppercase tracking-[0.25em] px-6 py-3 rounded hover:bg-orange-600 transition"
              >
                Salvar alterações
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="border border-gray-700 px-6 py-3 rounded text-white hover:border-[#FF6B00] transition"
              >
                Voltar ao site
              </button>
            </div>
          </form>
        </section>

        <aside className="rounded-[32px] border border-gray-800 bg-[#221711] p-8 md:p-10 flex flex-col justify-between">
          <div>
            <p className="text-[#FF6B00] text-xs font-semibold uppercase tracking-[0.25em]">Conta</p>
            <h2 className="text-2xl font-heading font-bold uppercase mt-3">GERENCIAR SUA CONTA</h2>
            <p className="text-gray-400 mt-4 leading-relaxed">
              Aqui você pode editar seus dados e configurar se quer receber notificações pelo WhatsApp no futuro.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={() => onLogout?.()}
              className="w-full border border-gray-700 px-4 py-3 rounded text-left hover:border-[#FF6B00] transition"
            >
              Sair da conta
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="w-full bg-red-700/80 px-4 py-3 rounded text-left hover:bg-red-600 transition"
            >
              Excluir conta
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Profile;
