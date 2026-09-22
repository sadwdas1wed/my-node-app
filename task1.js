const fs = require('fs/promises');
const path = require('path');

// === ЗАМЕНИ НА СВОИ ДАННЫЕ ===
const VARIANT = 5; 
const STUDENT_NAME = "Иванов Иван Иванович";
const GROUP = "ББМО-01-23";

async function task1() {
    try {
        const filename = `student_${VARIANT}.txt`;
        const filePath = path.join(__dirname, filename);
        const date = new Date().toLocaleString('ru-RU');
        
        const books = [
            '1. "Война и мир" - Л. Толстой',
            '2. "Преступление и наказание" - Ф. Достоевский',
            '3. "Мастер и Маргарита" - М. Булгаков',
            '4. "1984" - Дж. Оруэлл',
            '5. "Гарри Поттер" - Дж. Роулинг'
        ];

        // Формируем содержимое
        let content = `Студент: ${STUDENT_NAME}\nГруппа: ${GROUP}\nВариант: ${VARIANT}\nДата: ${date}\nЛюбимые книги:\n${books.join('\n')}\n`;
        
        // Считаем количество строк (разбиваем по \n и добавляем 1 для последней строки)
        const linesCount = content.split('\n').length; 
        content += `Количество записей: ${linesCount}\n`;

        // Запись файла
        await fs.writeFile(filePath, content, 'utf8');
        console.log(`✅ Создан файл: ${filename}`);

        // Чтение и вывод
        const readContent = await fs.readFile(filePath, 'utf8');
        console.log('\n📄 Содержимое файла:\n' + readContent);
    } catch (err) {
        console.error('❌ Ошибка в задании 1:', err.message);
    }
}

task1();