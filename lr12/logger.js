const fs = require('fs');

function setupLogger(app) {
  app.on('server:started', (port) => {
    const log = `[${new Date().toISOString()}] server:started: Порт ${port}\n`;
    fs.appendFile('logs.txt', log, (err) => {
      if (err) console.error('Error writing log:', err);
    });
  });

  app.on('request:received', (data) => {
    const log = `[${new Date().toISOString()}] request:received: ${data.method} ${data.url}\n`;
    fs.appendFile('logs.txt', log, (err) => {
      if (err) console.error('Error writing log:', err);
    });
  });

  app.on('server:stopped', () => {
    const log = `[${new Date().toISOString()}] server:stopped: Сервер остановлен\n`;
    fs.appendFile('logs.txt', log, (err) => {
      if (err) console.error('Error writing log:', err);
    });
  });
}

module.exports = { setupLogger };