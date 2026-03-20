// src/utils/locationGenerator.js
// Utilitário simplificado para validação de endereços de armazém

/**
 * Valida se um código de endereço está no formato correto
 * @param {string} code - Código a validar
 * @returns {boolean} True se válido
 */
export function isValidLocationCode(code) {
  return typeof code === 'string' && code.trim().length > 0;
}

/**
 * Extrai componentes de um código de endereço (formato flexível)
 * @param {string} code - Código do endereço
 * @returns {object} Objeto com componentes extraídos
 */
export function parseLocationCode(code) {
  if (!code || typeof code !== 'string') {
    throw new Error('Invalid location code format');
  }
  
  const trimmed = code.trim().toUpperCase();
  
  // Padrões comuns de armazém:
  // A1, A2, B1, B2 (corredor + posição)
  // AA1, AA2, AB1, AB2 (corredor duplo + posição)
  // RACK-01-POS-A, RACK-01-POS-B
  // PISO1-A1, PISO1-A2
  // 1-A-01, 2-B-03 (zona + corredor + posição)
  
  // Regex para extrair componentes
  const patterns = [
    // Formato: AA1, AB2, CD3 (letras + números)
    /^([A-Z]+)(\d+)$/,
    // Formato: RACK-01-POS-A
    /^.*?(\d+).*?([A-Z]+).*?(\d+)$/,
    // Formato: PISO1-A1
    /^(\d+)-([A-Z]+)(\d+)$/,
    // Formato: 1-A-01
    /^(\d+)-([A-Z]+)-(\d+)$/
  ];
  
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) {
      if (match.length === 3) {
        // Formato simples: letras + números
        return {
          aisle: match[1], // letras do corredor
          position: parseInt(match[2]), // posição numérica
          level: 0, // nível padrão
          code: trimmed,
          raw: code.trim()
        };
      } else if (match.length === 4) {
        // Formato complexo: zona + corredor + posição
        return {
          zone: match[1],
          aisle: match[2],
          position: parseInt(match[3]),
          level: 0,
          code: trimmed,
          raw: code.trim()
        };
      }
    }
  }
  
  // Fallback: tratar tudo como um único código
  return {
    aisle: trimmed,
    position: 0,
    level: 0,
    code: trimmed,
    raw: code.trim()
  };
}
