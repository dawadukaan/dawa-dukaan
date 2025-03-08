// src/lib/config/logger.js
import env from './env';

const logger = {
  info: (message, ...args) => {
    if (env.app.isDev) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  
  error: (message, ...args) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  
  warn: (message, ...args) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  
  debug: (message, ...args) => {
    if (env.app.isDev) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
};

export default logger;