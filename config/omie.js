// src/config/omie.js
import dotenv from 'dotenv';
dotenv.config();

export const omieConfig = {
  appKey: process.env.OMIE_APP_KEY,
  appSecret: process.env.OMIE_APP_SECRET,
  baseURL: 'https://app.omie.com.br/api/v1/',
};