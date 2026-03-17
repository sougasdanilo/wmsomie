// ui/src/pages/Picking.jsx
import { useState } from 'react';
import { api } from '../services/api';

export default function Picking() {
  const [orderId, setOrderId] = useState('');
  const [picking, setPicking] = useState(null);

  async function generate() {
    const { data } = await api.get(`/picking/${orderId}`);
    setPicking(data);
  }

  return (
    <div>
      <h2>Picking</h2>

      <input placeholder="Order ID"
        onChange={e => setOrderId(e.target.value)} />

      <button onClick={generate}>Gerar Picking</button>

      {picking && (
        <ul>
          {picking.items.map((i, idx) => (
            <li key={idx}>
              Produto: {i.product} | Local: {i.location} | Qtd: {i.quantity}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}