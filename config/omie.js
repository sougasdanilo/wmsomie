// src/config/omie.js
import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = ['OMIE_APP_KEY', 'OMIE_APP_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const omieConfig = {
  appKey: process.env.OMIE_APP_KEY,
  appSecret: process.env.OMIE_APP_SECRET,
  baseURL: process.env.OMIE_BASE_URL || 'https://app.omie.com.br/api/v1/',
  timeout: parseInt(process.env.OMIE_TIMEOUT) || 30000,
};