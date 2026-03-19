// src/utils/locationGenerator.js
// Utilitário para geração sequencial de endereços de armazém

/**
 * Gera o próximo código de endereço sequencial
 * @param {string} currentCode - Código atual (ex: AA1, AA2, AB1)
 * @param {number} maxPosition - Máxima posição por corredor (padrão: 99)
 * @returns {string} Próximo código sequencial
 */
export function generateNextCode(currentCode, maxPosition = 99) {
  if (!currentCode) return 'AA1';
  
  const match = currentCode.match(/^([A-Z]+)(\d+)(?:-(\d+))?$/);
  if (!match) throw new Error('Invalid location code format');
  
  let [, aisle, position, level] = match;
  position = parseInt(position);
  level = level ? parseInt(level) : 1;
  
  // Incrementar posição
  position++;
  
  // Se exceder a máxima posição, avançar para o próximo corredor
  if (position > maxPosition) {
    position = 1;
    aisle = incrementAisle(aisle);
  }
  
  return level > 1 ? `${aisle}${position}-${level}` : `${aisle}${position}`;
}

/**
 * Incrementa o código do corredor (AA -> AB -> AC... -> AZ -> BA -> BB...)
 * @param {string} aisle - Código do corredor atual
 * @returns {string} Próximo código do corredor
 */
function incrementAisle(aisle) {
  const chars = aisle.split('');
  let i = chars.length - 1;
  
  while (i >= 0) {
    if (chars[i] === 'Z') {
      chars[i] = 'A';
      i--;
    } else {
      chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1);
      break;
    }
  }
  
  if (i < 0) {
    chars.unshift('A');
  }
  
  return chars.join('');
}

/**
 * Gera uma sequência de códigos de endereço
 * @param {string} startCode - Código inicial
 * @param {number} quantity - Quantidade de códigos a gerar
 * @param {number} maxPosition - Máxima posição por corredor
 * @returns {string[]} Array com códigos gerados
 */
export function generateLocationSequence(startCode, quantity, maxPosition = 99) {
  const codes = [];
  let currentCode = startCode || 'AA1';
  
  for (let i = 0; i < quantity; i++) {
    codes.push(currentCode);
    currentCode = generateNextCode(currentCode, maxPosition);
  }
  
  return codes;
}

/**
 * Valida se um código de endereço está no formato correto
 * @param {string} code - Código a validar
 * @returns {boolean} True se válido
 */
export function isValidLocationCode(code) {
  return /^[A-Z]+[0-9]+(?:-[0-9]+)?$/.test(code);
}

/**
 * Extrai componentes de um código de endereço
 * @param {string} code - Código do endereço
 * @returns {object} Objeto com aisle, position e level
 */
export function parseLocationCode(code) {
  const match = code.match(/^([A-Z]+)(\d+)(?:-(\d+))?$/);
  if (!match) throw new Error('Invalid location code format');
  
  return {
    aisle: match[1],
    position: parseInt(match[2]),
    level: match[3] ? parseInt(match[3]) : 1
  };
}
