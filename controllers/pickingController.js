// src/controllers/pickingController.js
import { generatePicking } from '../services/pickingService.js';

export async function createPicking(req, res) {
  try {
    const { orderId } = req.params;
    const picking = await generatePicking(orderId);
    res.json(picking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}