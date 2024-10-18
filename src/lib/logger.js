import log from 'loglevel';

import { log as logApi } from '$lib/api';

// Set the default logging level
log.setLevel("debug");

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

async function sendLogToServer(level, message) {
  try {
    await logApi(level, message);
  } catch (error) {
    console.error('Failed to send log to server:', error);
  }
}

export default log;