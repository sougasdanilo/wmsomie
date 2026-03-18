// src/services/omieStockService.js
import Stock from '../models/Stock.js';
import Product from '../models/Product.js';
import Location from '../models/Location.js';
import { callOmie } from './omieClient.js';
import logger from '../utils/syncLogger.js';

export async function sendStockToOmie() {
  logger.info('Starting stock sync to Omie');
  
  const stocks = await Stock.find().populate('product');
  let successCount = 0;
  let errorCount = 0;

  for (const s of stocks) {
    if (!s.product.omieId) {
      logger.warn(`Product ${s.product.sku} has no Omie ID, skipping`);
      continue;
    }

    try {
      await callOmie(
        'estoque/ajuste/',
        'AjustarEstoque',
        {
          codigo_produto: s.product.omieId,
          quantidade: s.quantity,
        }
      );
      
      successCount++;
      logger.logStockSync(s.product, 'sent_to_omie', s.quantity);
    } catch (error) {
      errorCount++;
      logger.logStockSync(s.product, 'send_to_omie_failed', s.quantity, error);
    }
  }

  logger.info('Stock sync to Omie completed', { successCount, errorCount });
  return successCount;
}

export async function getStockFromOmie(productOmieId) {
  logger.debug(`Fetching stock from Omie for product ${productOmieId}`);
  
  try {
    const result = await callOmie(
      'estoque/consulta/',
      'ConsultarEstoque',
      {
        codigo_produto: productOmieId,
      }
    );

    logger.logApiCall('ConsultarEstoque', 'estoque/consulta/', { productOmieId }, result);
    return result;
  } catch (error) {
    logger.logApiCall('ConsultarEstoque', 'estoque/consulta/', { productOmieId }, null, error);
    throw error;
  }
}

export async function syncAllStockFromOmie() {
  logger.info('Starting full stock sync from Omie');
  
  const products = await Product.find({ omieId: { $exists: true, $ne: null } });
  const locations = await Location.find();
  const defaultLocation = locations[0];

  if (!defaultLocation) {
    const error = new Error('No default location found. Please create a location first.');
    logger.error('Stock sync failed - no default location');
    throw error;
  }

  let syncedCount = 0;
  const errors = [];

  for (const product of products) {
    try {
      const omieStock = await getStockFromOmie(product.omieId);
      
      if (omieStock && omieStock.estoque_atual !== undefined) {
        await Stock.findOneAndUpdate(
          { product: product._id, location: defaultLocation._id },
          { quantity: omieStock.estoque_atual },
          { upsert: true, new: true }
        );
        syncedCount++;
        logger.logStockSync(product, 'synced_from_omie', omieStock.estoque_atual);
      }
    } catch (error) {
      errors.push({ product: product.sku, error: error.message });
      logger.logStockSync(product, 'sync_from_omie_failed', 0, error);
    }
  }

  logger.logSyncResult('stock_from_omie', { syncedCount, errors });
  return { syncedCount, errors };
}

export async function getStockMovementsFromOmie(productOmieId, startDate, endDate) {
  logger.debug(`Fetching stock movements from Omie for product ${productOmieId}`);
  
  try {
    const result = await callOmie(
      'estoque/movestoque/',
      'ConsultarMovimentoEstoque',
      {
        codigo_produto: productOmieId,
        data_inicial: startDate,
        data_final: endDate,
      }
    );

    logger.logApiCall('ConsultarMovimentoEstoque', 'estoque/movestoque/', { productOmieId, startDate, endDate }, result);
    return result;
  } catch (error) {
    logger.logApiCall('ConsultarMovimentoEstoque', 'estoque/movestoque/', { productOmieId, startDate, endDate }, null, error);
    throw error;
  }
}

export async function adjustStockInOmie(productOmieId, quantity, reason = 'Ajuste WMS') {
  logger.info(`Adjusting stock in Omie for product ${productOmieId}`, { quantity, reason });
  
  try {
    const result = await callOmie(
      'estoque/ajuste/',
      'AjustarEstoque',
      {
        codigo_produto: productOmieId,
        quantidade: quantity,
        motivo: reason,
      }
    );

    logger.logApiCall('AjustarEstoque', 'estoque/ajuste/', { productOmieId, quantity, reason }, result);
    return result;
  } catch (error) {
    logger.logApiCall('AjustarEstoque', 'estoque/ajuste/', { productOmieId, quantity, reason }, null, error);
    throw error;
  }
}