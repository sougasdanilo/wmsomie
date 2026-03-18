// scripts/check-env.js
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Carregar variáveis de ambiente
dotenv.config();

console.log('🔍 Verificação de Configuração do Ambiente\n');

// Verificar arquivo .env
const envPath = path.join(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);

console.log('📁 Arquivo .env:', envExists ? '✅ Existe' : '❌ Não encontrado');

if (envExists) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    console.log('\n📋 Variáveis configuradas:');
    lines.forEach(line => {
      const [key] = line.split('=');
      if (key) {
        const value = process.env[key];
        console.log(`  ${key}: ${value ? '✅ Configurada' : '❌ Vazia'}`);
      }
    });
  } catch (error) {
    console.log('❌ Erro ao ler .env:', error.message);
  }
} else {
  console.log('\n🔧 Para criar o arquivo .env, execute:');
  console.log('cp .env.example .env');
  console.log('\nDepois edite o arquivo .env com suas credenciais do Omie.');
}

// Verificar variáveis específicas do Omie
console.log('\n🔑 Credenciais Omie:');
console.log(`OMIE_APP_KEY: ${process.env.OMIE_APP_KEY ? '✅' : '❌'}`);
console.log(`OMIE_APP_SECRET: ${process.env.OMIE_APP_SECRET ? '✅' : '❌'}`);

// Verificar outras variáveis importantes
console.log('\n🌐 Outras configurações:');
console.log(`PORT: ${process.env.PORT || '3000'}`);
console.log(`MONGO_URI: ${process.env.MONGO_URI || 'mongodb://localhost:27017/wmsomie'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

if (!process.env.OMIE_APP_KEY || !process.env.OMIE_APP_SECRET) {
  console.log('\n❌ Credenciais do Omie não configuradas!');
  console.log('\n📖 Como obter as credenciais:');
  console.log('1. Acesse: https://developer.omie.com.br/my-apps/');
  console.log('2. Crie um novo aplicativo ou use um existente');
  console.log('3. Copie a App Key e App Secret');
  console.log('4. Adicione ao seu arquivo .env:');
  console.log('   OMIE_APP_KEY=sua_app_key_aqui');
  console.log('   OMIE_APP_SECRET=sua_app_secret_aqui');
  
  if (!envExists) {
    console.log('\n🔧 Criando arquivo .env a partir do exemplo...');
    try {
      fs.copyFileSync(path.join(process.cwd(), '.env.example'), envPath);
      console.log('✅ Arquivo .env criado! Edite-o com suas credenciais.');
    } catch (error) {
      console.log('❌ Erro ao criar .env:', error.message);
    }
  }
} else {
  console.log('\n✅ Credenciais do Omie configuradas!');
  console.log('🚀 Você pode testar a conexão com: node scripts/test-omie-connection.js');
}
