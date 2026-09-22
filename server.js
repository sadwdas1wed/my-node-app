const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();

// === ДАННЫЕ СТУДЕНТА ===
const STUDENT_NAME = "Картузов Руслан Владимирович";
const GROUP = "477";
const VARIANT = 10;

// ============================================
// ЗАДАНИЕ 1: Базовый HTTP-сервер
// ============================================
router.get('/', (ctx) => {
    const currentDate = new Date().toLocaleString('ru-RU');
    ctx.type = 'html';
    ctx.body = `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <title>Лабораторная работа №15</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
                h1 { color: #333; }
                .info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .info p { margin: 10px 0; }
                .welcome { color: #2196F3; font-size: 1.2em; }
            </style>
        </head>
        <body>
            <h1>Лабораторная работа №15</h1>
            <div class="info">
                <p><strong>Студент:</strong> ${STUDENT_NAME}</p>
                <p><strong>Группа:</strong> ${GROUP}</p>
                <p><strong>Вариант:</strong> ${VARIANT}</p>
                <p><strong>Текущая дата и время:</strong> ${currentDate}</p>
            </div>
            <p class="welcome">Добро пожаловать на сервер Koa.js! 🚀</p>
            <h2>Доступные эндпоинты:</h2>
            <ul>
                <li><a href="/api/users">GET /api/users</a> - Список пользователей</li>
                <li><a href="/students">GET /students</a> - Список студентов</li>
                <li><a href="/protected">GET /protected</a> - Защищенный маршрут (требует Authorization)</li>
                <li><a href="/error">GET /error</a> - Тест обработки ошибок</li>
            </ul>
        </body>
        </html>
    `;
});

// ============================================
// ЗАДАНИЕ 2: REST API для пользователей
// ============================================
let users = [
    { id: 1, name: "Иванов Иван", group: GROUP },
    { id: 2, name: "Петров Петр", group: GROUP }
];
let nextUserId = 3;

router.get('/api/users', (ctx) => {
    ctx.body = users;
});

router.post('/api/users', (ctx) => {
    const { name, group } = ctx.request.body;
    if (!name || !group) {
        ctx.status = 400;
        ctx.body = { error: "Невалидные данные. Требуются поля: name, group" };
        return;
    }
    const newUser = { id: nextUserId++, name, group };
    users.push(newUser);
    ctx.status = 201;
    ctx.body = newUser;
});

router.put('/api/users/:id', (ctx) => {
    const id = parseInt(ctx.params.id);
    const user = users.find(u => u.id === id);
    if (!user) {
        ctx.status = 404;
        ctx.body = { error: "Пользователь не найден" };
        return;
    }
    const { name, group } = ctx.request.body;
    if (name) user.name = name;
    if (group) user.group = group;
    ctx.body = user;
});

router.delete('/api/users/:id', (ctx) => {
    const id = parseInt(ctx.params.id);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
        ctx.status = 404;
        ctx.body = { error: "Пользователь не найден" };
        return;
    }
    users.splice(index, 1);
    ctx.body = { message: "Пользователь успешно удален" };
});

// ============================================
// ЗАДАНИЕ 3: Middleware
// ============================================

// Middleware логирования
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    const timestamp = new Date().toLocaleString('ru-RU');
    console.log(`[${timestamp}] ${ctx.method} ${ctx.url} - ${ms}ms`);
});

// Middleware обработки ошибок
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.status || 500;
        ctx.body = { error: err.message || "Внутренняя ошибка сервера", status: ctx.status };
    }
});

// Middleware авторизации (для защищенных маршрутов)
const authMiddleware = async (ctx, next) => {
    const authHeader = ctx.headers.authorization;
    if (!authHeader) {
        ctx.status = 401;
        ctx.body = { error: "Требуется авторизация. Добавьте заголовок Authorization" };
        return;
    }
    await next();
};

router.get('/protected', authMiddleware, (ctx) => {
    ctx.body = { message: "Доступ разрешен! Это защищенный маршрут." };
});

// Тестовый маршрут для проверки обработки ошибок
router.get('/error', (ctx) => {
    throw new Error("Тестовая ошибка для проверки middleware");
});

// ============================================
// ЗАДАНИЕ 4 и 5: API для студентов с генерацией данных
// ============================================

// Генерация 50 студентов на основе номера группы
const firstNames = ["Александр", "Дмитрий", "Максим", "Сергей", "Андрей", "Алексей", "Артём", "Илья", "Кирилл", "Михаил", "Никита", "Матвей", "Роман", "Егор", "Арсений", "Иван", "Денис", "Евгений", "Даниил", "Тимофей", "Владислав", "Игорь", "Владимир", "Павел", "Руслан", "Мария", "Анна", "Виктория", "Екатерина", "Анастасия", "Дарья", "Полина", "София", "Алиса", "Валерия", "Елизавета", "Ксения", "Милана", "Варвара", "Арина"];
const lastNames = ["Иванов", "Смирнов", "Кузнецов", "Попов", "Васильев", "Петров", "Соколов", "Михайлов", "Новиков", "Фёдоров", "Морозов", "Волков", "Алексеев", "Лебедев", "Семёнов", "Егоров", "Павлов", "Козлов", "Степанов", "Николаев", "Орлов", "Андреев", "Макаров", "Никитин", "Захаров", "Зайцев", "Соловьёв", "Борисов", "Яковлев", "Григорьев"];

function generateStudents() {
    const students = [];
    for (let i = 1; i <= 50; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const course = Math.floor(Math.random() * 4) + 1; // 1-4 курс
        const groupVariant = GROUP + "-" + (i % 3 + 1); // Разные подгруппы
        students.push({
            id: i,
            name: `${lastName} ${firstName}`,
            group: groupVariant,
            course: course
        });
    }
    return students;
}

let students = generateStudents();
let nextStudentId = 51;

// GET /students - с пагинацией, сортировкой, поиском
router.get('/students', (ctx) => {
    let result = [...students];
    
    // Фильтрация по группе
    if (ctx.query.group) {
        result = result.filter(s => s.group === ctx.query.group);
    }
    
    // Поиск по имени (регистронезависимый)
    if (ctx.query.search) {
        const searchLower = ctx.query.search.toLowerCase();
        result = result.filter(s => s.name.toLowerCase().includes(searchLower));
    }
    
    // Сортировка
    if (ctx.query.sort) {
        const sortField = ctx.query.sort.startsWith('-') ? ctx.query.sort.substring(1) : ctx.query.sort;
        const sortOrder = ctx.query.sort.startsWith('-') ? -1 : 1;
        result.sort((a, b) => {
            if (a[sortField] < b[sortField]) return -1 * sortOrder;
            if (a[sortField] > b[sortField]) return 1 * sortOrder;
            return 0;
        });
    }
    
    // Пагинация
    const limit = parseInt(ctx.query.limit) || 10;
    const offset = parseInt(ctx.query.offset) || 0;
    const total = result.length;
    result = result.slice(offset, offset + limit);
    
    ctx.body = {
        data: result,
        total: total,
        limit: limit,
        offset: offset
    };
});

// GET /students/:id - получение конкретного студента
router.get('/students/:id', (ctx) => {
    const id = parseInt(ctx.params.id);
    const student = students.find(s => s.id === id);
    if (!student) {
        ctx.status = 404;
        ctx.body = { error: "Студент не найден" };
        return;
    }
    ctx.body = student;
});

// POST /students - добавление студента
router.post('/students', (ctx) => {
    const { name, group, course } = ctx.request.body;
    if (!name || !group || !course) {
        ctx.status = 400;
        ctx.body = { error: "Невалидные данные. Требуются поля: name, group, course" };
        return;
    }
    const newStudent = {
        id: nextStudentId++,
        name,
        group,
        course: parseInt(course)
    };
    students.push(newStudent);
    ctx.status = 201;
    ctx.body = newStudent;
});

// PUT /students/:id - обновление студента
router.put('/students/:id', (ctx) => {
    const id = parseInt(ctx.params.id);
    const student = students.find(s => s.id === id);
    if (!student) {
        ctx.status = 404;
        ctx.body = { error: "Студент не найден" };
        return;
    }
    const { name, group, course } = ctx.request.body;
    if (name) student.name = name;
    if (group) student.group = group;
    if (course) student.course = parseInt(course);
    ctx.body = student;
});

// DELETE /students/:id - удаление студента
router.delete('/students/:id', (ctx) => {
    const id = parseInt(ctx.params.id);
    const index = students.findIndex(s => s.id === id);
    if (index === -1) {
        ctx.status = 404;
        ctx.body = { error: "Студент не найден" };
        return;
    }
    students.splice(index, 1);
    ctx.body = { message: "Студент успешно удален" };
});

// ============================================
// ЗАПУСК СЕРВЕРА
// ============================================
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(` Студент: ${STUDENT_NAME}`);
    console.log(`📚 Группа: ${GROUP}, Вариант: ${VARIANT}`);
    console.log(`📊 Сгенерировано студентов: ${students.length}`);
});