import { useEffect, useState } from 'react';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Reservation from './pages/Reservation';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

const routes = {
  '/': Home,
  '/menu': Menu,
  '/events': Events,
  '/gallery': Gallery,
  '/reservation': Reservation,
  '/login': Login,
  '/register': Register,
  '/profile': Profile,
  '/admin/dashboard': AdminDashboard,
};

function App() {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window === 'undefined') return '/';
    return routes[window.location.pathname] ? window.location.pathname : '/';
  });
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    const savedUser = window.localStorage.getItem('boteco-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const handlePopState = () => {
      const nextPath = routes[window.location.pathname] ? window.location.pathname : '/';
      setCurrentPath(nextPath);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
  };

  const handleLogin = (loggedUser) => {
    setUser(loggedUser);
  };

  const handleLogout = () => {
    window.localStorage.removeItem('boteco-user');
    setUser(null);
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const PageComponent = routes[currentPath] || Home;

  return (
    <PageComponent
      currentPath={currentPath}
      onNavigate={navigate}
      user={user}
      onLogin={handleLogin}
      onLogout={handleLogout}
      onUpdateUser={handleUpdateUser}
    />
  );
}

export default App;