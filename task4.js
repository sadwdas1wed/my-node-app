const fs = require('fs');
const path = require('path');
const readline = require('readline');

// === ЗАМЕНИ НА СВОИ ДАННЫЕ ===
const VARIANT = 5; 

async function task4() {
    const dataFile = path.join(__dirname, `data_${VARIANT}.txt`);
    const processedFile = path.join(__dirname, `processed_${VARIANT}.txt`);
    const linesCount = 100000;

    // 1. Генерация файла (если не существует)
    if (!fs.existsSync(dataFile)) {
        console.log('⏳ Генерация большого файла...');
        const ws = fs.createWriteStream(dataFile, 'utf8');
        for (let i = 1; i <= linesCount; i++) {
            const randomNum = Math.floor(Math.random() * 1000) + 1;
            ws.write(`${i}, ${randomNum}, Вариант ${VARIANT}\n`);
        }
        ws.end();
        console.log('✅ Файл сгенерирован.\n');
    }

    // 2. Обработка через потоки
    console.log('📊 Обработка файла...');
    const rs = fs.createReadStream(dataFile, 'utf8');
    const rl = readline.createInterface({ input: rs });

    let sum = 0;
    let max = -Infinity;
    let min = Infinity;
    let count = 0;
    let evenCount = 0; // Доп условие для вариантов 1-5
    let oddCount = 0;

    rl.on('line', (line) => {
        const parts = line.split(', ');
        const num = parseInt(parts[1], 10);
        
        sum += num;
        if (num > max) max = num;
        if (num < min) min = num;
        count++;

        if (num % 2 === 0) evenCount++; else oddCount++;

        // Прогресс каждые 10%
        if (count % 10000 === 0) {
            process.stdout.write(`\r⏳ Прогресс: ${Math.round((count / linesCount) * 100)}% (${count.toLocaleString()} строк)`);
        }
    });

    rl.on('close', async () => {
        const average = (sum / count).toFixed(2);
        const resultText = `Всего строк: ${count}\nСумма чисел: ${sum}\nСреднее значение: ${average}\nМаксимальное число: ${max}\nМинимальное число: ${min}\nЧетных чисел: ${evenCount}\nНечетных чисел: ${oddCount}\n`;
        
        await fs.promises.writeFile(processedFile, resultText, 'utf8');
        
        console.log(`\n\n✅ Обработка завершена!`);
        console.log('📊 Результаты:\n' + resultText);
        console.log(`📄 Результаты сохранены в: processed_${VARIANT}.txt`);
    });
}

task4();