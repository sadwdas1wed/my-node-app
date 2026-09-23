const { EventEmitter } = require('events');

class UserTracker extends EventEmitter {
  constructor() {
    super();
    this.on('user:action', (data) => {
      console.log(`\n👤 Пользователь ${data.userId} совершил действие "${data.action}"`);
      console.log(`   Время: ${data.timestamp}`);
      console.log(`   ID события: ${data.id}`);
      console.log(`   Доп. данные:`, JSON.stringify(data.metadata));
      console.log('---');
    });
  }

  trackAction(userId, action, metadata = {}) {
    const event = {
      userId,
      action,
      timestamp: new Date().toISOString(),
      metadata,
      id: Math.random().toString(36).substr(2, 9)
    };
    this.emit('user:action', event);
  }
}

const tracker = new UserTracker();

tracker.trackAction('user123', 'login', { ip: '192.168.1.1', browser: 'Chrome' });
tracker.trackAction('user456', 'purchase', { productId: 'prod789', amount: 1500 });
tracker.trackAction('user123', 'logout', { sessionDuration: '45min' });