// src/routes/index.js
import { Router } from 'express';
import * as stockController from '../controllers/stockController.js';
import * as pickingController from '../controllers/pickingController.js';
import Movement from '../models/Movement.js';
import Order from '../models/Order.js';
import Stock from '../models/Stock.js';
import Product from '../models/Product.js';
import Location from '../models/Location.js';
import syncRoutes from './sync.js';

const router = Router();

// Sync routes
router.use('/sync', syncRoutes);

// Endpoints existentes
router.post('/stock/inbound', stockController.inbound);
router.post('/stock/outbound', stockController.outbound);
router.post('/stock/transfer', stockController.transfer);
router.get('/picking/:orderId', pickingController.createPicking);

// Novos endpoints para a UI
router.get('/movements', async (req, res) => {
  try {
    const movements = await Movement.find()
      .populate('product')
      .populate('fromLocation')
      .populate('toLocation')
      .sort({ createdAt: -1 });
    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/movements/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const movements = await Movement.find({ type })
      .populate('product')
      .populate('fromLocation')
      .populate('toLocation')
      .sort({ createdAt: -1 });
    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/orders/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items.product');
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stock', async (req, res) => {
  try {
    const stock = await Stock.find()
      .populate('product')
      .populate('location')
      .sort({ createdAt: -1 });
    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/stock/:productId/location', async (req, res) => {
  try {
    const { locationId } = req.body;
    
    // Encontrar ou criar localização
    let location = await Location.findById(locationId);
    if (!location) {
      location = await Location.create({
        code: locationId,
        description: `Localização ${locationId}`
      });
    }

    // Atualizar estoque
    const stock = await Stock.findOneAndUpdate(
      { product: req.params.productId },
      { location: location._id },
      { new: true, upsert: true }
    ).populate('product').populate('location');

    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/stock/transfer', async (req, res) => {
  try {
    const { productId, fromLocation, toLocation, quantity } = req.body;
    
    // Importar o movementService
    const { transfer } = await import('../services/movementService.js');
    
    const result = await transfer(productId, fromLocation, toLocation, quantity);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/stock/sync-with-omie', async (req, res) => {
  try {
    // Importar o serviço de sincronização
    const { syncAllStockFromOmie } = await import('../services/omieStockService.js');
    
    const result = await syncAllStockFromOmie();
    res.json({
      success: true,
      syncedCount: result.syncedCount,
      errors: result.errors,
      message: `Sincronizados ${result.syncedCount} produtos do Omie`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;