/**
 * Демонстрация порядка выполнения асинхронных операций в Node.js
 * 
 * ОБЪЯСНЕНИЕ ПОРЯДКА ВЫВОДА:
 * 
 * 1. Сначала выполняется ВЕСЬ СИНХРОННЫЙ код (5. Синхронный код)
 *    - Это фаза выполнения скрипта, всё что написано "прямо" выполняется первым.
 * 
 * 2. Затем отрабатывает очередь microtasks:
 *    - process.nextTick имеет ПРИОРИТЕТ над Promise.then (3 перед 4)
 *    - Promise.resolve().then() идёт следующим (4)
 *    - Microtasks выполняются ПОЛНОСТЬЮ перед переходом к macrotasks.
 * 
 * 3. Затем переходим к macrotasks (таймеры):
 *    - setTimeout попадает в фазу "timers" цикла событий (1)
 *    - setImmediate выполняется в фазе "check" (2)
 *    - ВАЖНО: порядок setTimeout(0) и setImmediate() вне I/O цикла
 *      НЕ ГАРАНТИРОВАН, но обычно setTimeout идёт первым, если запущен
 *      из главного модуля (а не из I/O callback).
 * 
 * Итоговый порядок: 5 → 3 → 4 → 1 → 2
 */

console.log('5. Синхронный код');

setTimeout(() => {
    console.log('1. setTimeout');
}, 0);

setImmediate(() => {
    console.log('2. setImmediate');
});

process.nextTick(() => {
    console.log('3. process.nextTick');
});

Promise.resolve().then(() => {
    console.log('4. Promise.then');
});