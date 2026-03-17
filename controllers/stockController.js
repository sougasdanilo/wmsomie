// src/controllers/stockController.js
import * as movementService from '../services/movementService.js';

export async function inbound(req, res) {
  try {
    const { productId, locationId, quantity } = req.body;
    const result = await movementService.inbound(productId, locationId, quantity);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function outbound(req, res) {
  try {
    const { productId, locationId, quantity } = req.body;
    const result = await movementService.outbound(productId, locationId, quantity);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function transfer(req, res) {
  try {
    const { productId, fromLocation, toLocation, quantity } = req.body;
    const result = await movementService.transfer(productId, fromLocation, toLocation, quantity);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}