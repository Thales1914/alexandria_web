import { Route, Routes } from 'react-router-dom';
import Comunidade from '../pages/Comunidade';
import Explorar from '../pages/Explorar';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/explorar" element={<Explorar />} />
      <Route path="/comunidade" element={<Comunidade />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
