// src/jobs/syncJob.js
import cron from 'node-cron';
import { syncProducts } from '../services/omieProductService.js';
import { sendStockToOmie, syncAllStockFromOmie } from '../services/omieStockService.js';
import { syncMovementsFromOmie, syncLocationsFromOmie } from '../services/omieMovementService.js';
import { syncOrders } from '../services/omieOrderService.js';
import { reserveStock } from '../services/orderService.js';
import Order from '../models/Order.js';

export function startSyncJobs() {
  // Sync orders every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    try {
      const countOrders = await syncOrders();
      console.log(`Orders synced: ${countOrders}`);

      const pendingOrders = await Order.find({ status: 'PENDING' });

      for (const order of pendingOrders) {
        await reserveStock(order._id);
      }

    } catch (err) {
      console.error('Error in order sync job:', err.message);
    }
  });

  // Sync products every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      const countProducts = await syncProducts();
      console.log(`Products synced: ${countProducts}`);
    } catch (err) {
      console.error('Error in product sync job:', err.message);
    }
  });

  // Sync locations once daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      const countLocations = await syncLocationsFromOmie();
      console.log(`Locations synced: ${countLocations}`);
    } catch (err) {
      console.error('Error in location sync job:', err.message);
    }
  });

  // Sync stock from Omie every hour
  cron.schedule('0 * * * *', async () => {
    try {
      const result = await syncAllStockFromOmie();
      console.log(`Stock synced: ${result.syncedCount} products, errors: ${result.errors.length}`);
      
      if (result.errors.length > 0) {
        console.error('Stock sync errors:', result.errors);
      }
    } catch (err) {
      console.error('Error in stock sync job:', err.message);
    }
  });

  // Sync movements from Omie every 2 hours
  cron.schedule('0 */2 * * *', async () => {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
      
      const result = await syncMovementsFromOmie(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      
      console.log(`Movements synced: ${result.syncedCount}, errors: ${result.errors.length}`);
      
      if (result.errors.length > 0) {
        console.error('Movement sync errors:', result.errors);
      }
    } catch (err) {
      console.error('Error in movement sync job:', err.message);
    }
  });

  // Send stock to Omie every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      const count = await sendStockToOmie();
      console.log(`Stock sent to Omie: ${count} products`);
    } catch (err) {
      console.error('Error sending stock to Omie:', err.message);
    }
  });

  console.log('Sync jobs started successfully');
}