/**
 * AppState - Центральное хранилище состояния приложения
 * Использует Proxy для реактивного обновления UI при изменении данных
 */

// Подписчики на изменения состояния
const subscribers = new Set();

// Исходное состояние приложения
const initialState = {
    username: "",
    coins: 0,
    xp: 0,
    level: 1,
    streak: 0,
    lastLogin: null,
    dailyRewardClaimed: false,
    buildings: {},
    cityBalance: 0,
    inventory: ['hair_default', 'cloth_default', 'acc_none'],
    equipped: { hair: 'hair_default', clothes: 'cloth_default', acc: 'acc_none' },
    progress: {},
    achievements: [],
    soundEnabled: true,
    notificationsEnabled: true,
    mapZoom: 1,
    buildingPositions: {},
    
    // 🔋 Бесконечные ресурсы (для упрощения геймплея)
    lives: 999,
    maxLives: 999,
    energy: 999,
    maxEnergy: 999
};

// Текущее состояние
let currentState = { ...initialState };

/**
 * Pub/Sub система для уведомлений об изменениях
 */
export const EventBus = {
    /**
     * Подписаться на событие
     * @param {string} event - имя события
     * @param {function} callback - функция обратного вызова
     */
    subscribe(event, callback) {
        if (!this.events) this.events = {};
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
        return () => this.unsubscribe(event, callback);
    },
    
    /**
     * Отписаться от события
     * @param {string} event - имя события
     * @param {function} callback - функция обратного вызова
     */
    unsubscribe(event, callback) {
        if (this.events && this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    },
    
    /**
     * Опубликовать событие
     * @param {string} event - имя события
     * @param {any} data - данные события
     */
    publish(event, data) {
        if (this.events && this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
};

/**
 * Создает реактивный прокси для состояния
 * При изменении любого свойства автоматически уведомляет подписчиков
 */
function createReactiveState() {
    return new Proxy(currentState, {
        set(target, property, value) {
            const oldValue = target[property];
            target[property] = value;
            
            // Уведомляем подписчиков об изменении
            subscribers.forEach(callback => callback(property, value, oldValue));
            
            // Публикуем событие для конкретных свойств
            EventBus.publish(`state:${property}`, { value, oldValue });
            EventBus.publish('state:changed', { property, value, oldValue });
            
            return true;
        },
        
        get(target, property) {
            return target[property];
        }
    });
}

// Создаем реактивный объект состояния
export const state = createReactiveState();

/**
 * Подписаться на изменения состояния
 * @param {function} callback - функция, вызываемая при изменении
 * @returns {function} - функция отписки
 */
export function subscribeToState(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
}

/**
 * Получить полное текущее состояние
 * @returns {object}
 */
export function getState() {
    return { ...currentState };
}

/**
 * Обновить несколько полей состояния сразу
 * @param {object} updates - объект с полями для обновления
 */
export function updateState(updates) {
    Object.entries(updates).forEach(([key, value]) => {
        state[key] = value;
    });
}

/**
 * Сбросить состояние к начальному
 */
export function resetState() {
    Object.keys(currentState).forEach(key => {
        delete currentState[key];
    });
    Object.assign(currentState, { ...initialState });
}

/**
 * Инициализировать состояние из сохраненных данных
 * @param {object} savedData - сохраненные данные
 */
export function loadState(savedData) {
    if (!savedData) return;
    
    // Объединяем с начальным состоянием для миграции старых версий
    const merged = { ...initialState, ...savedData };
    
    // Миграция для старых сохранений
    if (merged.lives === undefined) merged.lives = 999;
    if (merged.energy === undefined) merged.energy = 999;
    if (merged.maxLives === undefined) merged.maxLives = 999;
    if (merged.maxEnergy === undefined) merged.maxEnergy = 999;
    
    updateState(merged);
}
