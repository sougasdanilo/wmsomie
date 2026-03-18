// scripts/debug-request.js
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

async function debugRequest() {
  console.log('🔍 Debug detalhado da requisição...\n');
  
  const payload = {
    call: "ListarProdutos",
    param: [{
      pagina: 1,
      registros_por_pagina: 50,
      apenas_importado_api: "N",
      filtrar_apenas_omiepdv: "N"
    }],
    app_key: process.env.OMIE_APP_KEY,
    app_secret: process.env.OMIE_APP_SECRET
  };

  console.log('📋 Payload JSON:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('');

  console.log('📋 Payload stringificado:');
  const payloadString = JSON.stringify(payload);
  console.log(payloadString);
  console.log('');

  console.log('📋 Headers:');
  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Content-Length': Buffer.byteLength(payloadString, 'utf8')
  };
  console.log(JSON.stringify(headers, null, 2));
  console.log('');

  console.log('📋 URL completa:');
  const url = 'https://app.omie.com.br/api/v1/geral/produtos/';
  console.log(url);
  console.log('');

  try {
    console.log('🚀 Enviando requisição...');
    
    const response = await axios.post(url, payload, { headers });
    
    console.log('✅ SUCESSO!');
    console.log('Status:', response.status);
    console.log('Headers resposta:', JSON.stringify(response.headers, null, 2));
    console.log('Dados:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ ERRO DETALHADO:');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Headers resposta:', JSON.stringify(error.response?.headers, null, 2));
    console.log('Dados erro:', error.response?.data);
    
    // Tentativa com diferentes encoding
    console.log('\n🔄 Tentando com encoding diferente...');
    
    try {
      const response2 = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ SUCESSO com encoding simplificado!');
      console.log('Produtos:', response2.data.produto_servico_cadastro?.length || 0);
      
    } catch (error2) {
      console.log('❌ Falha também com encoding simplificado');
    }
  }
}

debugRequest();
