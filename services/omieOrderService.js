// src/services/omieOrderService.js
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { callOmie } from './omieClient.js';

export async function syncOrders() {
  const response = await callOmie(
    'produtos/pedido/',
    'ListarPedidos',
    { pagina: 1, registros_por_pagina: 50 }
  );

  const pedidos = response.pedidos || [];

  for (const p of pedidos) {
    const items = [];

    for (const i of p.itens) {
      const product = await Product.findOne({ omieId: i.codigo_produto });
      if (!product) continue;

      items.push({
        product: product._id,
        quantity: i.quantidade,
      });
    }

    await Order.findOneAndUpdate(
      { omieId: p.codigo_pedido },
      {
        omieId: p.codigo_pedido,
        items,
      },
      { upsert: true }
    );
  }

  return pedidos.length;
}