import Order from './models/Order.js';

async function checkOrders() {
  try {
    const orders = await Order.find({ omieId: { $ne: null } }).populate('items.product');
    console.log('Pedidos sincronizados da Omie:');
    orders.forEach(order => {
      console.log('Pedido OmieID:', order.omieId, 'Status:', order.status);
      order.items.forEach(item => {
        console.log('  - Produto:', item.product?.descricao || 'N/A', 'omieId:', item.product?.omieId, 'Qtd:', item.quantity);
      });
    });
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

checkOrders();
