import Product from './models/Product.js';

async function checkProduct() {
  try {
    const product = await Product.findOne({ omieId: '9522045017' }); // ID real do produto
    if (product) {
      console.log('Produto encontrado:', product.descricao, 'omieId:', product.omieId);
    } else {
      console.log('Produto não encontrado com omieId: 9522045017');
      
      // Listar todos os produtos
      const allProducts = await Product.find({});
      console.log('Total de produtos:', allProducts.length);
      allProducts.forEach(p => {
        if (p.omieId) {
          console.log('  -', p.descricao, 'omieId:', p.omieId);
        }
      });
    }
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

checkProduct();
