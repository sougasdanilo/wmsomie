// src/routes/sync.js
import express from 'express';
import { 
  syncAllStockFromOmie, 
  sendStockToOmie, 
  getStockFromOmie,
  adjustStockInOmie 
} from '../services/omieStockService.js';
import { 
  syncMovementsFromOmie, 
  sendMovementToOmie,
  syncLocationsFromOmie 
} from '../services/omieMovementService.js';
import { syncProducts } from '../services/omieProductService.js';
import Stock from '../models/Stock.js';
import Movement from '../models/Movement.js';

const router = express.Router();

// Stock sync routes
router.post('/stock/from-omie', async (req, res) => {
  try {
    const result = await syncAllStockFromOmie();
    res.json({
      success: true,
      syncedCount: result.syncedCount,
      errors: result.errors,
      message: `Synced ${result.syncedCount} products from Omie`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

router.post('/stock/to-omie', async (req, res) => {
  try {
    const count = await sendStockToOmie();
    res.json({
      success: true,
      syncedCount: count,
      message: `Sent ${count} stock records to Omie`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

router.get('/stock/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const stock = await getStockFromOmie(productId);
    res.json({
      success: true,
      data: stock
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

router.post('/stock/adjust', async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;
    const result = await adjustStockInOmie(productId, quantity, reason);
    res.json({
      success: true,
      data: result,
      message: `Stock adjusted for product ${productId}`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Movement sync routes
router.post('/movements/from-omie', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate are required'
      });
    }

    const result = await syncMovementsFromOmie(startDate, endDate);
    res.json({
      success: true,
      syncedCount: result.syncedCount,
      errors: result.errors,
      message: `Synced ${result.syncedCount} movements from Omie`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

router.post('/movements/to-omie/:movementId', async (req, res) => {
  try {
    const { movementId } = req.params;
    const movement = await Movement.findById(movementId).populate('product');
    
    if (!movement) {
      return res.status(404).json({
        success: false,
        error: 'Movement not found'
      });
    }

    const result = await sendMovementToOmie(movement);
    res.json({
      success: true,
      data: result,
      message: `Movement ${movementId} sent to Omie`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Location sync routes
router.post('/locations/from-omie', async (req, res) => {
  try {
    const count = await syncLocationsFromOmie();
    res.json({
      success: true,
      syncedCount: count,
      message: `Synced ${count} locations from Omie`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Order sync routes
router.post('/orders', async (req, res) => {
  try {
    const { syncOrders } = await import('../services/omieOrderService.js');
    const count = await syncOrders();
    res.json({
      success: true,
      syncedCount: count,
      message: `Synced ${count} orders from Omie`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Product sync routes
router.post('/products/from-omie', async (req, res) => {
  try {
    const count = await syncProducts();
    res.json({
      success: true,
      syncedCount: count,
      message: `Synced ${count} products from Omie`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Full sync route
router.post('/full', async (req, res) => {
  try {
    const results = {
      products: { syncedCount: 0, errors: [] },
      locations: { syncedCount: 0, errors: [] },
      stock: { syncedCount: 0, errors: [] },
      movements: { syncedCount: 0, errors: [] }
    };

    // Sync products
    try {
      results.products.syncedCount = await syncProducts();
    } catch (error) {
      results.products.errors.push(error.message);
    }

    // Sync locations
    try {
      results.locations.syncedCount = await syncLocationsFromOmie();
    } catch (error) {
      results.locations.errors.push(error.message);
    }

    // Sync stock
    try {
      const stockResult = await syncAllStockFromOmie();
      results.stock.syncedCount = stockResult.syncedCount;
      results.stock.errors = stockResult.errors;
    } catch (error) {
      results.stock.errors.push(error.message);
    }

    // Sync movements (last 7 days)
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      const movementResult = await syncMovementsFromOmie(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      results.movements.syncedCount = movementResult.syncedCount;
      results.movements.errors = movementResult.errors;
    } catch (error) {
      results.movements.errors.push(error.message);
    }

    const totalSynced = Object.values(results).reduce((sum, r) => sum + r.syncedCount, 0);
    const totalErrors = Object.values(results).reduce((sum, r) => sum + r.errors.length, 0);

    res.json({
      success: totalErrors === 0,
      results,
      summary: {
        totalSynced,
        totalErrors
      },
      message: `Full sync completed: ${totalSynced} items synced, ${totalErrors} errors`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Status route
router.get('/status', async (req, res) => {
  try {
    const stockCount = await Stock.countDocuments();
    const movementCount = await Movement.countDocuments();
    const syncedMovements = await Movement.countDocuments({ omieId: { $exists: true, $ne: null } });

    res.json({
      success: true,
      status: {
        stockRecords: stockCount,
        movementRecords: movementCount,
        syncedMovements,
        pendingMovements: movementCount - syncedMovements
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
