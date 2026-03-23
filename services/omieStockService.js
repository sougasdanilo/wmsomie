import Stock from '../models/Stock.js';
import Product from '../models/Product.js';
import Location from '../models/Location.js';
import { callOmieWithUser } from './omieClient.js';
import logger from '../utils/syncLogger.js';

// 🔁 utils
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function callOmieWithRetry(userId, endpoint, action, params, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await callOmieWithUser(userId, endpoint, action, params);
    } catch (err) {
      if (attempt === retries - 1) throw err;

      const delay = 500 * (attempt + 1);
      logger.warn(`Retry ${attempt + 1} for ${action} in ${delay}ms`);
      await sleep(delay);
    }
  }
}

//
// 🚀 1. BUSCAR TODO ESTOQUE DA OMIE (PAGINADO)
//
export async function listAllStockFromOmie(userId) {
  let page = 1;
  let totalPages = 1;
  const allStock = [];

  do {
    const response = await callOmieWithRetry(
      userId,
      'estoque/consulta/',
      'ListarPosEstoque',
      {
        nPagina: page,
        nRegPorPagina: 50,
        dDataPosicao: new Date().toLocaleDateString('pt-BR'),
        cExibeTodos: "N",
        codigo_local_estoque: 0
      }
    );

    const produtos = response.produtosArray || [];
    totalPages = response.total_de_paginas || 1;

    logger.debug(`Stock page ${page}/${totalPages} - ${produtos.length} items`);

    allStock.push(...produtos);

    page++;
    await sleep(200);

  } while (page <= totalPages);

  logger.info(`Total stock items fetched: ${allStock.length}`);

  return allStock;
}

//
// 🚀 2. SYNC COMPLETO DE ESTOQUE (OTIMIZADO)
//
export async function syncAllStockFromOmie(userId) {
  logger.info(`Starting optimized stock sync from Omie`);

  // 🔹 garante produtos atualizados
  const { syncProducts } = await import('./omieProductService.js');
  await syncProducts(userId);

  // 🔹 busca tudo de estoque de uma vez
  const allStock = await listAllStockFromOmie(userId);

  // 🔹 cria mapa rápido
  const stockMap = new Map();
  for (const item of allStock) {
    stockMap.set(parseInt(item.id_prod), item);
  }

  // 🔹 produtos locais
  const products = await Product.find({
    omieId: { $exists: true, $ne: null },
    isActive: true
  });

  // 🔹 garantir localização
  let receivingLocation = await Location.findOne({ code: 'RECEBIMENTO' });
  if (!receivingLocation) {
    receivingLocation = await Location.create({
      code: 'RECEBIMENTO',
      description: 'Área de Recebimento',
      type: 'receiving',
      zone: 'Recebimento'
    });
  }

  let syncedCount = 0;
  const errors = [];

  for (const product of products) {
    try {
      const omieStock = stockMap.get(parseInt(product.omieId));

      if (!omieStock) {
        logger.warn(`No stock found in Omie for ${product.codigo}`);
        continue;
      }

      const stockQuantity =
        omieStock.saldo ?? omieStock.fisico ?? 0;

      const currentStock = await Stock.find({ sku: product.codigo });
      const localTotal = currentStock.reduce((sum, s) => sum + s.quantity, 0);

      if (localTotal !== stockQuantity) {
        const difference = stockQuantity - localTotal;

        logger.info(`Updating ${product.codigo}: ${localTotal} → ${stockQuantity}`);

        if (currentStock.length > 0) {
          const firstStock = currentStock[0];
          firstStock.quantity = Math.max(0, firstStock.quantity + difference);
          firstStock.lastUpdated = new Date();
          firstStock.omieSyncedAt = new Date();
          await firstStock.save();
        } else {
          await Stock.findOneAndUpdate(
            { sku: product.codigo, locationCode: 'RECEBIMENTO' },
            {
              quantity: stockQuantity,
              lastUpdated: new Date(),
              omieSyncedAt: new Date()
            },
            { upsert: true }
          );
        }

        logger.logStockSync(product, 'updated_from_omie', stockQuantity);
      }

      await receivingLocation.updateSku(product.codigo, stockQuantity, 0);

      syncedCount++;

    } catch (error) {
      errors.push({ product: product.codigo, error: error.message });
      logger.error(`Stock sync failed for ${product.codigo}`, {
        error: error.message
      });
    }
  }

  logger.info(`Stock sync finished`, { syncedCount, errors: errors.length });

  return { syncedCount, errors };
}

//
// 🚀 3. ENVIAR AJUSTE DE ESTOQUE (COM RETRY)
//
export async function adjustStockInOmie(userId, productOmieId, quantity, reason = 'Ajuste WMS') {
  try {
    const result = await callOmieWithRetry(
      userId,
      'estoque/movimento/',
      'IncluirMovimentoEstoque',
      {
        codigo_local_estoque: 1,
        id_prod: parseInt(productOmieId),
        data_movimento: new Date().toLocaleDateString('pt-BR'),
        tipo_movimento: quantity > 0 ? 'E' : 'S',
        quantidade: Math.abs(quantity),
        valor_unitario: 0,
        motivo: reason
      }
    );

    logger.logApiCall('IncluirMovimentoEstoque', 'estoque/movimento/', {
      productOmieId,
      quantity
    }, result);

    return result;

  } catch (error) {
    logger.error(`Failed to adjust stock`, {
      productOmieId,
      error: error.message
    });
    throw error;
  }
}

//
// 🚀 4. MOVIMENTOS (PAGINADO)
//
export async function getStockMovementsFromOmie(userId, productOmieId, startDate, endDate) {
  let page = 1;
  let totalPages = 1;
  const allMovements = [];

  do {
    const response = await callOmieWithRetry(
      userId,
      'estoque/consulta/',
      'ListarMovimentoEstoque',
      {
        nPagina: page,
        nRegPorPagina: 50,
        idProd: parseInt(productOmieId),
        dDtInicial: startDate,
        dDtFinal: endDate,
        codigo_local_estoque: 0
      }
    );

    const movimentos = response.movimentos || [];
    totalPages = response.total_de_paginas || 1;

    allMovements.push(...movimentos);

    page++;
    await sleep(200);

  } while (page <= totalPages);

  return allMovements;
}
