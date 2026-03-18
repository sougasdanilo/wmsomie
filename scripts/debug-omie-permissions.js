// scripts/debug-omie-permissions.js
import dotenv from 'dotenv';
import { callOmie } from '../services/omieClient.js';

dotenv.config();

async function debugOmiePermissions() {
  console.log('🔍 Debug de Permissões do Omie\n');
  
  console.log('📋 Credenciais atuais:');
  console.log(`OMIE_APP_KEY: ${process.env.OMIE_APP_KEY?.substring(0, 10)}...`);
  console.log(`OMIE_APP_SECRET: ${process.env.OMIE_APP_SECRET?.substring(0, 10)}...`);
  console.log('');

  // Testar com diferentes endpoints para identificar qual tem permissão
  const endpoints = [
    {
      name: 'Produtos (Listar)',
      endpoint: 'geral/produtos/',
      call: 'ListarProdutos',
      params: { pagina: 1, registros_por_pagina: 1 }
    },
    {
      name: 'Clientes (Listar)',
      endpoint: 'geral/clientes/',
      call: 'ListarClientes',
      params: { pagina: 1, registros_por_pagina: 1 }
    },
    {
      name: 'Locais Estoque (Listar)',
      endpoint: 'estoque/local/',
      call: 'ListarLocaisEstoque',
      params: {}
    },
    {
      name: 'Estoque (Consultar)',
      endpoint: 'estoque/consulta/',
      call: 'ConsultarEstoque',
      params: { codigo_produto: '1' } // Teste com ID genérico
    },
    {
      name: 'Empresas (Listar)',
      endpoint: 'geral/empresas/',
      call: 'ListarEmpresas',
      params: {}
    }
  ];

  console.log('🧪 Testando permissões por endpoint:\n');

  for (const test of endpoints) {
    try {
      console.log(`📡 Testando: ${test.name}`);
      const result = await callOmie(test.endpoint, test.call, test.params);
      console.log(`✅ ${test.name}: PERMITIDO`);
      
      // Verificar se há dados
      if (result && typeof result === 'object') {
        const keys = Object.keys(result);
        const hasData = keys.some(key => {
          const value = result[key];
          return Array.isArray(value) ? value.length > 0 : value != null;
        });
        console.log(`   📊 Dados encontrados: ${hasData ? 'Sim' : 'Não'}`);
        console.log(`   🔑 Chaves: ${keys.join(', ')}`);
      }
      
    } catch (error) {
      if (error.response?.status === 403) {
        console.log(`❌ ${test.name}: SEM PERMISSÃO (403)`);
      } else if (error.response?.status === 401) {
        console.log(`❌ ${test.name}: NÃO AUTORIZADO (401) - Credenciais inválidas`);
      } else {
        console.log(`⚠️ ${test.name}: ERRO ${error.response?.status || 'DESCONHECIDO'}`);
        console.log(`   Detalhes: ${error.message}`);
      }
    }
    console.log('');
  }

  console.log('🔧 Recomendações:\n');
  console.log('1. Se todos derem 403: App não tem permissões suficientes');
  console.log('2. Se alguns derem 403 e outros 200: Permissões parciais');
  console.log('3. Se todos derem 401: Credenciais completamente inválidas');
  console.log('4. Se derem 200 mas sem dados: Omie vazio ou filtros incorretos');
  
  console.log('\n📖 Para corrigir:');
  console.log('1. Acesse: https://developer.omie.com.br/my-apps/');
  console.log('2. Verifique as permissões do seu app');
  console.log('3. Solicite acesso aos módulos necessários:');
  console.log('   - Produtos/Serviços');
  console.log('   - Estoque');
  console.log('   - Financeiro (se necessário)');
  console.log('4. Reative o app se necessário');
}

debugOmiePermissions().catch(console.error);
