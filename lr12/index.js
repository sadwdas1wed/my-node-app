const http = require('http');
const { EventEmitter } = require('events');
const logger = require('./logger');

// ============================================================
// Задание 1: Класс AppServer с событиями
// ============================================================
class AppServer extends EventEmitter {
  constructor() {
    super();
    this.server = null;
  }

  start(port) {
    this.server = http.createServer((req, res) => {
      this.emit('request:received', { url: req.url, method: req.method });

      // Задание 3: обработка заказов
      if (req.url.startsWith('/order/')) {
        const orderId = req.url.split('/order/')[1];
        orderHandler.processOrder(orderId);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(`Order #${orderId} processing started`);
      } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Hello from Event-Driven Server!');
      }
    });

    this.server.listen(port, () => {
      this.emit('server:started', port);
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
      this.emit('server:stopped');
    }
  }
}

// ============================================================
// Задание 3: Класс OrderHandler с таймерами
// ============================================================
class OrderHandler extends EventEmitter {
  constructor() {
    super();
    this.on('order:start', (orderId) => {
      console.log(`[order:start] Заказ #${orderId} начат`);
    });

    this.on('order:processing', (orderId) => {
      console.log(`[order:processing] Заказ #${orderId}: Идёт обработка...`);
    });

    this.on('order:complete', (orderId, sum) => {
      // Вычисляем PI по формуле Лейбница с точностью до 7 знаков
      let pi = 0;
      for (let i = 0; i < 10000000; i++) {
        pi += (i % 2 === 0 ? 1 : -1) / (2 * i + 1);
      }
      pi *= 4;
      console.log(`[order:complete] Заказ #${orderId} завершён на сумму ${sum} руб. PI= ${pi.toFixed(7)}`);
    });
  }

  processOrder(orderId) {
    this.emit('order:start', orderId);

    setTimeout(() => {
      this.emit('order:processing', orderId);

      setTimeout(() => {
        const sum = Math.floor(Math.random() * 901) + 100;
        this.emit('order:complete', orderId, sum);
      }, 2000);
    }, 2000);
  }
}

// ============================================================
// Инициализация (ОДИН раз!)
// ============================================================
const app = new AppServer();
const orderHandler = new OrderHandler();

// Обработчики для вывода в консоль (Задание 1)
app.on('server:started', (port) => {
  console.log(`🚀 Сервер запущен на порту ${port}`);
});

app.on('request:received', (data) => {
  console.log(`📨 Получен запрос: ${data.method} ${data.url}`);
});

app.on('server:stopped', () => {
  console.log(`🛑 Сервер остановлен`);
});

// Подключаем логгер (Задание 2)
logger.setupLogger(app);

// Запускаем сервер
app.start(3000);

// Автоматическая остановка через 30 секунд
setTimeout(() => {
  app.stop();
}, 30000);