import { useEffect, useState } from 'react';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Reservation from './pages/Reservation';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const routes = {
  '/': Home,
  '/menu': Menu,
  '/events': Events,
  '/gallery': Gallery,
  '/reservation': Reservation,
  '/admin': AdminLogin,
  '/admin/dashboard': AdminDashboard,
};

function App() {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window === 'undefined') return '/';
    return routes[window.location.pathname] ? window.location.pathname : '/';
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

  const PageComponent = routes[currentPath] || Home;

  return <PageComponent currentPath={currentPath} onNavigate={navigate} />;
}

export default App;