import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import devclubLogo from '../../assets/channels4_profile.png';
import './styles.css';

export function Home() {
  const navigate = useNavigate();
  const [clientName, setClientName] = useState('');
  const [order, setOrder] = useState('');

  async function handleNewOrder(event) {
    event.preventDefault();

    await axios.post('http://localhost:3001/orders', { clientName, order });

    alert(`Pedido de ${clientName} realizado com sucesso!`);
    setClientName('');
    setOrder('');
    navigate('/orders');
  }

  return (
    <div className="container">
      <div className="card">
        <img
          src={devclubLogo}
          alt="DevClub"
          className="logo"
        />
        <h1 className="title">Code<span>Burguer</span></h1>
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
            <label htmlFor="order">Descrição do lanche</label>
            <input
              id="order"
              type="text"
              placeholder="Ex: X-Burguer + Fritas + Refrigerante"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              required
            />
          </div>

          <button type="submit">Realizar pedido</button>
        </form>
      </div>
    </div>
  );
}
