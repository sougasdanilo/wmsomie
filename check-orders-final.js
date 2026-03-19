import Order from './models/Order.js';

async function checkOrders() {
  try {
    const orders = await Order.find({ omieId: { $ne: null } }).populate('items.product');
    console.log('Pedidos sincronizados da Omie:');
    orders.forEach(order => {
      console.log(`\nPedido OmieID: ${order.omieId}`);
      console.log(`Status: ${order.status}`);
      console.log(`Itens: ${order.items.length}`);
      order.items.forEach(item => {
        console.log(`  - ${item.product.descricao} (Qtd: ${item.quantity})`);
      });
    });
    
    console.log(`\nTotal de pedidos da Omie: ${orders.length}`);
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

checkOrders();
