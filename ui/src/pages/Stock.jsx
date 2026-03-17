// ui/src/pages/Stock.jsx
import { useState } from 'react';
import { api } from '../services/api';

export default function Stock() {
  const [form, setForm] = useState({
    productId: '',
    locationId: '',
    quantity: 0
  });

  async function inbound() {
    await api.post('/stock/inbound', form);
    alert('Entrada realizada');
  }

  async function outbound() {
    await api.post('/stock/outbound', form);
    alert('Saída realizada');
  }

  async function transfer() {
    await api.post('/stock/transfer', {
      productId: form.productId,
      fromLocation: form.locationId,
      toLocation: form.toLocationId,
      quantity: form.quantity
    });
    alert('Transferência realizada');
  }

  return (
    <div>
      <h2>Movimentar Estoque</h2>

      <input placeholder="Product ID"
        onChange={e => setForm({...form, productId: e.target.value})} />

      <input placeholder="Location ID"
        onChange={e => setForm({...form, locationId: e.target.value})} />

      <input placeholder="To Location ID"
        onChange={e => setForm({...form, toLocationId: e.target.value})} />

      <input type="number" placeholder="Quantidade"
        onChange={e => setForm({...form, quantity: Number(e.target.value)})} />

      <button onClick={inbound}>Entrada</button>
      <button onClick={outbound}>Saída</button>
      <button onClick={transfer}>Transferência</button>
    </div>
  );
}