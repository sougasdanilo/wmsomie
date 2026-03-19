// src/services/locationService.js
import Location from '../models/Location.js';
import { generateNextCode, generateLocationSequence, isValidLocationCode, parseLocationCode } from '../utils/locationGenerator.js';

/**
 * Cria uma nova localização com código sequencial automático
 * @param {Object} locationData - Dados da localização
 * @returns {Promise<Location>} Localização criada
 */
export async function createLocation(locationData) {
  const { aisle, position, level, zone, description } = locationData;
  
  // Se não informar aisle/position, gera automaticamente
  if (!aisle || !position) {
    const lastLocation = await Location.findOne().sort({ code: -1 });
    const nextCode = generateNextCode(lastLocation?.code);
    const parsed = parseLocationCode(nextCode);
    
    return await Location.create({
      code: nextCode,
      aisle: parsed.aisle,
      position: parsed.position,
      level: parsed.level,
      zone,
      description
    });
  }
  
  // Se informar aisle/position, gera código correspondente
  const code = level > 1 ? `${aisle}${position}-${level}` : `${aisle}${position}`;
  
  return await Location.create({
    code,
    aisle,
    position,
    level: level || 1,
    zone,
    description
  });
}

/**
 * Cria múltiplas localizações em sequência
 * @param {Object} options - Opções de geração
 * @returns {Promise<Location[]>} Array de localizações criadas
 */
export async function createLocationSequence(options) {
  const { 
    startCode, 
    quantity, 
    maxPosition = 99, 
    zone, 
    descriptionTemplate = 'Localização {code}' 
  } = options;
  
  const codes = generateLocationSequence(startCode, quantity, maxPosition);
  const locations = [];
  
  for (const code of codes) {
    const parsed = parseLocationCode(code);
    const location = await Location.create({
      code,
      aisle: parsed.aisle,
      position: parsed.position,
      level: parsed.level,
      zone,
      description: descriptionTemplate.replace('{code}', code)
    });
    locations.push(location);
  }
  
  return locations;
}

/**
 * Busca localizações por corredor
 * @param {string} aisle - Código do corredor
 * @returns {Promise<Location[]>} Localizações do corredor
 */
export async function getLocationsByAisle(aisle) {
  return await Location.find({ aisle, isActive: true }).sort({ position: 1, level: 1 });
}

/**
 * Busca localizações por zona
 * @param {string} zone - Nome da zona
 * @returns {Promise<Location[]>} Localizações da zona
 */
export async function getLocationsByZone(zone) {
  return await Location.find({ zone, isActive: true }).sort({ aisle: 1, position: 1, level: 1 });
}

/**
 * Busca próxima localização disponível em um corredor
 * @param {string} aisle - Código do corredor
 * @param {number} level - Nível (opcional)
 * @returns {Promise<Location|null>} Próxima localização disponível
 */
export async function getNextAvailableLocation(aisle, level = 1) {
  const lastLocation = await Location.findOne({ 
    aisle, 
    level, 
    isActive: true 
  }).sort({ position: -1 });
  
  if (!lastLocation) {
    // Primeira posição do corredor
    const code = level > 1 ? `${aisle}1-${level}` : `${aisle}1`;
    return await Location.create({
      code,
      aisle,
      position: 1,
      level,
      isActive: true
    });
  }
  
  const nextCode = generateNextCode(lastLocation.code);
  const parsed = parseLocationCode(nextCode);
  
  return await Location.create({
    code: nextCode,
    aisle: parsed.aisle,
    position: parsed.position,
    level: parsed.level,
    isActive: true
  });
}

/**
 * Verifica se uma localização existe e está ativa
 * @param {string} locationCode - Código da localização
 * @returns {Promise<boolean>} True se existir e estiver ativa
 */
export async function isLocationAvailable(locationCode) {
  if (!isValidLocationCode(locationCode)) {
    return false;
  }
  
  const location = await Location.findOne({ 
    code: locationCode, 
    isActive: true 
  });
  
  return !!location;
}

/**
 * Ativa/Desativa uma localização
 * @param {string} locationId - ID da localização
 * @param {boolean} isActive - Status ativo
 * @returns {Promise<Location>} Localização atualizada
 */
export async function toggleLocationStatus(locationId, isActive) {
  return await Location.findByIdAndUpdate(
    locationId,
    { isActive },
    { new: true }
  );
}

/**
 * Busca localizações próximas
 * @param {string} locationCode - Código de referência
 * @param {number} radius - Raio de busca (quantidade de posições)
 * @returns {Promise<Location[]>} Localizações próximas
 */
export async function getNearbyLocations(locationCode, radius = 5) {
  if (!isValidLocationCode(locationCode)) {
    return [];
  }
  
  const parsed = parseLocationCode(locationCode);
  const startPosition = Math.max(1, parsed.position - radius);
  const endPosition = parsed.position + radius;
  
  return await Location.find({
    aisle: parsed.aisle,
    position: { $gte: startPosition, $lte: endPosition },
    level: parsed.level,
    isActive: true
  }).sort({ position: 1 });
}
