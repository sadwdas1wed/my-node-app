const fs = require('fs').promises;
const path = require('path');

const VARIANT = 5;
const REPORT_FILE = `report_${VARIANT}.json`;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 МБ (вариант 1-5)

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} МБ`;
}

async function scanDirectory(dirPath) {
  const result = {
    files: [],
    folders: 0,
    totalSize: 0,
    extensions: {},
    allFiles: []
  };

  async function scan(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        result.folders++;
        await scan(fullPath);
      } else if (entry.isFile()) {
        try {
          const stats = await fs.stat(fullPath);
          // ВАРИАНТ 1-5: игнорируем файлы > 10 МБ
          if (stats.size > MAX_FILE_SIZE) {
            console.log(`⚠️  Пропущен файл > 10 МБ: ${fullPath}`);
            continue;
          }
          result.files.push(fullPath);
          result.totalSize += stats.size;
          result.allFiles.push({ path: fullPath, size: stats.size, name: entry.name });

          const ext = path.extname(entry.name) || '(без расширения)';
          if (!result.extensions[ext]) {
            result.extensions[ext] = { count: 0, size: 0 };
          }
          result.extensions[ext].count++;
          result.extensions[ext].size += stats.size;
        } catch (e) {}
      }
    }
  }

  await scan(dirPath);
  return result;
}

async function task3() {
  const targetDir = process.argv[2] || '.';
  console.log(`=== ЗАДАНИЕ 3: Поиск и фильтрация файлов ===\n`);
  console.log(` Анализ директории: ${targetDir}\n`);

  try {
    const stats = await scanDirectory(targetDir);

    console.log(` Общее количество папок: ${stats.folders}`);
    console.log(`📄 Общее количество файлов: ${stats.files.length}`);
    console.log(`💾 Общий размер: ${formatSize(stats.totalSize)} (${stats.totalSize.toLocaleString()} байт)\n`);

    console.log('📂 Расширения файлов:');
    for (const [ext, data] of Object.entries(stats.extensions)) {
      console.log(`   ${ext}: ${data.count} файлов (${formatSize(data.size)})`);
    }

    // Топ-5 самых больших
    const sortedBySize = [...stats.allFiles].sort((a, b) => b.size - a.size);
    console.log('\n🏆 Топ-5 самых больших файлов:');
    sortedBySize.slice(0, 5).forEach((f, i) => {
      console.log(`   ${i + 1}. ${f.name} (${formatSize(f.size)}) - ${f.path}`);
    });

    // Топ-5 самых маленьких
    const sortedBySizeAsc = [...stats.allFiles].sort((a, b) => a.size - b.size);
    console.log('\n📎 Топ-5 самых маленьких файлов:');
    sortedBySizeAsc.slice(0, 5).forEach((f, i) => {
      console.log(`   ${i + 1}. ${f.name} (${formatSize(f.size)}) - ${f.path}`);
    });

    // Создаем отчет
    const report = {
      directory: targetDir,
      variant: VARIANT,
      date: new Date().toISOString(),
      totalFolders: stats.folders,
      totalFiles: stats.files.length,
      totalSize: stats.totalSize,
      totalSizeFormatted: formatSize(stats.totalSize),
      extensions: stats.extensions,
      top5Largest: sortedBySize.slice(0, 5),
      top5Smallest: sortedBySizeAsc.slice(0, 5)
    };

    await fs.writeFile(REPORT_FILE, JSON.stringify(report, null, 2), 'utf8');
    console.log(`\n Отчет сохранен: ${REPORT_FILE}`);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

task3();