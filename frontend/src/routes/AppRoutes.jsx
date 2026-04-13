import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";
import Cadastro from "../pages/Cadastro";
import Explorar from "../pages/Explorar";
import Comunidade from "../pages/Comunidade";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  // REMOVEMOS a constante daqui de cima para evitar o erro de "estado parado"
  
  return (
    <Routes>
      {/* Agora a Home usa o segurança, que lê o token NO MOMENTO do clique */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } 
      />
      
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      
      <Route path="/explorar" element={<ProtectedRoute><Explorar /></ProtectedRoute>} />
      <Route path="/comunidade" element={<ProtectedRoute><Comunidade /></ProtectedRoute>} />

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;