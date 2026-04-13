import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";
import Cadastro from "../pages/Cadastro";
import Explorar from "../pages/Explorar";
import Comunidade from "../pages/Comunidade";
import Perfil from "../pages/Perfil";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />}>/</Route>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/explorar" element={<Explorar />} />
      <Route path="/comunidade" element={<Comunidade />} />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
