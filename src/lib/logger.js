import log from 'loglevel';

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
    const response = await fetch('http://localhost:81/mdb/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, message })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
  } catch (error) {
    console.error('Failed to send log to server:', error);
  }
}

export default log;