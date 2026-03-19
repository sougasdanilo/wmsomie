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
  
  // Retorna o código como está, sem tentar parsear formato específico
  return {
    code: code.trim(),
    raw: code.trim()
  };
}
