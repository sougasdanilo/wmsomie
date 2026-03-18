// scripts/debug-credentials.js
import dotenv from 'dotenv';
import { omieConfig } from '../config/omie.js';
dotenv.config();

async function debugCredentials() {
  console.log('🔍 Debug das Credenciais\n');
  
  console.log('📋 Variáveis de ambiente:');
  console.log(`OMIE_APP_KEY: ${process.env.OMIE_APP_KEY ? process.env.OMIE_APP_KEY.substring(0, 10) + '...' : 'NÃO DEFINIDA'}`);
  console.log(`OMIE_APP_SECRET: ${process.env.OMIE_APP_SECRET ? process.env.OMIE_APP_SECRET.substring(0, 10) + '...' : 'NÃO DEFINIDA'}`);
  console.log('');
  
  console.log('📋 Config omieConfig:');
  console.log(`appKey: ${omieConfig.appKey ? omieConfig.appKey.substring(0, 10) + '...' : 'NÃO DEFINIDA'}`);
  console.log(`appSecret: ${omieConfig.appSecret ? omieConfig.appSecret.substring(0, 10) + '...' : 'NÃO DEFINIDA'}`);
  console.log('');
  
  console.log('📋 Comprimento das credenciais:');
  console.log(`OMIE_APP_KEY length: ${process.env.OMIE_APP_KEY?.length || 0}`);
  console.log(`OMIE_APP_SECRET length: ${process.env.OMIE_APP_SECRET?.length || 0}`);
  console.log(`omieConfig.appKey length: ${omieConfig.appKey?.length || 0}`);
  console.log(`omieConfig.appSecret length: ${omieConfig.appSecret?.length || 0}`);
  console.log('');
  
  // Teste direto com as variáveis de ambiente
  console.log('🧪 Teste direto com variáveis de ambiente...');
  
  try {
    const axios = await import('axios');
    
    const payload = {
      call: "ListarProdutos",
      param: [{
        pagina: 1,
        registros_por_pagina: 10,
        apenas_importado_api: "N",
        filtrar_apenas_omiepdv: "N"
      }],
      app_key: process.env.OMIE_APP_KEY,
      app_secret: process.env.OMIE_APP_SECRET
    };

    const { data } = await axios.default.post(
      'https://app.omie.com.br/api/v1/geral/produtos/',
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ SUCESSO com variáveis de ambiente!');
    console.log('📊 Produtos:', data.produto_servico_cadastro?.length || 0);
    
  } catch (error) {
    console.error('❌ Erro com variáveis de ambiente:', error.response?.status);
    
    // Teste com omieConfig
    console.log('\n🧪 Teste com omieConfig...');
    
    try {
      const payload2 = {
        call: "ListarProdutos",
        param: [{
          pagina: 1,
          registros_por_pagina: 10,
          apenas_importado_api: "N",
          filtrar_apenas_omiepdv: "N"
        }],
        app_key: omieConfig.appKey,
        app_secret: omieConfig.appSecret
      };

      const { data: data2 } = await axios.default.post(
        'https://app.omie.com.br/api/v1/geral/produtos/',
        payload2,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ SUCESSO com omieConfig!');
      console.log('📊 Produtos:', data2.produto_servico_cadastro?.length || 0);
      
    } catch (error2) {
      console.error('❌ Erro com omieConfig:', error2.response?.status);
    }
  }
}

debugCredentials();
