const http = require('http');

// === ЗАМЕНИ НА СВОИ ДАННЫЕ ===
const STUDENT_NAME = "Картузов Руслан Владимирович";           // например: Карташов Алексей
const STUDENT_GROUP = "477";       // например: ББМО-01-23
const JOURNAL_NUMBER = 10;                  // Твой номер в журнале

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

const PORT = 3000;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    
    const piValue = calculatePi(JOURNAL_NUMBER);
    
    const html = `
        <h1>Лабораторная работа №11</h1>
        <p><strong>ФИО:</strong> ${STUDENT_NAME}</p>
        <p><strong>Группа:</strong> ${STUDENT_GROUP}</p>
        <p><strong>Число Пи (до ${JOURNAL_NUMBER} знака):</strong> ${piValue}</p>
    `;
    
    res.end(html);
});

server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});