import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import devclubLogo from '../../assets/channels4_profile.png';
import './styles.css';

const BASE = import.meta.env.VITE_API_URL ?? '/api';

export function Home() {
  const navigate = useNavigate();
  const [clientName, setClientName] = useState('');
  const [order, setOrder] = useState('');
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    axios.get(`${BASE}/menu`).then((res) => setMenuItems(res.data));
  }, []);

  async function handleNewOrder(event) {
    event.preventDefault();

    try {
      await axios.post(`${BASE}/orders`, { clientName, order });
      alert(`Pedido de ${clientName} realizado com sucesso!`);
      setClientName('');
      setOrder('');
      navigate('/orders');
    } catch (err) {
      console.error('Erro ao realizar pedido:', err);
      alert('Não foi possível realizar o pedido. Tente novamente.');
    }
  }

  return (
    <div className="container">
      <div className="card">
        <img src={devclubLogo} alt="DevClub" className="logo" />
        <h1 className="title">Code<span>Burger</span></h1>
        <p className="subtitle">Monte seu pedido</p>

        <form onSubmit={handleNewOrder}>
          <div className="field">
            <label htmlFor="clientName">Nome do cliente</label>
            <input
              id="clientName"
              type="text"
              placeholder="Digite seu nome"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="order">Escolha o lanche</label>
            <select
              id="order"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              required
            >
              <option value="">Selecione um lanche...</option>
              {menuItems.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name} — {item.description}
                </option>
              ))}
            </select>
          </div>

          <button type="submit">Realizar pedido</button>
        </form>
      </div>
    </div>
  );
}
