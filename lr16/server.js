// ============================================================
// Лабораторная работа №16: Express.js Server
// Группа: 477
// ============================================================

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const NodeCache = require('node-cache');
const { stringify } = require('csv-stringify/sync');
const multer = require('multer');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'bbmo-01-23-secret-key-2024';

// Middleware для парсинга JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Кэш для GET-запросов (5 минут)
const cache = new NodeCache({ stdTTL: 300 });

// ============================================================
// ЗАДАНИЕ 3: Middleware логирования
// ============================================================
app.use((req, res, next) => {
  const start = Date.now();
  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - start;
    const now = new Date().toLocaleString('ru-RU', { hour12: false });
    console.log(`[${now}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    originalEnd.apply(this, args);
  };
  next();
});

// ============================================================
// ЗАДАНИЕ 3: Middleware ограничения скорости (Rate Limiter)
// ============================================================
const rateLimitStore = new Map();
const RATE_LIMIT = 100; // запросов в минуту
const RATE_WINDOW = 60000; // 1 минута

app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  
  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, { count: 1, startTime: now });
    return next();
  }
  
  const record = rateLimitStore.get(ip);
  if (now - record.startTime > RATE_WINDOW) {
    record.count = 1;
    record.startTime = now;
    return next();
  }
  
  record.count++;
  res.set('X-RateLimit-Limit', RATE_LIMIT);
  res.set('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT - record.count));
  
  if (record.count > RATE_LIMIT) {
    return res.status(429).json({ 
      error: 'Too Many Requests', 
      status: 429,
      retryAfter: Math.ceil((RATE_WINDOW - (now - record.startTime)) / 1000)
    });
  }
  
  next();
});

// ============================================================
// ЗАДАНИЕ 3: Middleware обработки ошибок
// ============================================================
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(err.status || 500).json({
    error: err.message || 'Внутренняя ошибка сервера',
    status: err.status || 500
  });
});

// ============================================================
// ЗАДАНИЕ 1: Базовые маршруты
// ============================================================
app.get('/', (req, res) => {
  const now = new Date().toLocaleString('ru-RU');
  res.type('html').send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <title>Лабораторная работа №16</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; border-bottom: 2px solid #e74c3c; padding-bottom: 10px; }
        .info { background: #ecf0f1; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .routes { background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px; }
        .routes a { display: block; margin: 5px 0; color: #e74c3c; text-decoration: none; }
        .routes a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Лабораторная работа №16</h1>
        <div class="info">
          <p><strong>Группа:</strong> 477</p>
          <p><strong>Дата и время:</strong> ${now}</p>
          <p><strong>Фреймворк:</strong> Express.js</p>
        </div>
        <p style="color: #27ae60; font-size: 1.2em;">👋 Добро пожаловать на сервер Express.js!</p>
        <div class="routes">
          <strong> Доступные маршруты:</strong>
          <a href="/">/ — Главная страница</a>
          <a href="/about">/about — О разработчике</a>
          <a href="/contacts">/contacts — Контакты</a>
          <a href="/api/books">/api/books — API книг (GET)</a>
          <a href="/api-docs">/api-docs — Swagger документация</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get('/about', (req, res) => {
  res.type('html').send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head><meta charset="UTF-8"><title>О разработчике</title></head>
    <body style="font-family: Arial; max-width: 700px; margin: 40px auto; padding: 20px;">
      <h1>О разработчике</h1>
      <div style="background: #ecf0f1; padding: 20px; border-radius: 8px;">
        <p><strong>Группа:</strong> 477</p>
        <p><strong>Лабораторная работа:</strong> №16</p>
        <p><strong>Тема:</strong> Исследование методов создания простого сервера с использованием Express.js</p>
        <p><strong>Технологии:</strong> Node.js, Express.js, JWT, Swagger, Joi</p>
      </div>
    </body>
    </html>
  `);
});

app.get('/contacts', (req, res) => {
  res.type('html').send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head><meta charset="UTF-8"><title>Контакты</title></head>
    <body style="font-family: Arial; max-width: 700px; margin: 40px auto; padding: 20px;">
      <h1>Контактная информация</h1>
      <div style="background: #ecf0f1; padding: 20px; border-radius: 8px;">
        <p><strong>Email:</strong> ruslankartuzov722@gmail.com</p>
        <p><strong>GitHub:</strong> github.com/sadwdas1wed</p>
        <p><strong>Группа:</strong> 477</p>
      </div>
    </body>
    </html>
  `);
});

// ============================================================
// ЗАДАНИЕ 5: Генерация 100 книг на основе номера группы
// ============================================================
const TITLES = [
  'Война и мир', 'Преступление и наказание', 'Мастер и Маргарита', '1984',
  'Гарри Поттер', 'Анна Каренина', 'Братья Карамазовы', 'Отцы и дети',
  'Идиот', 'Бесы', 'Тихий Дон', 'Доктор Живаго', 'Евгений Онегин',
  'Мертвые души', 'Ревизор', 'Горе от ума', 'Вишневый сад', 'Чайка',
  'Три сестры', 'Дядя Ваня', 'На дне', 'Вишневый сад', 'Палата №6',
  'Дама с собачкой', 'Ионыч', 'Человек в футляре', 'Крыжовник',
  'О любви', 'Студент', 'Архиерей', 'Невеста', 'Степь', 'Скучная история',
  'Дуэль', 'Палата', 'Черный монах', 'Убийство', 'Анна на шее',
  'Дом с мезонином', 'Моя жизнь', 'Мужики', 'В овраге', 'Архиерей',
  'Невеста', 'Детство', 'Отрочество', 'Юность', 'Казаки', 'Хаджи-Мурат',
  'Смерть Ивана Ильича', 'Крейцерова соната', 'Воскресение', 'После бала',
  'Записки сумасшедшего', 'Шинель', 'Нос', 'Портрет', 'Записки сумасшедшего',
  'Римские каникулы', 'Тени забытых предков', 'Собор Парижской Богоматери',
  'Отверженные', 'Граф Монте-Кристо', 'Три мушкетера', 'Двадцать лет спустя',
  'Виконт де Бражелон', 'Дама с камелиями', 'Красное и черное',
  'Пармская обитель', 'Леди Макбет Мценского уезда', 'Левша',
  'Очарованный странник', 'Соборяне', 'На ножах', 'Некуда',
  'Обыкновенная история', 'Обломов', 'Мильон терзаний', 'Гроза',
  'Бесприданница', 'Таланты и поклонники', 'Лес', 'Последняя жертва',
  'Волки и овцы', 'Доходное место', 'Сердце не камень', 'Тайны',
  'Свои люди — сочтемся', 'Банкрот', 'Бедность не порок', 'Не так живи',
  'На всякого мудреца', 'На бойком месте', 'Воевода', 'Снегурочка',
  'Без вины виноватые', 'Таланты', 'Поздняя любовь', 'Козьма Захарьич'
];

const AUTHORS = [
  'Л. Толстой', 'Ф. Достоевский', 'М. Булгаков', 'Дж. Оруэлл',
  'Дж. Роулинг', 'А. Чехов', 'И. Тургенев', 'Н. Гоголь',
  'А. Пушкин', 'М. Лермонтов', 'А. Дюма', 'В. Гюго',
  'Стендаль', 'А. Островский', 'И. Гончаров', 'Н. Лесков',
  'М. Салтыков-Щедрин', 'Ф. Тютчев', 'А. Фет', 'Н. Некрасов'
];

const GENRES = ['роман', 'повесть', 'рассказ', 'поэма', 'драма', 'комедия', 'трагедия', 'новелла'];

function generateBooks(count) {
  const books = [];
  for (let i = 1; i <= count; i++) {
    const title = TITLES[(i - 1) % TITLES.length];
    const author = AUTHORS[(i - 1) % AUTHORS.length];
    const year = 1800 + Math.floor(Math.random() * 224);
    const genre = GENRES[(i - 1) % GENRES.length];
    const isbn = `978-${String(1000000000 + i).slice(0, 10)}`;
    books.push({
      id: i,
      title,
      author,
      year,
      genre,
      isbn,
      available: Math.random() > 0.3,
      copies: Math.floor(Math.random() * 10) + 1,
      reviews: []
    });
  }
  return books;
}

let books = generateBooks(100);
let nextBookId = 101;

// ============================================================
// ЗАДАНИЕ 5: Пользователи и JWT
// ============================================================
const users = [
  { id: 1, email: 'admin@bbmo.ru', password: 'admin123', name: 'Админ', role: 'admin' },
  { id: 2, email: 'user@bbmo.ru', password: 'user123', name: 'Пользователь', role: 'user' }
];

// Middleware авторизации JWT
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация', status: 401 });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Недействительный токен', status: 401 });
  }
};

// Middleware проверки роли админа
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещен. Требуется роль admin', status: 403 });
  }
  next();
};

// ============================================================
// ЗАДАНИЕ 5: Аутентификация
// ============================================================
app.post('/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Все поля обязательны', status: 400 });
  }
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Пользователь уже существует', status: 400 });
  }
  const newUser = {
    id: users.length + 1,
    email,
    password,
    name,
    role: 'user'
  };
  users.push(newUser);
  res.status(201).json({ message: 'Пользователь зарегистрирован', user: { id: newUser.id, email, name } });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Неверный email или пароль', status: 401 });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ message: 'Успешный вход', token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

// ============================================================
// ЗАДАНИЕ 5: Валидация схемы книги
// ============================================================
const bookSchema = Joi.object({
  title: Joi.string().min(1).required().messages({ 'string.empty': 'Название не может быть пустым' }),
  author: Joi.string().min(1).required(),
  year: Joi.number().integer().min(1000).max(2100).required(),
  genre: Joi.string().valid(...GENRES).required(),
  isbn: Joi.string().pattern(/^[0-9-]+$/).optional()
});

// ============================================================
// ЗАДАНИЕ 2 и 4: REST API для книг
// ============================================================

// GET /api/books — с фильтрацией, пагинацией, сортировкой, поиском
app.get('/api/books', (req, res) => {
  // Проверяем кэш
  const cacheKey = `books_${JSON.stringify(req.query)}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json({ ...cached, cached: true });
  }

  let result = [...books];

  // Фильтрация по автору
  if (req.query.author) {
    result = result.filter(b => b.author.toLowerCase().includes(req.query.author.toLowerCase()));
  }

  // Фильтрация по году
  if (req.query.year) {
    result = result.filter(b => b.year === parseInt(req.query.year));
  }

  // Фильтрация по диапазону лет
  if (req.query.yearFrom || req.query.yearTo) {
    const from = parseInt(req.query.yearFrom) || 0;
    const to = parseInt(req.query.yearTo) || 9999;
    result = result.filter(b => b.year >= from && b.year <= to);
  }

  // Поиск по названию или автору
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    result = result.filter(b => 
      b.title.toLowerCase().includes(search) || 
      b.author.toLowerCase().includes(search)
    );
  }

  const total = result.length;

  // Сортировка
  if (req.query.sort) {
    const sortField = req.query.sort;
    const desc = sortField.startsWith('-');
    const field = desc ? sortField.slice(1) : sortField;
    result.sort((a, b) => {
      if (a[field] > b[field]) return desc ? -1 : 1;
      if (a[field] < b[field]) return desc ? 1 : -1;
      return 0;
    });
  }

  // Пагинация
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;
  const paginated = result.slice(offset, offset + limit);

  const response = {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    data: paginated
  };

  // Сохраняем в кэш
  cache.set(cacheKey, response);
  res.json(response);
});

// GET /api/books/stats — статистика
app.get('/api/books/stats', (req, res) => {
  const byAuthor = {};
  const byGenre = {};
  let oldest = Infinity;
  let newest = 0;

  books.forEach(b => {
    byAuthor[b.author] = (byAuthor[b.author] || 0) + 1;
    byGenre[b.genre] = (byGenre[b.genre] || 0) + 1;
    if (b.year < oldest) oldest = b.year;
    if (b.year > newest) newest = b.year;
  });

  res.json({
    total: books.length,
    byAuthor,
    byGenre,
    oldestYear: oldest,
    newestYear: newest
  });
});

// GET /api/books/search — поиск по автору (Задание 2)
app.get('/api/books/search', (req, res) => {
  const author = req.query.author;
  if (!author) {
    return res.status(400).json({ error: 'Параметр author обязателен', status: 400 });
  }
  const result = books.filter(b => b.author.toLowerCase().includes(author.toLowerCase()));
  res.json(result);
});

// GET /api/books/export — экспорт в CSV/JSON
app.get('/api/books/export', authMiddleware, (req, res) => {
  const format = req.query.format || 'json';
  
  if (format === 'csv') {
    const csv = stringify(books.map(b => ({
      id: b.id,
      title: b.title,
      author: b.author,
      year: b.year,
      genre: b.genre,
      isbn: b.isbn,
      available: b.available
    })), { header: true });
    res.type('text/csv').attachment('books.csv').send(csv);
  } else {
    res.json(books);
  }
});

// GET /api/books/available — доступные книги
app.get('/api/books/available', (req, res) => {
  res.json(books.filter(b => b.available));
});

// GET /api/books/recommendations — рекомендации по жанру
app.get('/api/books/recommendations', (req, res) => {
  const genre = req.query.genre;
  if (!genre) {
    return res.status(400).json({ error: 'Параметр genre обязателен', status: 400 });
  }
  const result = books.filter(b => b.genre.toLowerCase() === genre.toLowerCase()).slice(0, 5);
  res.json(result);
});

// GET /api/books/:id — получение конкретной книги
app.get('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const book = books.find(b => b.id === id);
  if (!book) {
    return res.status(404).json({ error: 'Книга не найдена', status: 404 });
  }
  res.json(book);
});

// POST /api/books — добавление книги (только для админов)
app.post('/api/books', authMiddleware, adminMiddleware, (req, res) => {
  const { error, value } = bookSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message, status: 400 });
  }

  // Проверка на дубликат
  const duplicate = books.find(b => b.title === value.title && b.author === value.author);
  if (duplicate) {
    return res.status(400).json({ error: 'Книга с таким названием и автором уже существует', status: 400 });
  }

  const newBook = {
    id: nextBookId++,
    ...value,
    isbn: value.isbn || `978-${String(1000000000 + nextBookId).slice(0, 10)}`,
    available: true,
    copies: 1,
    reviews: []
  };
  books.push(newBook);
  cache.flushAll(); // Очищаем кэш
  res.status(201).json(newBook);
});

// PUT /api/books/:id — обновление книги
app.put('/api/books/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const book = books.find(b => b.id === id);
  if (!book) {
    return res.status(404).json({ error: 'Книга не найдена', status: 404 });
  }

  const { error, value } = bookSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    return res.status(400).json({ error: error.details[0].message, status: 400 });
  }

  Object.assign(book, value);
  cache.flushAll();
  res.json(book);
});

// DELETE /api/books/:id — удаление книги (только для админов)
app.delete('/api/books/:id', authMiddleware, adminMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const index = books.findIndex(b => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Книга не найдена', status: 404 });
  }
  books.splice(index, 1);
  cache.flushAll();
  res.json({ message: 'Книга удалена', id });
});

// POST /api/books/:id/reviews — добавление отзыва
app.post('/api/books/:id/reviews', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const book = books.find(b => b.id === id);
  if (!book) {
    return res.status(404).json({ error: 'Книга не найдена', status: 404 });
  }
  const { text, rating } = req.body;
  if (!text || !rating) {
    return res.status(400).json({ error: 'Поля text и rating обязательны', status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Рейтинг должен быть от 1 до 5', status: 400 });
  }
  const review = {
    id: book.reviews.length + 1,
    userId: req.user.id,
    text,
    rating,
    date: new Date().toISOString()
  };
  book.reviews.push(review);
  res.status(201).json(review);
});

// POST /api/books/import — импорт из CSV
const upload = multer({ storage: multer.memoryStorage() });
app.post('/api/books/import', authMiddleware, adminMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не загружен', status: 400 });
  }
  const content = req.file.buffer.toString('utf8');
  const lines = content.split('\n').slice(1); // Пропускаем заголовок
  let imported = 0;
  lines.forEach(line => {
    const [title, author, year, genre] = line.split(',').map(s => s.trim());
    if (title && author && year && genre) {
      books.push({
        id: nextBookId++,
        title,
        author,
        year: parseInt(year),
        genre,
        isbn: `978-${String(1000000000 + nextBookId).slice(0, 10)}`,
        available: true,
        copies: 1,
        reviews: []
      });
      imported++;
    }
  });
  cache.flushAll();
  res.json({ message: `Импортировано книг: ${imported}` });
});

// ============================================================
// ЗАДАНИЕ 3: Тестовые маршруты для ошибок
// ============================================================
app.get('/error', (req, res, next) => {
  next(new Error('Тестовая ошибка сервера'));
});

app.get('/async-error', async (req, res, next) => {
  try {
    throw new Error('Асинхронная тестовая ошибка');
  } catch (err) {
    next(err);
  }
});

// ============================================================
// ЗАДАНИЕ 5: Swagger документация
// ============================================================
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Library API (LR 16)',
      version: '1.0.0',
      description: 'REST API для управления библиотекой. Группа: 477'
    },
    servers: [{ url: `http://localhost:${PORT}` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ============================================================
// Запуск сервера
// ============================================================
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
  console.log(`📚 Сгенерировано книг: ${books.length}`);
  console.log(` Swagger документация: http://localhost:${PORT}/api-docs`);
  console.log(` Тестовые пользователи:`);
  console.log(`   Admin: admin@bbmo.ru / admin123`);
  console.log(`   User: user@bbmo.ru / user123`);
});