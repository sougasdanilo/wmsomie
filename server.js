// server.js (UPDATE)
import app from './app.js';
import { startSyncJobs } from './jobs/syncJob.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`WMS running on port ${PORT}`);
  startSyncJobs(); // inicia sync automático
});