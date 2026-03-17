// src/services/omieService.js
import axios from 'axios';

const OMIE_URL = 'https://app.omie.com.br/api/v1/';

export async function sendStockToOmie(data) {
  // TODO: mapear payload conforme API Omie
  return axios.post(`${OMIE_URL}/estoque/`, data);
}