// src/utils/locationSorter.js
// ordena endereços tipo AA1, AA2, AB1... corretamente
import { parseLocationCode } from './locationGenerator.js';

export function sortLocations(locations) {
  return locations.sort((a, b) => {
    try {
      const locA = parseLocationCode(a.code || a);
      const locB = parseLocationCode(b.code || b);
      
      // Primeiro ordena por corredor (aisle)
      const aisleCompare = locA.aisle.localeCompare(locB.aisle);
      if (aisleCompare !== 0) return aisleCompare;
      
      // Depois por posição
      if (locA.position !== locB.position) {
        return locA.position - locB.position;
      }
      
      // Finalmente por nível (level)
      return locA.level - locB.level;
    } catch (error) {
      // Fallback para ordenação alfabética se código for inválido
      return (a.code || a).localeCompare(b.code || b);
    }
  });
}

/**
 * Agrupa localizações por corredor
 * @param {Array} locations - Array de localizações
 * @returns {Object} Objeto agrupado por corredor
 */
export function groupLocationsByAisle(locations) {
  const grouped = {};
  
  locations.forEach(location => {
    try {
      const parsed = parseLocationCode(location.code || location);
      const aisle = parsed.aisle;
      
      if (!grouped[aisle]) {
        grouped[aisle] = [];
      }
      grouped[aisle].push(location);
    } catch (error) {
      // Ignora códigos inválidos
    }
  });
  
  // Ordena cada grupo
  Object.keys(grouped).forEach(aisle => {
    grouped[aisle] = sortLocations(grouped[aisle]);
  });
  
  return grouped;
}