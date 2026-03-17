import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Iniciando WMS Omie - Backend e Frontend...');

// Iniciar backend
const backend = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

// Iniciar frontend
const frontend = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: join(__dirname, 'ui')
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando serviços...');
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit(0);
});

// Handle process exit
backend.on('close', (code) => {
  console.log(`Backend encerrado com código ${code}`);
  frontend.kill('SIGINT');
  process.exit(code);
});

frontend.on('close', (code) => {
  console.log(`Frontend encerrado com código ${code}`);
  backend.kill('SIGINT');
  process.exit(code);
});

console.log('✅ Serviços iniciados!');
console.log('📦 Backend: http://localhost:3000');
console.log('🌐 Frontend: http://localhost:5173 (ou porta configurada no Vite)');
