// src/jobs/syncJob.js
import cron from 'node-cron';
import { syncProducts } from '../services/omieProductService.js';
import { sendStockToOmie, syncAllStockFromOmie } from '../services/omieStockService.js';
import { syncMovementsFromOmie, syncLocationsFromOmie } from '../services/omieMovementService.js';
import { syncOrders } from '../services/omieOrderService.js';
import { reserveStock } from '../services/orderService.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

export function startSyncJobs() {
  // Sync orders every 10 minutes for each user
  cron.schedule('*/10 * * * *', async () => {
    try {
      const users = await User.find({ 'omieConfig.isConfigured': true });
      let totalOrders = 0;

      for (const user of users) {
        try {
          const countOrders = await syncOrders(user._id);
          totalOrders += countOrders;
          console.log(`User ${user.email}: Orders synced: ${countOrders}`);
        } catch (err) {
          console.error(`User ${user.email}: Error in order sync job:`, err.message);
        }
      }

      console.log(`Total orders synced across all users: ${totalOrders}`);

      const pendingOrders = await Order.find({ status: 'PENDING' });

      for (const order of pendingOrders) {
        await reserveStock(order._id);
      }

    } catch (err) {
      console.error('Error in order sync job:', err.message);
    }
  });

  // Sync products every 30 minutes for each user
  cron.schedule('*/30 * * * *', async () => {
    try {
      const users = await User.find({ 'omieConfig.isConfigured': true });
      let totalProducts = 0;

      for (const user of users) {
        try {
          const countProducts = await syncProducts(user._id);
          totalProducts += countProducts;
          console.log(`User ${user.email}: Products synced: ${countProducts}`);
        } catch (err) {
          console.error(`User ${user.email}: Error in product sync job:`, err.message);
        }
      }

      console.log(`Total products synced across all users: ${totalProducts}`);
    } catch (err) {
      console.error('Error in product sync job:', err.message);
    }
  });

  // Sync locations once daily at 2 AM for each user
  cron.schedule('0 2 * * *', async () => {
    try {
      const users = await User.find({ 'omieConfig.isConfigured': true });
      let totalLocations = 0;

      for (const user of users) {
        try {
          const countLocations = await syncLocationsFromOmie(user._id);
          totalLocations += countLocations;
          console.log(`User ${user.email}: Locations synced: ${countLocations}`);
        } catch (err) {
          console.error(`User ${user.email}: Error in location sync job:`, err.message);
        }
      }

      console.log(`Total locations synced across all users: ${totalLocations}`);
    } catch (err) {
      console.error('Error in location sync job:', err.message);
    }
  });

  // Sync stock from Omie every hour for each user
  cron.schedule('0 * * * *', async () => {
    try {
      const users = await User.find({ 'omieConfig.isConfigured': true });
      let totalSynced = 0;
      let totalErrors = [];

      for (const user of users) {
        try {
          const result = await syncAllStockFromOmie(user._id);
          totalSynced += result.syncedCount;
          totalErrors.push(...result.errors);
          console.log(`User ${user.email}: Stock synced: ${result.syncedCount} products, errors: ${result.errors.length}`);
          
          if (result.errors.length > 0) {
            console.error(`User ${user.email}: Stock sync errors:`, result.errors);
          }
        } catch (err) {
          console.error(`User ${user.email}: Error in stock sync job:`, err.message);
        }
      }

      console.log(`Total stock synced across all users: ${totalSynced} products, errors: ${totalErrors.length}`);
      
      if (totalErrors.length > 0) {
        console.error('Total stock sync errors:', totalErrors);
      }
    } catch (err) {
      console.error('Error in stock sync job:', err.message);
    }
  });

  // Sync movements from Omie every 2 hours for each user
  cron.schedule('0 */2 * * *', async () => {
    try {
      const users = await User.find({ 'omieConfig.isConfigured': true });
      let totalMovements = 0;
      let totalErrors = [];

      for (const user of users) {
        try {
          const endDate = new Date();
          const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
          
          const result = await syncMovementsFromOmie(
            user._id,
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
          );
          
          totalMovements += result.syncedCount;
          totalErrors.push(...result.errors);
          console.log(`User ${user.email}: Movements synced: ${result.syncedCount}, errors: ${result.errors.length}`);
          
          if (result.errors.length > 0) {
            console.error(`User ${user.email}: Movement sync errors:`, result.errors);
          }
        } catch (err) {
          console.error(`User ${user.email}: Error in movement sync job:`, err.message);
        }
      }

      console.log(`Total movements synced across all users: ${totalMovements}, errors: ${totalErrors.length}`);
      
      if (totalErrors.length > 0) {
        console.error('Total movement sync errors:', totalErrors);
      }
    } catch (err) {
      console.error('Error in movement sync job:', err.message);
    }
  });

  // Send stock to Omie every 15 minutes for each user
  cron.schedule('*/15 * * * *', async () => {
    try {
      const users = await User.find({ 'omieConfig.isConfigured': true });
      let totalStock = 0;

      for (const user of users) {
        try {
          const count = await sendStockToOmie(user._id);
          totalStock += count;
          console.log(`User ${user.email}: Stock sent to Omie: ${count} products`);
        } catch (err) {
          console.error(`User ${user.email}: Error sending stock to Omie:`, err.message);
        }
      }

      console.log(`Total stock sent to Omie across all users: ${totalStock} products`);
    } catch (err) {
      console.error('Error sending stock to Omie:', err.message);
    }
  });

  console.log('Sync jobs started successfully');
}