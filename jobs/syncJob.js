// src/jobs/syncJob.js
import cron from 'node-cron';
import { syncProducts } from '../services/omieProductService.js';
import { sendStockToOmie } from '../services/omieStockService.js';
import { syncOrders } from '../services/omieOrderService.js';
import { reserveStock } from '../services/orderService.js';
import Order from '../models/Order.js';


export function startSyncJobs() {
  cron.schedule('*/10 * * * *', async () => {
    try {
      const countOrders = await syncOrders();
      console.log(`Orders synced: ${countOrders}`);

      const pendingOrders = await Order.find({ status: 'PENDING' });

      for (const order of pendingOrders) {
        await reserveStock(order._id);
      }

    } catch (err) {
      console.error(err.message);
    }
  });
}