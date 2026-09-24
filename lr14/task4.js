const fs = require('fs');
const path = require('path');
const readline = require('readline');

const VARIANT = 5;
const DATA_FILE = `data_${VARIANT}.txt`;
const PROCESSED_FILE = `processed_${VARIANT}.txt`;
const TOTAL_LINES = 100000;

// 1. Генерация файла
async function generateFile() {
  console.log(`📝 Генерация файла ${DATA_FILE}...`);
  const writeStream = fs.createWriteStream(DATA_FILE, 'utf8');

  for (let i = 1; i <= TOTAL_LINES; i++) {
    const randomNum = Math.floor(Math.random() * 1000) + 1;
    writeStream.write(`${i}, ${randomNum}, Вариант ${VARIANT}\n`);
    if (i % 10000 === 0) {
      process.stdout.write(`\r   Генерация: ${i}/${TOTAL_LINES} строк`);
    }
  }

  writeStream.end();
  await new Promise(resolve => writeStream.on('finish', resolve));
  console.log(`\n✅ Файл сгенерирован: ${TOTAL_LINES} строк`);
}

// 2. Обработка через потоки
async function processFile() {
  console.log(`\n📊 Обработка файла: ${DATA_FILE}`);

  const stats = await fs.promises.stat(DATA_FILE);
  console.log(`Размер файла: ${(stats.size / (1024 * 1024)).toFixed(2)} МБ`);

  const fileStream = fs.createReadStream(DATA_FILE, { encoding: 'utf8', highWaterMark: 64 * 1024 });
  const rl = readline.createInterface({ input: fileStream });

  let lineNumber = 0;
  let sum = 0;
  let max = -Infinity;
  let min = Infinity;
  let evenCount = 0;  // ВАРИАНТ 1-5: четные/нечетные
  let oddCount = 0;

  for await (const line of rl) {
    lineNumber++;
    const parts = line.split(',').map(s => s.trim());
    const number = parseInt(parts[1], 10);

    sum += number;
    if (number > max) max = number;
    if (number < min) min = number;

    // ВАРИАНТ 1-5: подсчет четных/нечетных
    if (number % 2 === 0) evenCount++;
    else oddCount++;

    if (lineNumber % 10000 === 0) {
      const progress = Math.floor((lineNumber / TOTAL_LINES) * 100);
      console.log(` Прогресс: ${progress}% (${lineNumber.toLocaleString()} строк обработано)`);
    }
  }

  const average = (sum / lineNumber).toFixed(2);

  console.log('\n✅ Обработка завершена!');
  console.log('\n📊 Результаты:');
  console.log(`   - Всего строк: ${lineNumber.toLocaleString()}`);
  console.log(`   - Сумма чисел: ${sum.toLocaleString()}`);
  console.log(`   - Среднее значение: ${average}`);
  console.log(`   - Максимальное число: ${max}`);
  console.log(`   - Минимальное число: ${min}`);
  console.log(`   - Четных чисел: ${evenCount.toLocaleString()} (вариант 1-5)`);
  console.log(`   - Нечетных чисел: ${oddCount.toLocaleString()} (вариант 1-5)`);

  // Сохраняем результаты
  const results = `Результаты обработки файла ${DATA_FILE} (Вариант ${VARIANT})
Дата: ${new Date().toLocaleString('ru-RU')}
========================================
Всего строк: ${lineNumber.toLocaleString()}
Сумма чисел: ${sum.toLocaleString()}
Среднее значение: ${average}
Максимальное число: ${max}
Минимальное число: ${min}
Четных чисел: ${evenCount.toLocaleString()}
Нечетных чисел: ${oddCount.toLocaleString()}
`;

  await fs.promises.writeFile(PROCESSED_FILE, results, 'utf8');
  console.log(`\n📄 Результаты сохранены в: ${PROCESSED_FILE}`);
}

async function task4() {
  console.log('=== ЗАДАНИЕ 4: Потоковая обработка данных ===\n');
  try {
    // Проверяем, существует ли файл
    try {
      await fs.promises.access(DATA_FILE);
    } catch {
      await generateFile();
    }
    await processFile();
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

task4();