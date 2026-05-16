import { useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import XPToast from './components/XPToast';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { GamificacaoProvider } from './context/GamificacaoContext';
import './styles/app.css';

const HIDE_FOOTER_ROUTES = new Set(['/login', '/cadastro', '/perfil']);

function App() {
  const location = useLocation();
  const hideFooter = HIDE_FOOTER_ROUTES.has(location.pathname);

  return (
    <AuthProvider>
      <GamificacaoProvider>
        <div className="app-shell">
          <Navbar />
          <main className="app-main">
            <div key={location.key} className="page-transition">
              <AppRoutes />
            </div>
          </main>
          {!hideFooter && <Footer />}
        </div>
        <XPToast />
      </GamificacaoProvider>
    </AuthProvider>
  );
}

export default App;
