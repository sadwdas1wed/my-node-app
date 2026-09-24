const fs = require('fs').promises;
const path = require('path');

const VARIANT = 5;
const PROJECT_DIR = `project_${VARIANT}`;

// Описание папок
const folderDescriptions = {
  'src': 'Исходный код проекта',
  'src/modules': 'Модули приложения',
  'src/components': 'UI компоненты',
  'src/utils': 'Вспомогательные утилиты',
  'data': 'Данные приложения',
  'data/input': 'Входные данные',
  'data/output': 'Выходные данные (будет переименована)',
  'temp': 'Временные файлы (будет удалена)'
};

async function createDirRecursive(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function writeInfoFile(dirPath, description) {
  const infoPath = path.join(dirPath, 'info.txt');
  await fs.writeFile(infoPath, `Назначение папки: ${description}\nСоздана: ${new Date().toLocaleString('ru-RU')}`, 'utf8');
}

async function getTree(dirPath, prefix = '') {
  let tree = `${prefix}${path.basename(dirPath)}/\n`;
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        tree += await getTree(fullPath, prefix + '  ');
      } else {
        tree += `${prefix}  ${entry.name}\n`;
      }
    }
  } catch (e) {}
  return tree;
}

async function task2() {
  console.log('=== ЗАДАНИЕ 2: Работа с каталогами ===\n');

  try {
    // 1. Создаем структуру каталогов
    const dirs = [
      `${PROJECT_DIR}/src/modules`,
      `${PROJECT_DIR}/src/components`,
      `${PROJECT_DIR}/src/utils`,
      `${PROJECT_DIR}/data/input`,
      `${PROJECT_DIR}/data/output`,
      `${PROJECT_DIR}/temp`
    ];

    for (const dir of dirs) {
      await createDirRecursive(dir);
    }
    console.log('✅ Структура каталогов создана');

    // 2. Создаем info.txt в каждой папке
    for (const [dir, desc] of Object.entries(folderDescriptions)) {
      const fullPath = path.join(PROJECT_DIR, dir);
      await writeInfoFile(fullPath, desc);
    }
    console.log('✅ Файлы info.txt созданы');

    // ВАРИАНТ 5 (нечетный): создаем 3 вложенные папки в src/components
    for (let i = 1; i <= 3; i++) {
      await createDirRecursive(`${PROJECT_DIR}/src/components/${i}`);
      await writeInfoFile(`${PROJECT_DIR}/src/components/${i}`, `Вложенная папка ${i}`);
    }
    console.log('✅ Созданы вложенные папки 1, 2, 3 в src/components (вариант нечетный)');

    // 3. Выводим дерево
    console.log('\n📂 Исходное дерево структуры:');
    console.log(await getTree(PROJECT_DIR));

    // 4. Перемещаем temp внутрь data
    await fs.rename(`${PROJECT_DIR}/temp`, `${PROJECT_DIR}/data/temp`);
    console.log('✅ Папка temp перемещена в data');

    // 5. Переименовываем data/output в data/results
    await fs.rename(`${PROJECT_DIR}/data/output`, `${PROJECT_DIR}/data/results`);
    console.log('✅ Папка data/output переименована в data/results');

    // 6. Удаляем temp со всем содержимым
    await fs.rm(`${PROJECT_DIR}/data/temp`, { recursive: true, force: true });
    console.log('✅ Папка temp удалена');

    // 7. Выводим обновленное дерево
    console.log('\n📂 Обновленное дерево структуры:');
    console.log(await getTree(PROJECT_DIR));
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

task2();