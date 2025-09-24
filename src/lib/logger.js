import log from 'loglevel';

import { log as logApi, setCsrfCookie } from '$lib/api';

// Set the default logging level
log.setLevel("debug");

let csrfInitialized = false;
let csrfInitializing = false;

const originalFactory = log.methodFactory;
log.methodFactory = function (methodName, logLevel, loggerName) {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);
  
  return function (message) {
    const formattedMessage = `${new Date().toISOString()} [${methodName.toUpperCase()}]: ${message}`;
    rawMethod(formattedMessage);
    
    // Send logs to server for levels warning and above
    if (logLevel <= 2) { // warning, error, critical
      sendLogToServer(methodName.toUpperCase(), formattedMessage);
    }
  };
};

log.setLevel(log.getLevel());

async function ensureCsrfToken() {
  if (csrfInitialized || csrfInitializing) {
    return;
  }
  
  csrfInitializing = true;
  try {
    await setCsrfCookie();
    csrfInitialized = true;
  } catch (error) {
    console.warn('Failed to initialize CSRF cookie for logging:', error);
  } finally {
    csrfInitializing = false;
  }
}

async function sendLogToServer(level, message) {
  try {
    // Ensure CSRF token is available before sending logs
    if (!csrfInitialized) {
      await ensureCsrfToken();
    }
    
    await logApi(level, message);
  } catch (error) {
    if (!error.message.includes('403') && !error.message.includes('CSRF')) {
      console.error('Failed to send log to server:', error);
    } else {
      console.warn('Log API unavailable (authentication required)');
    }
  }
}

export default log;