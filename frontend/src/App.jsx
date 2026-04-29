import { useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import './styles/app.css';

const AUTH_PAGES = new Set([
  '/login',
  '/cadastro',
  '/esqueci-senha',
  '/redefinir-senha',
]);

function App() {
  const location = useLocation();
  const hideFooter = AUTH_PAGES.has(location.pathname);

  return (
    <AuthProvider>
      <div className="app-shell">
        <Navbar />
        <main className="app-main">
          <AppRoutes />
        </main>
        {!hideFooter && <Footer />}
      </div>
    </AuthProvider>
  );
}

export default App;
