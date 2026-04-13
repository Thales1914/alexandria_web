import { useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import './styles/app.css';

function App() {
  const location = useLocation();
  const hideFooter = location.pathname === '/login' || 
                      location.pathname === '/cadastro' || 
                      location.pathname === '/perfil';

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
