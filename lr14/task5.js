const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

const VARIANT = 5;
const SOURCE_DIR = `source_${VARIANT}`;
const BACKUP_DIR = `backup_${VARIANT}`;
const SYNC_REPORT = `sync_report_${VARIANT}.txt`;

const STREAM_EXTENSIONS = ['.txt', '.js', '.json'];
const COMPRESS_EXTENSIONS = ['.txt', '.js', '.json']; // ВАРИАНТ 1-5: сжатие текстовых

// Сжимаем текст (удаляем лишние пробелы) — ВАРИАНТ 1-5
function compressText(text) {
  return text
    .replace(/[ \t]+/g, ' ')      // множественные пробелы → один
    .replace(/ +\n/g, '\n')        // пробелы перед переносом
    .replace(/\n{3,}/g, '\n\n')    // множественные переносы
    .trim();
}

async function createTestStructure() {
  console.log(`📂 Создание тестовой структуры: ${SOURCE_DIR}`);

  // Создаем папки
  const dirs = [
    SOURCE_DIR,
    `${SOURCE_DIR}/sub1`,
    `${SOURCE_DIR}/sub2`,
    `${SOURCE_DIR}/sub3`
  ];
  for (const dir of dirs) {
    await fsp.mkdir(dir, { recursive: true });
  }

  // Создаем 20 файлов с разными расширениями
  const extensions = ['.txt', '.js', '.json', '.jpg', '.png', '.gif', '.css', '.html', '.md', '.log'];
  const manifest = { files: [], created: new Date().toISOString() };

  for (let i = 1; i <= 20; i++) {
    const ext = extensions[i % extensions.length];
    const filename = `file_${i}${ext}`;
    const size = Math.floor(Math.random() * 2000) + 100;
    const content = `Файл ${i} (вариант ${VARIANT}). `.repeat(Math.ceil(size / 30));

    const filePath = path.join(SOURCE_DIR, filename);
    await fsp.writeFile(filePath, content, 'utf8');
    manifest.files.push({ name: filename, size: content.length, ext });
  }

  // Файлы в подпапках
  for (let sub = 1; sub <= 3; sub++) {
    for (let i = 1; i <= 3; i++) {
      const filename = `sub${sub}_file_${i}.txt`;
      const content = `Подпапка ${sub}, файл ${i}. Вариант ${VARIANT}. `;
      const filePath = path.join(SOURCE_DIR, `sub${sub}`, filename);
      await fsp.writeFile(filePath, content, 'utf8');
      manifest.files.push({ name: filename, size: content.length, ext: '.txt', sub: `sub${sub}` });
    }
  }

  // manifest.json
  await fsp.writeFile(
    path.join(SOURCE_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );

  console.log(`✅ Создано файлов: ${manifest.files.length + 1}`);
}

async function copyWithStreams(src, dest) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(src);
    const writeStream = fs.createWriteStream(dest);
    readStream.pipe(writeStream);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
    readStream.on('error', reject);
  });
}

async function copyDirectory(src, dest) {
  await fsp.mkdir(dest, { recursive: true });
  const entries = await fsp.readdir(src, { withFileTypes: true });

  let streamCount = 0;
  let normalCount = 0;
  let totalSize = 0;

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      const subResult = await copyDirectory(srcPath, destPath);
      streamCount += subResult.streamCount;
      normalCount += subResult.normalCount;
      totalSize += subResult.totalSize;
    } else {
      const stats = await fsp.stat(srcPath);
      totalSize += stats.size;
      const ext = path.extname(entry.name).toLowerCase();

      let content = await fsp.readFile(srcPath);

      // ВАРИАНТ 1-5: сжатие текстовых файлов
      if (COMPRESS_EXTENSIONS.includes(ext)) {
        const text = content.toString('utf8');
        const compressed = compressText(text);
        await fsp.writeFile(destPath, compressed, 'utf8');
        streamCount++;
      } else if (STREAM_EXTENSIONS.includes(ext)) {
        await copyWithStreams(srcPath, destPath);
        streamCount++;
      } else {
        await fsp.copyFile(srcPath, destPath);
        normalCount++;
      }
    }
  }

  return { streamCount, normalCount, totalSize };
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} МБ`;
}

async function compareDirectories(src, dest) {
  const report = [];
  let same = 0, changed = 0, added = 0, deleted = 0;

  async function compare(srcPath, destPath, relPath = '') {
    const srcEntries = await fsp.readdir(srcPath, { withFileTypes: true }).catch(() => []);
    const destEntries = await fsp.readdir(destPath, { withFileTypes: true }).catch(() => []);

    const srcNames = new Set(srcEntries.map(e => e.name));
    const destNames = new Set(destEntries.map(e => e.name));

    for (const name of srcNames) {
      const srcFile = path.join(srcPath, name);
      const destFile = path.join(destPath, name);
      const currentRel = relPath ? `${relPath}/${name}` : name;

      if (!destNames.has(name)) {
        report.push(`🗑 Удален: ${currentRel}`);
        deleted++;
      } else {
        const srcStat = await fsp.stat(srcFile);
        const destStat = await fsp.stat(destFile);

        if (srcStat.isDirectory() && destStat.isDirectory()) {
          await compare(srcFile, destFile, currentRel);
        } else {
          if (srcStat.size !== destStat.size || srcStat.mtimeMs !== destStat.mtimeMs) {
            report.push(`️  Изменен: ${currentRel} (size, modified)`);
            changed++;
          } else {
            same++;
          }
        }
      }
    }

    for (const name of destNames) {
      if (!srcNames.has(name)) {
        const currentRel = relPath ? `${relPath}/${name}` : name;
        report.push(`➕ Добавлен: ${currentRel}`);
        added++;
      }
    }
  }

  await compare(src, dest);
  return { report, same, changed, added, deleted };
}

async function task5() {
  console.log('=== ЗАДАНИЕ 5: Копирование и синхронизация ===\n');

  try {
    // 1. Создаем тестовую структуру
    await createTestStructure();

    // 2. Копируем с фильтрацией
    console.log(`\n📂 Копирование: ${SOURCE_DIR} → ${BACKUP_DIR}`);
    const startTime = Date.now();
    const result = await copyDirectory(SOURCE_DIR, BACKUP_DIR);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n✅ Копирование завершено!');
    console.log('\n📊 Статистика:');
    console.log(`   - Потоковое копирование (с сжатием): ${result.streamCount} файлов`);
    console.log(`   - Обычное копирование: ${result.normalCount} файлов`);
    console.log(`   - Общий размер: ${formatSize(result.totalSize)}`);
    console.log(`   - Время выполнения: ${duration} сек`);

    // 3. Синхронизация (сравнение)
    console.log('\n🔄 Сравнение директорий...');
    const comparison = await compareDirectories(SOURCE_DIR, BACKUP_DIR);

    console.log(`   - Совпадают: ${comparison.same} файлов`);
    console.log(`   - Изменены: ${comparison.changed} файлов`);
    console.log(`   - Добавлены: ${comparison.added} файлов`);
    console.log(`   - Удалены: ${comparison.deleted} файлов`);

    // 4. Сохраняем отчет
    const reportContent = `Отчет синхронизации (Вариант ${VARIANT})
Дата: ${new Date().toLocaleString('ru-RU')}
========================================
Исходная директория: ${SOURCE_DIR}
Директория назначения: ${BACKUP_DIR}

Результаты копирования:
- Потоковое копирование (с сжатием): ${result.streamCount} файлов
- Обычное копирование: ${result.normalCount} файлов
- Общий размер: ${formatSize(result.totalSize)}
- Время выполнения: ${duration} сек

Результаты сравнения:
- Совпадают: ${comparison.same} файлов
- Изменены: ${comparison.changed} файлов
- Добавлены: ${comparison.added} файлов
- Удалены: ${comparison.deleted} файлов

Детали:
${comparison.report.join('\n') || '  (нет изменений)'}
`;

    await fsp.writeFile(SYNC_REPORT, reportContent, 'utf8');
    console.log(`\n📄 Отчет сохранен: ${SYNC_REPORT}`);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

task5();