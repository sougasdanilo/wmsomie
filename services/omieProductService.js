// src/services/omieProductService.js
import Product from '../models/Product.js';
import { callOmie } from './omieClient.js';

export async function syncProducts() {
  const response = await callOmie(
    'geral/produtos/',
    'ListarProdutos',
    { pagina: 1, registros_por_pagina: 50 }
  );

  const produtos = response.produtos_cadastro || [];

  for (const p of produtos) {
    await Product.findOneAndUpdate(
      { omieId: p.codigo_produto },
      {
        name: p.descricao,
        sku: p.codigo,
        omieId: p.codigo_produto,
      },
      { upsert: true, new: true }
    );
  }

  return produtos.length;
}