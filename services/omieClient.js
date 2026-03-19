// src/services/omieClient.js
import axios from 'axios';
import { omieConfig } from '../config/omie.js';

const axiosInstance = axios.create({
  timeout: omieConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'WMS-Omie-Integration/1.0'
  }
});

export async function callOmie(endpoint, call, param = {}) {
  if (!omieConfig.appKey || !omieConfig.appSecret) {
    throw new Error('Omie credentials not configured');
  }

  const payload = {
    call,
    app_key: omieConfig.appKey,
    app_secret: omieConfig.appSecret,
    param: [param],
  };

  try {
    const { data } = await axiosInstance.post(
      `${omieConfig.baseURL}${endpoint}`,
      payload
    );

    if (data.faultstring) {
      throw new Error(`Omie API Error: ${data.faultstring}`);
    }

    if (data.status && data.status !== 'OK') {
      throw new Error(`Omie API Status: ${data.status}`);
    }

    return data;
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.faultstring || error.response.data?.message || 'Unknown API error';
      throw new Error(`Omie API Error (${status}): ${message}`);
    } else if (error.request) {
      throw new Error('Omie API: No response received');
    } else {
      throw error;
    }
  }
}