import Stock from './models/Stock.js';
import Product from './models/Product.js';
import Location from './models/Location.js';

async function fixStock() {
  try {
    // Encontrar o produto Mouse
    const product = await Product.findOne({ codigo: '1000' });
    if (!product) {
      console.log('Produto Mouse não encontrado');
      return;
    }
    
    console.log('Produto encontrado:', product.descricao);
    
    // Criar localização se não existir
    let location = await Location.findOne({ code: 'A-01-01' });
    if (!location) {
      location = await Location.create({
        code: 'A-01-01',
        description: 'Corredor A Prateleira 01'
      });
      console.log('Localização criada:', location.code);
    }
    
    // Criar ou atualizar estoque
    const stock = await Stock.findOneAndUpdate(
      { sku: product.codigo, locationCode: location.code },
      { 
        quantity: 10,
        reservedQuantity: 0,
        availableQuantity: 10,
        lastUpdated: new Date()
      },
      { new: true, upsert: true }
    );
    
    console.log('Estoque atualizado:', {
      sku: stock.sku,
      location: stock.locationCode,
      quantity: stock.quantity,
      available: stock.availableQuantity
    });
    
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

fixStock();
