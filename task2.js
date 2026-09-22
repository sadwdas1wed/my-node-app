const fs = require('fs/promises');
const path = require('path');

// === ЗАМЕНИ НА СВОИ ДАННЫЕ ===
const VARIANT = 5; 

const projectDir = path.join(__dirname, `project_${VARIANT}`);

// Функция для вывода дерева папок
async function printTree(dir, prefix = '') {
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            console.log(`${prefix}${entry.isDirectory() ? '📁' : '📄'} ${entry.name}`);
            if (entry.isDirectory()) {
                await printTree(fullPath, prefix + '  ');
            }
        }
    } catch (err) {
        // Игнорируем ошибки чтения
    }
}

async function task2() {
    try {
        // 1. Очистка, если папка уже есть
        await fs.rm(projectDir, { recursive: true, force: true });

        const dirs = [
            'src/modules', 'src/components', 'src/utils',
            'data/input', 'data/output', 'temp'
        ];

        // 2. Создание структуры и info.txt
        for (const dir of dirs) {
            const fullPath = path.join(projectDir, dir);
            await fs.mkdir(fullPath, { recursive: true });
            await fs.writeFile(path.join(fullPath, 'info.txt'), `Назначение папки: ${dir}`, 'utf8');
        }

        // 3. Дополнительное условие (зависит от варианта)
        if (VARIANT % 2 === 0) {
            // Четный: README.md с датой
            for (const dir of dirs) {
                await fs.writeFile(path.join(projectDir, dir, 'README.md'), new Date().toLocaleDateString(), 'utf8');
            }
        } else {
            // Нечетный: 3 вложенные папки в src/components
            for (let i = 1; i <= 3; i++) {
                await fs.mkdir(path.join(projectDir, `src/components/${i}`), { recursive: true });
            }
        }

        console.log(' Исходное дерево структуры:');
        await printTree(projectDir);

        // 4. Перемещение temp внутрь data
        await fs.rename(path.join(projectDir, 'temp'), path.join(projectDir, 'data/temp'));
        
        // 5. Переименование data/output в data/results
        await fs.rename(path.join(projectDir, 'data/output'), path.join(projectDir, 'data/results'));

        // 6. Удаление data/temp
        await fs.rm(path.join(projectDir, 'data/temp'), { recursive: true, force: true });

        console.log('\n🌳 Обновленное дерево структуры:');
        await printTree(projectDir);
        console.log('\n✅ Задание 2 выполнено!');
    } catch (err) {
        console.error('❌ Ошибка в задании 2:', err.message);
    }
}

task2();