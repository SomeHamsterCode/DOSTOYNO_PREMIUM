/**
 * Storage - Безопасное сохранение и загрузка данных
 * Использует localStorage с обработкой ошибок и fallback в память
 */

// Временное хранилище в памяти (fallback если localStorage недоступен)
const tempStorage = {};

/**
 * Безопасно сохранить данные в localStorage
 * @param {string} key - ключ для сохранения
 * @param {any} data - данные для сохранения
 * @returns {boolean} - успешно ли сохранено
 */
export function safeSave(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Ошибка сохранения в localStorage:', e);
        tempStorage[key] = data;
        return false;
    }
}

/**
 * Безопасно загрузить данные из localStorage
 * @param {string} key - ключ для загрузки
 * @returns {any|null} - загруженные данные или null
 */
export function safeLoad(key) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : (tempStorage[key] || null);
    } catch (e) {
        console.error('Ошибка загрузки из localStorage:', e);
        return tempStorage[key] || null;
    }
}

/**
 * Удалить данные из localStorage
 * @param {string} key - ключ для удаления
 */
export function removeData(key) {
    try {
        localStorage.removeItem(key);
        delete tempStorage[key];
    } catch (e) {
        console.error('Ошибка удаления из localStorage:', e);
        delete tempStorage[key];
    }
}

/**
 * Очистить всё временное хранилище
 */
export function clearTempStorage() {
    Object.keys(tempStorage).forEach(key => {
        delete tempStorage[key];
    });
}
