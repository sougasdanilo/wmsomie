import { spawn } from 'child_process';

console.log('🛑 Encerrando serviços WMS Omie...');

// Matar processos nas portas 3000 e 5173
const killPort = (port) => {
  return spawn('powershell', ['-Command', `Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object OwningProcess | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`], {
    stdio: 'inherit',
    shell: true
  });
};

killPort(3000);
killPort(5173);

setTimeout(() => {
  console.log('✅ Serviços encerrados!');
}, 2000);
