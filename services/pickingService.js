// src/services/pickingService.js
import Picking from '../models/Picking.js';
import Order from '../models/Order.js';
import Stock from '../models/Stock.js';
import { sortLocations } from '../utils/locationSorter.js';

export async function generatePicking(orderId) {
  const order = await Order.findById(orderId).populate('items.product');
  if (!order) throw new Error('Order not found');

  const pickingItems = [];

  for (const item of order.items) {
    let remaining = item.quantity;

    const stocks = await Stock.find({
      product: item.product._id,
      quantity: { $gt: 0 },
    }).populate('location');

    const sortedStocks = sortLocations(stocks.map(s => ({
      ...s.toObject(),
      location: s.location
    })));

    for (const s of sortedStocks) {
      if (remaining <= 0) break;

      const take = Math.min(s.quantity, remaining);

      pickingItems.push({
        product: item.product._id,
        location: s.location._id,
        quantity: take,
      });

      remaining -= take;
    }

    if (remaining > 0) {
      throw new Error(`Insufficient stock for ${item.product.name}`);
    }
  }

  const picking = await Picking.create({
    order: order._id,
    items: pickingItems,
  });

  return picking.populate('items.product items.location');
}