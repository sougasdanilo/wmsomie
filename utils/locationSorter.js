// src/utils/locationSorter.js
// ordena endereços tipo AA1, AA2, AB1... corretamente
import { parseLocationCode } from './locationGenerator.js';

export function sortLocations(locations) {
  return locations.sort((a, b) => {
    try {
      // Extrai o código da localização de forma segura
      const codeA = typeof a === 'string' ? a : (a?.code || '');
      const codeB = typeof b === 'string' ? b : (b?.code || '');
      
      const locA = parseLocationCode(codeA);
      const locB = parseLocationCode(codeB);
      
      // Primeiro ordena por zona (se existir)
      if (locA.zone && locB.zone) {
        const zoneCompare = locA.zone.localeCompare(locB.zone);
        if (zoneCompare !== 0) return zoneCompare;
      } else if (locA.zone) {
        return 1; // A tem zona, B não -> B vem primeiro
      } else if (locB.zone) {
        return -1; // B tem zona, A não -> A vem primeiro
      }
      
      // Depois ordena por corredor (aisle)
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
      const codeA = typeof a === 'string' ? a : (a?.code || '');
      const codeB = typeof b === 'string' ? b : (b?.code || '');
      return codeA.localeCompare(codeB);
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
      // Extrai o código de forma segura
      const code = typeof location === 'string' ? location : (location?.code || '');
      const parsed = parseLocationCode(code);
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