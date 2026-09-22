const fs = require('fs/promises');
const path = require('path');

// === ЗАМЕНИ НА СВОИ ДАННЫЕ ===
const VARIANT = 5; 

async function getDirStats(dirPath) {
    let totalFiles = 0;
    let totalFolders = 0;
    let totalSize = 0;
    const extensions = {};
    const allFiles = [];

    async function scan(currentPath) {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);
            if (entry.isDirectory()) {
                totalFolders++;
                await scan(fullPath);
            } else if (entry.isFile()) {
                totalFiles++;
                const stats = await fs.stat(fullPath);
                totalSize += stats.size;
                
                const ext = path.extname(entry.name) || 'без расширения';
                if (!extensions[ext]) extensions[ext] = { count: 0, size: 0 };
                extensions[ext].count++;
                extensions[ext].size += stats.size;

                allFiles.push({ name: entry.name, path: fullPath, size: stats.size });
            }
        }
    }

    await scan(dirPath);

    // Топ-5 самых больших и маленьких
    const sortedBySizeDesc = [...allFiles].sort((a, b) => b.size - a.size);
    const top5Largest = sortedBySizeDesc.slice(0, 5);
    const top5Smallest = [...allFiles].sort((a, b) => a.size - b.size).slice(0, 5);

    return { totalFiles, totalFolders, totalSize, extensions, top5Largest, top5Smallest };
}

async function task3() {
    try {
        // Берем путь из аргументов командной строки или текущую директорию
        const targetDir = process.argv[2] || __dirname;
        console.log(`📊 Анализ директории: ${targetDir}\n`);

        const stats = await getDirStats(targetDir);

        console.log(` Общее количество папок: ${stats.totalFolders}`);
        console.log(`📄 Общее количество файлов: ${stats.totalFiles}`);
        console.log(`💾 Общий размер: ${(stats.totalSize / 1024 / 1024).toFixed(2)} МБ (${stats.totalSize} байт)\n`);

        console.log('📂 Расширения файлов:');
        for (const [ext, data] of Object.entries(stats.extensions)) {
            console.log(`   ${ext}: ${data.count} файлов (${(data.size / 1024).toFixed(1)} КБ)`);
        }

        console.log('\n🏆 Топ-5 самых больших файлов:');
        stats.top5Largest.forEach((f, i) => console.log(`   ${i + 1}. ${f.name} (${(f.size / 1024).toFixed(1)} КБ) - ${f.path}`));

        console.log('\n📉 Топ-5 самых маленьких файлов:');
        stats.top5Smallest.forEach((f, i) => console.log(`   ${i + 1}. ${f.name} (${f.size} байт) - ${f.path}`));

        // Сохранение отчета
        const reportPath = path.join(__dirname, `report_${VARIANT}.json`);
        await fs.writeFile(reportPath, JSON.stringify(stats, null, 2), 'utf8');
        console.log(`\n📄 Отчет сохранен: report_${VARIANT}.json`);
    } catch (err) {
        console.error('❌ Ошибка в задании 3:', err.message);
    }
}

task3();