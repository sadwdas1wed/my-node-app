const http = require('http');
const { EventEmitter } = require('events');

// === ЗАМЕНИ НА СВОИ ДАННЫЕ ===
const STUDENT_NAME = "Твоё ФИО";
const STUDENT_GROUP = "Твоя группа";
const JOURNAL_NUMBER = 7; // для числа Пи в ЛР 11

/**
 * Вычисление числа Пи рядом Нилаканта
 * π = 3 + 4/(2·3·4) - 4/(4·5·6) + 4/(6·7·8) - ...
 */
function calculatePi(precision) {
    let pi = 3.0;
    let sign = 1;
    const iterations = 1000000;
    for (let i = 2; i < iterations; i += 2) {
        const term = 4 / (i * (i + 1) * (i + 2));
        pi += sign * term;
        sign *= -1;
    }
    return pi.toFixed(precision);
}

/**
 * Класс AppServer - HTTP-сервер с событийной моделью
 * Наследуется от EventEmitter
 */
class AppServer extends EventEmitter {
    constructor() {
        super();
        this.server = null;
    }

    /**
     * Запуск сервера на указанном порту
     * @param {number} port
     */
    start(port) {
        this.server = http.createServer((req, res) => {
            // Генерируем событие при каждом запросе
            this.emit('request:received', {
                method: req.method,
                url: req.url
            });

            // Обработка эндпоинта /order/<id>
            const orderMatch = req.url.match(/^\/order\/(\d+)$/);
            if (orderMatch && req.method === 'GET') {
                const orderId = orderMatch[1];
                res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(`Заказ #${orderId} запущен. Смотрите консоль.`);
                
                // Запускаем обработку заказа
                const handler = new OrderHandler();
                handler.on('order:start', (id) => {
                    console.log(`[order:start] Заказ #${id} начат`);
                });
                handler.on('order:processing', (msg) => {
                    console.log(`[order:processing] ${msg}`);
                });
                handler.on('order:complete', ({ id, sum, pi }) => {
                    console.log(`💰 Заказ #${id} завершён на сумму ${sum} руб. PI= ${pi}`);
                });
                handler.processOrder(orderId);
                return;
            }

            // Обычный ответ для всех остальных запросов
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <h1>Hello from Event-Driven Server!</h1>
                <p><strong>ФИО:</strong> ${STUDENT_NAME}</p>
                <p><strong>Группа:</strong> ${STUDENT_GROUP}</p>
                <p><strong>Число Пи (до ${JOURNAL_NUMBER} знака):</strong> ${calculatePi(JOURNAL_NUMBER)}</p>
                <p><em>Попробуйте: <a href="/order/42">/order/42</a></em>
            `);
        });

        this.server.listen(port, () => {
            this.emit('server:started', port);
        });
    }

    /**
     * Остановка сервера
     */
    stop() {
        if (this.server) {
            this.server.close(() => {
                this.emit('server:stopped');
            });
        }
    }
}

/**
 * Класс OrderHandler - обработка заказов через события и таймеры
 */
class OrderHandler extends EventEmitter {
    /**
     * Обработка заказа с эмуляцией асинхронности
     * @param {string|number} orderId
     */
    processOrder(orderId) {
        // 1. Старт заказа
        this.emit('order:start', orderId);

        // 2. Через 2 секунды - обработка
        setTimeout(() => {
            this.emit('order:processing', `Заказ #${orderId}: Идёт обработка...`);
        }, 2000);

        // 3. Ещё через 2 секунды (итого 4 сек) - завершение
        setTimeout(() => {
            const sum = Math.floor(Math.random() * 901) + 100; // от 100 до 1000
            const pi = calculatePi(7); // до 7 знаков, как требует задание
            this.emit('order:complete', { id: orderId, sum, pi });
        }, 4000);
    }
}

// === ЗАПУСК СЕРВЕРА ===
const app = new AppServer();

// Регистрируем обработчики событий сервера
app.on('server:started', (port) => {
    console.log(`🚀 Сервер запущен на порту ${port}`);
});

app.on('request:received', ({ method, url }) => {
    console.log(`📨 Получен запрос: ${method} ${url}`);
});

app.on('server:stopped', () => {
    console.log(`🛑 Сервер остановлен`);
});

// Подключаем логгер (если файл logger.js существует)
try {
    const logger = require('./logger');
    logger.setupLogger(app);
} catch (e) {
    console.log('⚠️  Логгер не подключён (logger.js не найден)');
}

app.start(3000);

// Эмуляция остановки через 60 секунд (чтобы успеть протестировать)
setTimeout(() => {
    app.stop();
}, 60000);