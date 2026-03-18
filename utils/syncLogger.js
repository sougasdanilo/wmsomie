// src/utils/syncLogger.js
import fs from 'fs';
import path from 'path';

class SyncLogger {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDir();
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getLogFile(type = 'sync') {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `${type}-${date}.log`);
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };

    // Log to console
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
    if (data) {
      console.log('Data:', JSON.stringify(data, null, 2));
    }

    // Log to file
    const logFile = this.getLogFile();
    const logLine = JSON.stringify(logEntry) + '\n';
    
    try {
      fs.appendFileSync(logFile, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  info(message, data = null) {
    this.log('info', message, data);
  }

  warn(message, data = null) {
    this.log('warn', message, data);
  }

  error(message, data = null) {
    this.log('error', message, data);
  }

  debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, data);
    }
  }

  logSyncResult(operation, result) {
    this.info(`Sync operation completed: ${operation}`, {
      syncedCount: result.syncedCount,
      errorsCount: result.errors?.length || 0,
      errors: result.errors || []
    });
  }

  logApiCall(method, endpoint, params, result, error = null) {
    if (error) {
      this.error(`API call failed: ${method} ${endpoint}`, {
        params,
        error: error.message
      });
    } else {
      this.debug(`API call success: ${method} ${endpoint}`, {
        params,
        result
      });
    }
  }

  logMovementSync(movement, action, error = null) {
    const logData = {
      movementId: movement._id,
      type: movement.type,
      product: movement.product,
      quantity: movement.quantity,
      action
    };

    if (error) {
      logData.error = error.message;
      this.error(`Movement sync failed: ${action}`, logData);
    } else {
      this.info(`Movement sync success: ${action}`, logData);
    }
  }

  logStockSync(product, action, quantity, error = null) {
    const logData = {
      productId: product._id,
      sku: product.sku,
      omieId: product.omieId,
      quantity,
      action
    };

    if (error) {
      logData.error = error.message;
      this.error(`Stock sync failed: ${action}`, logData);
    } else {
      this.info(`Stock sync success: ${action}`, logData);
    }
  }

  // Get recent logs for monitoring
  getRecentLogs(lines = 100) {
    try {
      const logFile = this.getLogFile();
      if (!fs.existsSync(logFile)) {
        return [];
      }

      const content = fs.readFileSync(logFile, 'utf8');
      const logLines = content.trim().split('\n').filter(line => line);
      
      return logLines
        .slice(-lines)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return { timestamp: null, level: 'error', message: 'Invalid log format', raw: line };
          }
        });
    } catch (error) {
      this.error('Failed to read logs', { error: error.message });
      return [];
    }
  }

  // Clean old log files (older than 30 days)
  cleanOldLogs() {
    try {
      const files = fs.readdirSync(this.logDir);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < thirtyDaysAgo) {
          fs.unlinkSync(filePath);
          this.info(`Cleaned old log file: ${file}`);
        }
      });
    } catch (error) {
      this.error('Failed to clean old logs', { error: error.message });
    }
  }
}

export default new SyncLogger();
