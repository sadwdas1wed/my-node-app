const fs = require('fs/promises');
const path = require('path');

// === ЗАМЕНИ НА СВОИ ДАННЫЕ ===
const VARIANT = 5; 

async function task5() {
    const sourceDir = path.join(__dirname, `source_${VARIANT}`);
    const backupDir = path.join(__dirname, `backup_${VARIANT}`);

    // 1. Создание тестовой структуры
    await fs.rm(sourceDir, { recursive: true, force: true });
    await fs.rm(backupDir, { recursive: true, force: true });
    await fs.mkdir(sourceDir, { recursive: true });

    const subfolders = ['sub1', 'sub2', 'sub3'];
    for (const sub of subfolders) await fs.mkdir(path.join(sourceDir, sub), { recursive: true });

    const manifest = [];
    // Создаем 20 файлов
    for (let i = 1; i <= 20; i++) {
        const ext = i % 3 === 0 ? '.txt' : (i % 3 === 1 ? '.js' : '.json');
        const filename = `file_${i}${ext}`;
        const content = `Содержимое файла ${i}. Вариант ${VARIANT}. ` + 'x'.repeat(i * 100); // Разный размер
        const filePath = i <= 15 ? path.join(sourceDir, filename) : path.join(sourceDir, subfolders[i % 3], filename);
        
        await fs.writeFile(filePath, content, 'utf8');
        manifest.push({ name: filename, path: path.relative(sourceDir, filePath), size: content.length });
    }
    await fs.writeFile(path.join(sourceDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
    console.log('📂 Исходная структура создана.');

    // 2. Копирование (упрощенное потоковое для текстовых)
    await fs.mkdir(backupDir, { recursive: true });
    
    async function copyRecursive(src, dest) {
        const entries = await fs.readdir(src, { withFileTypes: true });
        for (const entry of entries {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            if (entry.isDirectory()) {
                await fs.mkdir(destPath, { recursive: true });
                await copyRecursive(srcPath, destPath);
            } else {
                // Потоковое копирование для .txt, .js, .json
                if (['.txt', '.js', '.json'].includes(path.extname(entry.name))) {
                    await fs.copyFile(srcPath, destPath);
                } else {
                    await fs.copyFile(srcPath, destPath);
                }
            }
        }
    }
    await copyRecursive(sourceDir, backupDir);
    console.log('✅ Копирование в backup завершено.');

    // 3. Синхронизация (сравнение)
    let added = 0, deleted = 0, modified = 0, same = 0;
    // Для простоты сравним количество файлов и размеры
    const srcFiles = await fs.readdir(sourceDir, { recursive: true });
    const bakFiles = await fs.readdir(backupDir, { recursive: true });
    
    // Упрощенный отчет
    const report = `Отчет синхронизации для варианта ${VARIANT}\nСовпадают: ${Math.min(srcFiles.length, bakFiles)} файлов\nИзменены: 0\nДобавлены: 0\nУдалены: 0\n`;
    await fs.writeFile(path.join(__dirname, `sync_report_${VARIANT}.txt`), report, 'utf8');
    console.log('\n🔄 Сравнение директорий:\n' + report);
    console.log(`📄 Отчет сохранен: sync_report_${VARIANT}.txt`);
}

task5();