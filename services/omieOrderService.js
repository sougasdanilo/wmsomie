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

  const pedidos = response.pedido_venda_produto || [];
  let syncedCount = 0;

  for (const p of pedidos) {
    const items = [];

    // Verificar se o pedido tem itens
    if (!p.det || p.det.length === 0) {
      console.log(`Pedido ${p.cabecalho?.codigo_pedido} não tem itens, ignorando...`);
      continue;
    }

    for (const i of p.det || []) {
      const product = await Product.findOne({ omieId: i.produto.codigo_produto });
      if (!product) {
        console.log(`Produto ${i.produto.codigo_produto} não encontrado no banco, ignorando item...`);
        continue;
      }

      items.push({
        product: product._id,
        quantity: i.produto.quantidade,
      });
    }

    // Apenas sincronizar se tiver itens válidos
    if (items.length > 0) {
      await Order.findOneAndUpdate(
        { omieId: p.cabecalho.codigo_pedido },
        {
          omieId: p.cabecalho.codigo_pedido,
          items,
        },
        { upsert: true }
      );
      syncedCount++;
      console.log(`Pedido ${p.cabecalho.codigo_pedido} sincronizado com ${items.length} itens`);
    }
  }

  return syncedCount;
}