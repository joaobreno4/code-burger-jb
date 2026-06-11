import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Orders } from './pages/Orders';
import { Login } from './pages/Login';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/orders" element={<Orders />} />
    </Routes>
  );
}

export default App;
