const { EventEmitter } = require('events');

/**
 * Класс UserTracker - отслеживание действий пользователей через события
 */
class UserTracker extends EventEmitter {
    /**
     * Отслеживание действия пользователя
     * @param {string|number} userId
     * @param {string} action
     * @param {Object} metadata
     */
    trackAction(userId, action, metadata = {}) {
        const eventObject = {
            userId: userId,
            action: action,
            timestamp: new Date().toISOString(),
            metadata: metadata,
            id: Math.random().toString(36).substr(2, 9) // уникальный ID
        };

        this.emit('user:action', eventObject);
    }
}

// === ТЕСТОВЫЙ ЗАПУСК ===
const tracker = new UserTracker();

// Регистрируем обработчик
tracker.on('user:action', (data) => {
    const metadataStr = Object.keys(data.metadata).length > 0
        ? JSON.stringify(data.metadata)
        : 'нет';
    
    console.log(`\n👤 Пользователь ${data.userId} совершил действие "${data.action}"`);
    console.log(`   Время: ${data.timestamp}`);
    console.log(`   ID события: ${data.id}`);
    console.log(`   Доп. данные: ${metadataStr}`);
});

// Тестовые вызовы
tracker.trackAction('user_001', 'login', { ip: '192.168.1.1', browser: 'Chrome' });
tracker.trackAction('user_042', 'purchase', { itemId: 123, price: 999 });
tracker.trackAction('user_007', 'logout', { sessionDuration: 3600 });