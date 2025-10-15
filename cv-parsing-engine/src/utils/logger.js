/**
 * Logger Utility
 * Centralized logging for CV Parsing Engine
 */

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class Logger {
  constructor() {
    this.logFile = path.join(logsDir, `cv-parsing-${new Date().toISOString().split('T')[0]}.log`);
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaStr}`;
  }

  writeToFile(message) {
    fs.appendFileSync(this.logFile, message + '\n');
  }

  info(message, meta = {}) {
    const formatted = this.formatMessage('info', message, meta);
    console.log('ℹ️ ', formatted);
    this.writeToFile(formatted);
  }

  error(message, meta = {}) {
    const formatted = this.formatMessage('error', message, meta);
    console.error('❌', formatted);
    this.writeToFile(formatted);
  }

  warn(message, meta = {}) {
    const formatted = this.formatMessage('warn', message, meta);
    console.warn('⚠️ ', formatted);
    this.writeToFile(formatted);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      const formatted = this.formatMessage('debug', message, meta);
      console.log('🐛', formatted);
      this.writeToFile(formatted);
    }
  }
}

const logger = new Logger();

module.exports = { logger };