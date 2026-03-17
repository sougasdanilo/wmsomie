// src/services/orderService.js (FIX)
import Stock from '../models/Stock.js';
import Movement from '../models/Movement.js';

export async function reserveStock(orderId) {
  const order = await Order.findById(orderId).populate('items.product');

  if (!order) throw new Error('Order not found');

  for (const item of order.items) {
    let remaining = item.quantity;

    const stocks = await Stock.find({
      product: item.product._id,
      quantity: { $gt: 0 },
    }).sort({ createdAt: 1 }); // FIFO

    for (const s of stocks) {
      if (remaining <= 0) break;

      const take = Math.min(s.quantity, remaining);

      s.quantity -= take;
      await s.save();

      await Movement.create({
        type: 'OUT',
        product: item.product._id,
        fromLocation: s.location,
        quantity: take,
      });

      remaining -= take;
    }

    if (remaining > 0) {
      throw new Error(`Insufficient stock for product ${item.product.name}`);
    }
  }

  order.status = 'PICKING';
  await order.save();

  return order;
}