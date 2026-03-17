// src/services/omieStockService.js
import Stock from '../models/Stock.js';
import { callOmie } from './omieClient.js';

export async function sendStockToOmie() {
  const stocks = await Stock.find().populate('product');

  for (const s of stocks) {
    if (!s.product.omieId) continue;

    await callOmie(
      'estoque/ajuste/',
      'AjustarEstoque',
      {
        codigo_produto: s.product.omieId,
        quantidade: s.quantity,
      }
    );
  }

  return stocks.length;
}