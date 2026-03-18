// src/services/omieClient.js
import axios from 'axios';
import { omieConfig } from '../config/omie.js';

export async function callOmie(endpoint, call, param = {}) {
  const payload = {
    call,
    app_key: omieConfig.appKey,
    app_secret: omieConfig.appSecret,
    param: [param],
  };

  const { data } = await axios.post(
    `${omieConfig.baseURL}${endpoint}`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  if (data.faultstring) throw new Error(data.faultstring);

  return data;
}