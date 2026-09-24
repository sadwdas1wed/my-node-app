const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'logs.txt');

/**
 * Форматирование текущей даты и времени
 * @returns {string}
 */
function getTimestamp() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
           `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

/**
 * Подписка на события сервера и запись их в файл logs.txt
 * @param {EventEmitter} app - экземпляр AppServer
 */
function setupLogger(app) {
    // Очищаем файл при старте (чтобы не копить мусор)
    fs.writeFileSync(LOG_FILE, '', 'utf8');

    const events = ['server:started', 'server:stopped', 'request:received'];

    events.forEach((eventName) => {
        app.on(eventName, (data) => {
            const logLine = `[${getTimestamp()}] ${eventName}: ${JSON.stringify(data)}\n`;
            
            // Асинхронная запись в файл
            fs.appendFile(LOG_FILE, logLine, 'utf8', (err) => {
                if (err) {
                    console.error('❌ Ошибка записи в лог:', err.message);
                }
            });
        });
    });

    console.log(`📝 Логгер активирован. Файл: ${LOG_FILE}`);
}

module.exports = { setupLogger };