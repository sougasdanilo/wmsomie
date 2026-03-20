// Test script for location sorting
import { sortLocations } from '../utils/locationSorter.js';

// Test data with various location formats
const testLocations = [
  { code: 'A1', description: 'Corredor A, Posição 1' },
  { code: 'A10', description: 'Corredor A, Posição 10' },
  { code: 'A2', description: 'Corredor A, Posição 2' },
  { code: 'B1', description: 'Corredor B, Posição 1' },
  { code: 'B5', description: 'Corredor B, Posição 5' },
  { code: 'AB1', description: 'Corredor AB, Posição 1' },
  { code: 'AB2', description: 'Corredor AB, Posição 2' },
  { code: 'AA1', description: 'Corredor AA, Posição 1' },
  { code: 'RACK-01-POS-A1', description: 'Rack 01, Posição A1' },
  { code: 'RACK-01-POS-A2', description: 'Rack 01, Posição A2' },
  { code: 'RACK-02-POS-A1', description: 'Rack 02, Posição A1' },
  { code: 'PISO1-A1', description: 'Piso 1, Corredor A, Posição 1' },
  { code: 'PISO1-A2', description: 'Piso 1, Corredor A, Posição 2' },
  { code: 'PISO2-A1', description: 'Piso 2, Corredor A, Posição 1' },
  { code: '1-A-01', description: 'Zona 1, Corredor A, Posição 01' },
  { code: '1-A-02', description: 'Zona 1, Corredor A, Posição 02' },
  { code: '2-A-01', description: 'Zona 2, Corredor A, Posição 01' },
  { code: 'RECEBIMENTO', description: 'Área de Recebimento' }
];

console.log('=== Teste de Ordenação de Localizações ===\n');

console.log('Original:');
testLocations.forEach(loc => console.log(`  ${loc.code} - ${loc.description}`));

console.log('\nOrdenado:');
const sorted = sortLocations(testLocations);
sorted.forEach(loc => console.log(`  ${loc.code} - ${loc.description}`));

// Test picking items
console.log('\n=== Teste de Ordenação de Itens de Picking ===\n');

const pickingItems = [
  { 
    product: { codigo: 'PROD001', descricao: 'Produto 1' }, 
    location: { code: 'A10', description: 'Corredor A, Posição 10' }, 
    quantity: 5 
  },
  { 
    product: { codigo: 'PROD002', descricao: 'Produto 2' }, 
    location: { code: 'A1', description: 'Corredor A, Posição 1' }, 
    quantity: 3 
  },
  { 
    product: { codigo: 'PROD003', descricao: 'Produto 3' }, 
    location: { code: 'B1', description: 'Corredor B, Posição 1' }, 
    quantity: 2 
  },
  { 
    product: { codigo: 'PROD004', descricao: 'Produto 4' }, 
    location: { code: 'A2', description: 'Corredor A, Posição 2' }, 
    quantity: 8 
  },
  { 
    product: { codigo: 'PROD005', descricao: 'Produto 5' }, 
    location: { code: 'RECEBIMENTO', description: 'Área de Recebimento' }, 
    quantity: 1 
  }
];

// Sort function similar to frontend
function sortItemsByLocation(items) {
  return items.sort((a, b) => {
    try {
      const locA = a.location?.code || '';
      const locB = b.location?.code || '';
      
      if (!locA && !locB) return 0;
      if (!locA) return 1;
      if (!locB) return -1;
      
      const parseCode = (code) => {
        const trimmed = code.trim().toUpperCase();
        
        const patterns = [
          /^([A-Z]+)(\d+)$/,
          /^.*?(\d+).*?([A-Z]+).*?(\d+)$/,
          /^(\d+)-([A-Z]+)(\d+)$/,
          /^(\d+)-([A-Z]+)-(\d+)$/
        ];
        
        for (const pattern of patterns) {
          const match = trimmed.match(pattern);
          if (match) {
            if (match.length === 3) {
              return {
                aisle: match[1],
                position: parseInt(match[2]),
                level: 0,
                zone: null
              };
            } else if (match.length === 4) {
              return {
                zone: match[1],
                aisle: match[2],
                position: parseInt(match[3]),
                level: 0
              };
            }
          }
        }
        
        return {
          aisle: trimmed,
          position: 0,
          level: 0,
          zone: null
        };
      };
      
      const parsedA = parseCode(locA);
      const parsedB = parseCode(locB);
      
      if (parsedA.zone && parsedB.zone) {
        const zoneCompare = parsedA.zone.localeCompare(parsedB.zone);
        if (zoneCompare !== 0) return zoneCompare;
      } else if (parsedA.zone) {
        return 1;
      } else if (parsedB.zone) {
        return -1;
      }
      
      const aisleCompare = parsedA.aisle.localeCompare(parsedB.aisle);
      if (aisleCompare !== 0) return aisleCompare;
      
      if (parsedA.position !== parsedB.position) {
        return parsedA.position - parsedB.position;
      }
      
      return parsedA.level - parsedB.level;
    } catch (error) {
      return (a.location?.code || '').localeCompare(b.location?.code || '');
    }
  });
}

console.log('Itens Original:');
pickingItems.forEach(item => {
  console.log(`  ${item.product.codigo} - ${item.location.code} - Qtd: ${item.quantity}`);
});

console.log('\nItens Ordenados por Localização:');
const sortedItems = sortItemsByLocation(pickingItems);
sortedItems.forEach(item => {
  console.log(`  ${item.product.codigo} - ${item.location.code} - Qtd: ${item.quantity}`);
});

console.log('\n=== Rota Otimizada de Coleta ===\n');
console.log('Ordem recomendada para coleta:');
sortedItems.forEach((item, index) => {
  console.log(`${index + 1}. Ir para ${item.location.code} - Coletar ${item.quantity}x ${item.product.descricao}`);
});
