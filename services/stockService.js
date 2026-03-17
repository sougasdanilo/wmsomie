// src/services/stockService.js
import Stock from '../models/Stock.js';

export async function adjustStock(productId, locationId, qtyChange) {
  let stock = await Stock.findOne({ product: productId, location: locationId });

  if (!stock) {
    if (qtyChange < 0) throw new Error('Stock not found');
    stock = new Stock({ product: productId, location: locationId, quantity: 0 });
  }

  if (stock.quantity + qtyChange < 0) {
    throw new Error('Insufficient stock');
  }

  stock.quantity += qtyChange;
  await stock.save();

  return stock;
}