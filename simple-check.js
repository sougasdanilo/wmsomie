// Verificar pedidos via API
fetch('http://localhost:3000/api/orders')
  .then(response => response.json())
  .then(orders => {
    console.log('Total de pedidos:', orders.length);
    const omieOrders = orders.filter(o => o.omieId);
    console.log('Pedidos da Omie:', omieOrders.length);
    
    omieOrders.forEach(order => {
      console.log(`- Pedido #${order.omieId}: ${order.items.length} itens`);
    });
  })
  .catch(error => console.error('Erro:', error));
