import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Iniciando WMS Omie - Produção...');

// Build frontend primeiro
const build = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true,
  cwd: join(__dirname, 'ui')
});

build.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Falha no build do frontend');
    process.exit(code);
  }

  console.log('✅ Build do frontend concluído');
  
  // Iniciar backend em produção
  const backend = spawn('npm', ['start'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando backend...');
    backend.kill('SIGINT');
    process.exit(0);
  });

  backend.on('close', (code) => {
    console.log(`Backend encerrado com código ${code}`);
    process.exit(code);
  });

  console.log('✅ Backend iniciado em produção!');
  console.log('📦 Backend: http://localhost:3000');
});
