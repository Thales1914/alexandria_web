import { Route, Routes } from 'react-router-dom';
import Biblioteca from '../pages/Biblioteca';
import Cadastro from '../pages/Cadastro';
import Comunidade from '../pages/Comunidade';
import EditarPerfil from '../pages/EditarPerfil';
import EsqueciSenha from '../pages/EsqueciSenha';
import Explorar from '../pages/Explorar';
import Home from '../pages/Home';
import LivroDetalhe from '../pages/LivroDetalhe';
import Login from '../pages/Login';
import NaoEncontrado from '../pages/NaoEncontrado';
import NotFound from '../pages/NotFound';
import Perfil from '../pages/Perfil';
import RedefinirSenha from '../pages/RedefinirSenha';
import ProtectedRoute from './ProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/esqueci-senha" element={<EsqueciSenha />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      <Route
        path="/explorar"
        element={
          <ProtectedRoute>
            <Explorar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/comunidade"
        element={
          <ProtectedRoute>
            <Comunidade />
          </ProtectedRoute>
        }
      />
      <Route
        path="/biblioteca"
        element={
          <ProtectedRoute>
            <Biblioteca />
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <Perfil />
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil/editar"
        element={
          <ProtectedRoute>
            <EditarPerfil />
          </ProtectedRoute>
        }
      />
      <Route
        path="/livro/:id"
        element={
          <ProtectedRoute>
            <LivroDetalhe />
          </ProtectedRoute>
        }
      />
      <Route path="/nao-encontrado" element={<NaoEncontrado />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
