// src/services/omieStockService.js
import Stock from '../models/Stock.js';
import Product from '../models/Product.js';
import Location from '../models/Location.js';
import { callOmieWithUser } from './omieClient.js';
import logger from '../utils/syncLogger.js';

export async function sendStockToOmie(userId) {
  logger.info(`Starting stock sync to Omie for user ${userId}`);
  
  // Buscar produtos com estoque local
  const stockAggregates = await Stock.aggregate([
    { $match: { quantity: { $gt: 0 }, qualityStatus: 'GOOD' } },
    { 
      $group: {
        _id: '$sku',
        totalQuantity: { $sum: '$quantity' }
      }
    }
  ]);
  
  let successCount = 0;
  let errorCount = 0;

  for (const stock of stockAggregates) {
    try {
      // Buscar produto para obter omieId
      const product = await Product.findOne({ codigo: stock._id });
      if (!product || !product.omieId) {
        logger.warn(`Product ${stock._id} has no Omie ID, skipping`);
        continue;
      }

      // First get current stock from Omie
      let currentOmieStock = 0;
      try {
        const omieStockData = await getStockFromOmie(userId, product.omieId);
        if (omieStockData && omieStockData.saldo !== undefined) {
          currentOmieStock = omieStockData.saldo;
        } else if (omieStockData && omieStockData.fisico !== undefined) {
          currentOmieStock = omieStockData.fisico;
        }
      } catch (error) {
        logger.warn(`Could not get current Omie stock for ${stock._id}, assuming 0`);
      }

      // Calculate difference
      const difference = stock.totalQuantity - currentOmieStock;
      
      if (difference !== 0) {
        await callOmieWithUser(
          userId,
          'estoque/movimento/',
          'IncluirMovimentoEstoque',
          {
            codigo_local_estoque: 1, // Default warehouse
            id_prod: parseInt(product.omieId),
            data_movimento: new Date().toLocaleDateString('pt-BR'),
            tipo_movimento: difference > 0 ? 'E' : 'S', // E = Entrada, S = Saída
            quantidade: Math.abs(difference),
            valor_unitario: 0,
            motivo: 'Ajuste de Estoque WMS'
          }
        );
        
        logger.info(`Adjusted stock for ${stock._id}: ${currentOmieStock} → ${stock.totalQuantity} (${difference > 0 ? '+' : ''}${difference})`);
      } else {
        logger.info(`Stock already synchronized for ${stock._id}: ${stock.totalQuantity}`);
      }
      
      successCount++;
      logger.logStockSync(product, 'sent_to_omie', stock.totalQuantity);
    } catch (error) {
      errorCount++;
      logger.error(`Failed to sync stock for ${stock._id}`, { error: error.message });
    }
  }

  logger.info('Stock sync to Omie completed', { successCount, errorCount });
  return successCount;
}

export async function getStockFromOmie(userId, productOmieId) {
  logger.debug(`Fetching stock from Omie for product ${productOmieId}`);
  
  try {
    // Primeiro tenta buscar pelo ID do produto
    const result = await callOmieWithUser(
      userId,
      'estoque/consulta/',
      'PosicaoEstoque',
      {
        id_prod: parseInt(productOmieId),
        codigo_local_estoque: 0, // Todos os locais
        data: new Date().toLocaleDateString('pt-BR')
      }
    );

    logger.logApiCall('PosicaoEstoque', 'estoque/consulta/', { productOmieId }, result);
    return result;
  } catch (error) {
    logger.logApiCall('PosicaoEstoque', 'estoque/consulta/', { productOmieId }, null, error);
    
    // Se falhar, tenta listar posição de estoque geral
    try {
      const listResult = await callOmieWithUser(
        userId,
        'estoque/consulta/',
        'ListarPosEstoque',
        {
          nPagina: 1,
          nRegPorPagina: 50,
          dDataPosicao: new Date().toLocaleDateString('pt-BR'),
          cExibeTodos: "N",
          codigo_local_estoque: 0
        }
      );
      
      // Filtrar pelo produto específico
      if (listResult.produtos && listResult.produtosArray) {
        const productStock = listResult.produtosArray.find(
          p => p.id_prod == productOmieId || p.cod_int === productOmieId
        );
        
        if (productStock) {
          logger.logApiCall('ListarPosEstoque', 'estoque/consulta/', { productOmieId }, productStock);
          return productStock;
        }
      }
      
      logger.logApiCall('ListarPosEstoque', 'estoque/consulta/', { productOmieId }, listResult);
      return listResult;
    } catch (listError) {
      logger.logApiCall('ListarPosEstoque', 'estoque/consulta/', { productOmieId }, null, listError);
      throw listError;
    }
  }
}

export async function syncAllStockFromOmie(userId) {
  logger.info(`Starting full stock sync from Omie for user ${userId}`);
  
  // Importar produtos para garantir que temos os dados mais recentes
  const { syncProducts } = await import('./omieProductService.js');
  
  logger.info('Syncing products first to get latest data...');
  await syncProducts(userId);
  
  const products = await Product.find({ omieId: { $exists: true, $ne: null }, isActive: true });
  
  // Criar localização RECEBIMENTO se não existir
  let receivingLocation = await Location.findOne({ code: 'RECEBIMENTO' });
  if (!receivingLocation) {
    receivingLocation = await Location.create({
      code: 'RECEBIMENTO',
      description: 'Área de Recebimento',
      type: 'receiving',
      zone: 'Recebimento'
    });
    logger.info('Created RECEBIMENTO location');
  }

  let syncedCount = 0;
  const errors = [];

  for (const product of products) {
    try {
      // Tenta consultar estoque via API específica primeiro
      let stockQuantity = null;
      
      try {
        const omieStock = await getStockFromOmie(userId, product.omieId);
        
        // Extrair quantidade do campo correto 'saldo'
        if (omieStock && omieStock.saldo !== undefined) {
          stockQuantity = omieStock.saldo;
        } else if (omieStock && omieStock.fisico !== undefined) {
          stockQuantity = omieStock.fisico;
        }
      } catch (apiError) {
        logger.warn(`Failed to get stock from API for ${product.codigo}, trying product data...`);
        
        // Se falhar, usa o quantidade_estoque do produto
        if (product.quantidade_estoque !== undefined) {
          stockQuantity = product.quantidade_estoque;
          logger.info(`Using stock quantity from product data for ${product.codigo}: ${stockQuantity}`);
        }
      }
      
      if (stockQuantity !== null && stockQuantity > 0) {
        // Verificar estoque local atual
        const currentStock = await Stock.find({ sku: product.codigo });
        const localTotal = currentStock.reduce((sum, s) => sum + s.quantity, 0);
        
        // Se houver diferença, atualizar para bater com Omie
        if (localTotal !== stockQuantity) {
          logger.info(`Updating stock for ${product.codigo}: ${localTotal} → ${stockQuantity} (Omie has: ${stockQuantity})`);
          
          if (localTotal > 0) {
            // Atualizar estoque existente
            const difference = stockQuantity - localTotal;
            
            if (currentStock.length > 0) {
              // Distribuir a diferença no primeiro registro
              const firstStock = currentStock[0];
              firstStock.quantity = Math.max(0, firstStock.quantity + difference);
              firstStock.lastUpdated = new Date();
              firstStock.omieSyncedAt = new Date();
              await firstStock.save();
              
              logger.info(`Updated stock record for ${product.codigo} by ${difference > 0 ? '+' : ''}${difference}`);
            }
          } else {
            // Criar/atualizar estoque em RECEBIMENTO
            await Stock.findOneAndUpdate(
              { sku: product.codigo, locationCode: 'RECEBIMENTO' },
              { 
                quantity: stockQuantity,
                lastUpdated: new Date(),
                omieSyncedAt: new Date()
              },
              { upsert: true, new: true }
            );
            
            logger.info(`Created stock record for ${product.codigo} with ${stockQuantity} units`);
          }
          
          syncedCount++;
          logger.logStockSync(product, 'updated_to_omie', stockQuantity);
        } else {
          // Estoque já sincronizado
          logger.info(`Stock already synchronized for ${product.codigo}: ${localTotal}`);
          syncedCount++;
          logger.logStockSync(product, 'already_synced', localTotal);
        }
        
        await receivingLocation.updateSku(product.codigo, stockQuantity, 0);
        
        syncedCount++;
        logger.logStockSync(product, 'synced_to_receiving', stockQuantity);
      } else {
        logger.warn(`No stock quantity found for product ${product.codigo}`);
      }
      
    } catch (error) {
      errors.push({ product: product.codigo, error: error.message });
      logger.logStockSync(product, 'sync_from_omie_failed', 0, error);
    }
  }

  logger.logSyncResult('stock_from_omie', { syncedCount, errors });
  return { syncedCount, errors };
}

export async function getStockMovementsFromOmie(userId, productOmieId, startDate, endDate) {
  logger.debug(`Fetching stock movements from Omie for product ${productOmieId}`);
  
  try {
    // Usar o método correto para listar movimentos
    const result = await callOmieWithUser(
      userId,
      'estoque/consulta/',
      'ListarMovimentoEstoque',
      {
        nPagina: 1,
        nRegPorPagina: 50,
        codigo_local_estoque: 0, // Todos os locais
        idProd: parseInt(productOmieId),
        dDtInicial: startDate,
        dDtFinal: endDate,
        lista_local_estoque: ""
      }
    );

    logger.logApiCall('ListarMovimentoEstoque', 'estoque/consulta/', { productOmieId, startDate, endDate }, result);
    return result;
  } catch (error) {
    logger.logApiCall('ListarMovimentoEstoque', 'estoque/consulta/', { productOmieId, startDate, endDate }, null, error);
    throw error;
  }
}

export async function adjustStockInOmie(userId, productOmieId, quantity, reason = 'Ajuste WMS') {
  logger.info(`Adjusting stock in Omie for product ${productOmieId}`, { quantity, reason });
  
  try {
    const result = await callOmieWithUser(
      userId,
      'estoque/movimento/',
      'IncluirMovimentoEstoque',
      {
        codigo_local_estoque: 1, // Default warehouse
        id_prod: parseInt(productOmieId),
        data_movimento: new Date().toLocaleDateString('pt-BR'),
        tipo_movimento: quantity > 0 ? 'E' : 'S', // E = Entrada, S = Saída
        quantidade: Math.abs(quantity),
        valor_unitario: 0,
        motivo: reason
      }
    );

    logger.logApiCall('IncluirMovimentoEstoque', 'estoque/movimento/', { productOmieId, quantity, reason }, result);
    return result;
  } catch (error) {
    logger.logApiCall('IncluirMovimentoEstoque', 'estoque/movimento/', { productOmieId, quantity, reason }, null, error);
    throw error;
  }
}