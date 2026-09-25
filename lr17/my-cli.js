#!/usr/bin/env node

// ============================================================
// Лабораторная работа №17: CLI-приложение
// Группа: 477
// ============================================================

const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const cliProgress = require('cli-progress');
const fs = require('fs');
const path = require('path');

const program = new Command();
const GROUP = '477';
const VERSION = '1.0.0';

// ============================================================
// ЗАДАНИЕ 1: Базовые команды
// ============================================================

program
  .name('my-cli')
  .description('CLI-приложение для лабораторной работы №17')
  .version(VERSION, '-V, --version')
  .option('-v, --verbose', 'подробный вывод');

// Команда greet
program
  .command('greet [name]')
  .description('Вывести приветствие')
  .argument('[name]', 'имя пользователя', 'Студент')
  .action((name, options) => {
    console.log(chalk.green(`Привет, ${name}!`));
    console.log(chalk.blue(`Группа: ${GROUP}`));
    console.log(chalk.gray(`Дата: ${new Date().toLocaleString('ru-RU')}`));
    
    if (options.parent.verbose) {
      console.log(chalk.yellow('Режим: подробный'));
      console.log(chalk.yellow(`Платформа: ${process.platform}`));
      console.log(chalk.yellow(`Node.js версия: ${process.version}`));
    }
  });

// Команда info
program
  .command('info')
  .description('Вывести информацию о системе')
  .action(() => {
    console.log(chalk.cyan('=== Информация о системе ==='));
    console.log(`ОС: ${process.platform}`);
    console.log(`Архитектура: ${process.arch}`);
    console.log(`Node.js: ${process.version}`);
    console.log(`V8: ${process.versions.v8}`);
    console.log(`Группа: ${GROUP}`);
    console.log(`Лабораторная работа: №17`);
  });

// ============================================================
// ЗАДАНИЕ 2: Commander.js с опциями и флагами
// ============================================================

// Команда generate
program
  .command('generate')
  .description('Сгенерировать отчёт')
  .option('-t, --type <type>', 'тип отчёта (html, pdf, json, csv)', 'html')
  .option('-o, --output <path>', 'путь к выходному файлу', './report')
  .option('--dry-run', 'режим проверки без выполнения')
  .action((options) => {
    const validTypes = ['html', 'pdf', 'json', 'csv'];
    
    if (!validTypes.includes(options.type)) {
      console.error(chalk.red(`Ошибка: недопустимый тип отчёта "${options.type}".`));
      console.error(chalk.red(`Допустимые значения: ${validTypes.join(', ')}`));
      process.exit(1);
    }

    if (options.dryRun) {
      console.log(chalk.yellow('[DRY-RUN] Действия не выполнены (режим проверки)'));
      console.log(chalk.gray(`Тип: ${options.type}`));
      console.log(chalk.gray(`Путь: ${options.output}.${options.type}`));
      return;
    }

    const spinner = ora(`Генерация отчёта ${options.type}...`).start();
    
    setTimeout(() => {
      const filename = `${options.output}.${options.type}`;
      fs.writeFileSync(filename, `Отчёт для группы ${GROUP}\nДата: ${new Date().toISOString()}\n`);
      spinner.succeed(`Отчёт создан: ${filename}`);
    }, 1500);
  });

// Команда convert
program
  .command('convert <input> [output]')
  .description('Конвертировать файл')
  .option('-f, --format <format>', 'формат вывода', 'txt')
  .action((input, output, options) => {
    if (!fs.existsSync(input)) {
      console.error(chalk.red(`Ошибка: файл "${input}" не найден`));
      process.exit(1);
    }

    const outPath = output || `converted_${path.basename(input, path.extname(input))}.${options.format}`;
    const content = fs.readFileSync(input, 'utf8');
    fs.writeFileSync(outPath, content);
    
    console.log(chalk.green(`✓ Файл конвертирован: ${outPath}`));
  });

// ============================================================
// ЗАДАНИЕ 3: Интерактивный режим с Inquirer
// ============================================================

program
  .command('init')
  .description('Инициализация нового проекта')
  .option('--name <name>', 'название проекта')
  .option('--type <type>', 'тип проекта (web, cli, api)')
  .option('--typescript', 'использовать TypeScript')
  .option('--prettier', 'использовать Prettier')
  .option('--git', 'инициализировать Git')
  .option('--no-interactive', 'отключить интерактивный режим')
  .action(async (options) => {
    let projectName = options.name;
    let projectType = options.type;
    let useTypescript = options.typescript || false;
    let usePrettier = options.prettier || false;
    let useGit = options.git || false;

    // Интерактивный режим
    if (!options.interactive) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'Введите название проекта:',
          default: projectName || 'my-project',
          when: !projectName
        },
        {
          type: 'list',
          name: 'projectType',
          message: 'Выберите тип проекта:',
          choices: ['web', 'cli', 'api'],
          default: projectType || 'web',
          when: !projectType
        },
        {
          type: 'checkbox',
          name: 'features',
          message: 'Выберите дополнительные опции:',
          choices: [
            { name: 'TypeScript', value: 'typescript' },
            { name: 'ESLint', value: 'eslint' },
            { name: 'Prettier', value: 'prettier' },
            { name: 'Jest', value: 'jest' }
          ]
        },
        {
          type: 'confirm',
          name: 'useGit',
          message: 'Использовать Git?',
          default: true,
          when: !options.git && options.git !== false
        }
      ]);

      if (!projectName) projectName = answers.projectName;
      if (!projectType) projectType = answers.projectType;
      if (answers.features) {
        useTypescript = answers.features.includes('typescript');
        usePrettier = answers.features.includes('prettier');
      }
      if (!options.git && options.git !== false) useGit = answers.useGit;
    }

    if (!projectName || !projectType) {
      console.error(chalk.red('Ошибка: недостаточно данных. Укажите --name и --type'));
      process.exit(1);
    }

    // Создание проекта
    const spinner = ora(`Создание проекта "${projectName}"...`).start();
    
    setTimeout(() => {
      const projectDir = path.join(process.cwd(), projectName);
      if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true });
      }

      const packageJson = {
        name: projectName,
        version: '1.0.0',
        type: projectType,
        group: GROUP,
        devDependencies: {}
      };

      if (useTypescript) packageJson.devDependencies.typescript = '^5.0.0';
      if (usePrettier) packageJson.devDependencies.prettier = '^3.0.0';

      fs.writeFileSync(
        path.join(projectDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      spinner.succeed(`Проект "${projectName}" успешно инициализирован!`);
      console.log(chalk.green(`  Тип: ${projectType}`));
      if (useTypescript) console.log(chalk.green(`  TypeScript: да`));
      if (usePrettier) console.log(chalk.green(`  Prettier: да`));
      if (useGit) console.log(chalk.green(`  Git: да`));
    }, 1000);
  });

// ============================================================
// ЗАДАНИЕ 4: Форматированный вывод
// ============================================================

// Команда build
program
  .command('build')
  .description('Сборка проекта')
  .option('--config <path>', 'путь к конфигурации', 'config.json')
  .action((options) => {
    // Проверка NODE_ENV
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    if (!fs.existsSync(options.config)) {
      if (nodeEnv === 'production') {
        console.error(chalk.red(`✖ Ошибка: файл ${options.config} не найден`));
      } else {
        console.error(chalk.red(`✖ Ошибка: ENOENT: no such file or directory, open '${options.config}'`));
        console.error(chalk.gray(`    at Object.openSync (fs.js:498:3)`));
      }
      process.exit(1);
    }

    const spinner = ora('Сборка проекта...').start();
    const startTime = Date.now();

    setTimeout(() => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      spinner.succeed(`Сборка завершена за ${duration}s`);
      console.log(chalk.green(`  Результат: dist/my-app.js`));
    }, 2300);
  });

// Команда test
program
  .command('test')
  .description('Запуск тестов')
  .action(() => {
    const spinner = ora('Запуск тестов...').start();
    const totalTests = 15;
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    
    spinner.stop();
    progressBar.start(totalTests, 0);

    let passed = 0;
    const interval = setInterval(() => {
      passed++;
      progressBar.update(passed);
      
      if (passed >= totalTests) {
        progressBar.stop();
        console.log(chalk.green(`\n✓ Пройдено: ${passed}/${totalTests} тестов`));
        console.log(chalk.green(`✓ Покрытие: 87%`));
        clearInterval(interval);
      }
    }, 150);
  });

// Команда deploy
program
  .command('deploy')
  .description('Развёртывание проекта')
  .option('-e, --env <environment>', 'окружение (development, production)', 'development')
  .action(async (options) => {
    if (options.env === 'production') {
      console.log(chalk.yellow('⚠ Вы собираетесь развернуть проект в production!'));
      
      if (process.stdin.isTTY) {
        const answer = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: 'Продолжить? (y/N)',
            default: false
          }
        ]);
        
        if (!answer.confirm) {
          console.log(chalk.gray('Развёртывание отменено'));
          return;
        }
      }
    }

    const spinner = ora('Развёртывание...').start();
    
    setTimeout(() => {
      spinner.succeed('Развёрнуто успешно');
      console.log(chalk.green(`  URL: https://my-app.example.com`));
      console.log(chalk.gray(`  Окружение: ${options.env}`));
    }, 2000);
  });

// ============================================================
// ЗАДАНИЕ 5: Обработка ошибок
// ============================================================

// Обработка неизвестных команд
program.on('command:*', (operands) => {
  console.error(chalk.red(`Ошибка: неизвестная команда "${operands[0]}"`));
  console.error(chalk.gray(`Для справки используйте: my-cli --help`));
  process.exit(1);
});

// Обработка ошибок
program.exitOverride();

try {
  program.parse(process.argv);
} catch (err) {
  if (err.code === 'commander.helpDisplayed' || err.code === 'commander.version') {
    // Это нормальные случаи, ничего не делаем
  } else {
    console.error(chalk.red(`✖ Ошибка: ${err.message}`));
    process.exit(1);
  }
}

// Если нет аргументов — показать справку
if (process.argv.length <= 2) {
  program.help();
}