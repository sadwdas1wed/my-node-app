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

/*
Порядок выполнения:
1. Синхронный код выполняется первым
2. process.nextTick - микрозадача, выполняется сразу после синхронного кода
3. Promise.then - микрозадача, выполняется после nextTick
4. setTimeout - макрозадача из фазы timers
5. setImmediate - макрозадача из фазы check
*/