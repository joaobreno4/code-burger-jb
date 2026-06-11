import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles.css';

const STATUS_FLOW = {
  'Em preparação': 'Pronto',
  'Pronto': 'Entregue',
};

const BASE = import.meta.env.VITE_API_URL ?? '/api';

export function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get(`${BASE}/orders`).then((response) => {
      setOrders(response.data);
    });
  }, []);

  async function changeStatus(id, currentStatus) {
    const nextStatus = STATUS_FLOW[currentStatus];
    if (!nextStatus) return;

    try {
      await axios.put(`${BASE}/orders/${id}`, { status: nextStatus });
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, status: nextStatus } : order
        )
      );
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Não foi possível atualizar o status. Tente novamente.');
    }
  }

  async function deleteOrder(id) {
    try {
      await axios.delete(`${BASE}/orders/${id}`);
      setOrders((prev) => prev.filter((order) => order.id !== id));
    } catch (err) {
      console.error('Erro ao deletar pedido:', err);
      alert('Não foi possível deletar o pedido. Tente novamente.');
    }
  }

  return (
    <div className="orders-container">
      <div className="orders-wrapper">
        <header className="orders-header">
          <div>
            <h1 className="orders-title">Code<span>Burguer</span></h1>
            <p className="orders-subtitle">Acompanhamento de pedidos</p>
          </div>
          <button className="btn-back" onClick={() => navigate('/')}>
            ← Voltar
          </button>
        </header>

        {orders.length === 0 ? (
          <p className="orders-empty">Nenhum pedido encontrado.</p>
        ) : (
          <ul className="orders-list">
            {orders.map((item) => (
              <li key={item.id} className="order-card">
                <div className="order-info">
                  <span className="order-client">{item.clientName}</span>
                  <span className="order-description">{item.order}</span>
                </div>

                <div className="order-actions">
                  <span className={`order-status order-status--${item.status === 'Pronto' ? 'ready' : item.status === 'Entregue' ? 'delivered' : 'preparing'}`}>
                    {item.status}
                  </span>

                  {STATUS_FLOW[item.status] && (
                    <button
                      className="btn-action btn-advance"
                      title={`Avançar para "${STATUS_FLOW[item.status]}"`}
                      onClick={() => changeStatus(item.id, item.status)}
                    >
                      ✓
                    </button>
                  )}

                  <button
                    className="btn-action btn-delete"
                    title="Deletar pedido"
                    onClick={() => deleteOrder(item.id)}
                  >
                    🗑
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
