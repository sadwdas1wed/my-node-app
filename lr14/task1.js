const fs = require('fs').promises;
const path = require('path');

const VARIANT = 5;
const FILENAME = `student_${VARIANT}.txt`;

const studentInfo = `Студент: Иванов Иван
Группа: ББМО-01-23
Вариант: ${VARIANT}
Дата: ${new Date().toLocaleString('ru-RU')}
Любимые книги:
1. "Война и мир" - Л. Толстой
2. "Преступление и наказание" - Ф. Достоевский
3. "Мастер и Маргарита" - М. Булгаков
4. "1984" - Дж. Оруэлл
5. "Гарри Поттер" - Дж. Роулинг`;

async function task1() {
  console.log('=== ЗАДАНИЕ 1: Создание и чтение файлов ===\n');

  try {
    // 1. Создаем файл
    await fs.writeFile(FILENAME, studentInfo, 'utf8');
    console.log(`✅ Создан файл: ${FILENAME}`);

    // 2. Читаем файл для подсчета строк
    let content = await fs.readFile(FILENAME, 'utf8');
    const lines = content.split('\n');
    const lineCount = lines.length;

    // 3. Добавляем строку с количеством записей
    content += `\nКоличество записей: ${lineCount}`;
    await fs.writeFile(FILENAME, content, 'utf8');

    // 4. Читаем и выводим содержимое
    const finalContent = await fs.readFile(FILENAME, 'utf8');
    console.log('\n📄 Содержимое файла:');
    console.log(finalContent);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

task1();