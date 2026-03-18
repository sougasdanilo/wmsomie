// src/services/movementService.js
import Movement from '../models/Movement.js';
import { adjustStock } from './stockService.js';
import { sendMovementToOmie } from './omieMovementService.js';

export async function inbound(productId, locationId, qty, description = null) {
  await adjustStock(productId, locationId, qty);

  const movement = await Movement.create({
    type: 'IN',
    product: productId,
    toLocation: locationId,
    quantity: qty,
    description: description || 'Entrada de estoque'
  });

  // Try to sync to Omie (don't fail if it doesn't work)
  try {
    await sendMovementToOmie(movement);
  } catch (error) {
    console.warn('Failed to sync movement to Omie:', error.message);
  }

  return movement;
}

export async function outbound(productId, locationId, qty, description = null) {
  await adjustStock(productId, locationId, -qty);

  const movement = await Movement.create({
    type: 'OUT',
    product: productId,
    fromLocation: locationId,
    quantity: qty,
    description: description || 'Saída de estoque'
  });

  // Try to sync to Omie (don't fail if it doesn't work)
  try {
    await sendMovementToOmie(movement);
  } catch (error) {
    console.warn('Failed to sync movement to Omie:', error.message);
  }

  return movement;
}

export async function transfer(productId, fromLoc, toLoc, qty, description = null) {
  await adjustStock(productId, fromLoc, -qty);
  await adjustStock(productId, toLoc, qty);

  const movement = await Movement.create({
    type: 'TRANSFER',
    product: productId,
    fromLocation: fromLoc,
    toLocation: toLoc,
    quantity: qty,
    description: description || 'Transferência entre localizações'
  });

  // Try to sync to Omie (don't fail if it doesn't work)
  try {
    await sendMovementToOmie(movement);
  } catch (error) {
    console.warn('Failed to sync movement to Omie:', error.message);
  }

  return movement;
}