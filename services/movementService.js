// src/services/movementService.js
import Movement from '../models/Movement.js';
import { adjustStock } from './stockService.js';

export async function inbound(productId, locationId, qty) {
  await adjustStock(productId, locationId, qty);

  return Movement.create({
    type: 'IN',
    product: productId,
    toLocation: locationId,
    quantity: qty,
  });
}

export async function outbound(productId, locationId, qty) {
  await adjustStock(productId, locationId, -qty);

  return Movement.create({
    type: 'OUT',
    product: productId,
    fromLocation: locationId,
    quantity: qty,
  });
}

export async function transfer(productId, fromLoc, toLoc, qty) {
  await adjustStock(productId, fromLoc, -qty);
  await adjustStock(productId, toLoc, qty);

  return Movement.create({
    type: 'TRANSFER',
    product: productId,
    fromLocation: fromLoc,
    toLocation: toLoc,
    quantity: qty,
  });
}