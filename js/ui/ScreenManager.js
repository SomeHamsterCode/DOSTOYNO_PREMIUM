/**
 * ScreenManager - Управление экранами приложения
 * Позволяет легко добавлять новые виды и переключаться между ними
 */

import { EventBus } from '../core/AppState.js';

// Реестр доступных экранов
const screens = new Map();

// Текущий активный экран
let currentScreen = null;

/**
 * Зарегистрировать новый экран
 * @param {string} id - уникальный идентификатор экрана
 * @param {object} screenConfig - конфигурация экрана
 * @param {function} screenConfig.render - функция рендеринга
 * @param {function} screenConfig.init - функция инициализации (опционально)
 * @param {function} screenConfig.destroy - функция очистки (опционально)
 */
export function registerScreen(id, screenConfig) {
    if (screens.has(id)) {
        console.warn(`Экран "${id}" уже зарегистрирован`);
    }
    screens.set(id, screenConfig);
}

/**
 * Переключиться на указанный экран
 * @param {string} screenId - ID экрана для перехода
 * @param {any} params - параметры для передачи в экран
 */
export function navigateTo(screenId, params = {}) {
    // Если уже на этом экране, ничего не делаем
    if (currentScreen === screenId) {
        return;
    }
    
    // Уничтожаем текущий экран
    if (currentScreen) {
        const prevScreen = screens.get(currentScreen);
        if (prevScreen && prevScreen.destroy) {
            prevScreen.destroy();
        }
    }
    
    // Скрываем все страницы
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Показываем целевую страницу
    const targetPage = document.getElementById(`page-${screenId}`);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Обновляем навигацию
        updateNavigation(screenId);
        
        // Инициализируем новый экран
        const screen = screens.get(screenId);
        if (screen) {
            if (screen.init) {
                screen.init(params);
            }
            if (screen.render) {
                screen.render(params);
            }
            currentScreen = screenId;
            
            // Прокручиваем вверх
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.scrollTop = 0;
            }
        } else {
            console.warn(`Экран "${screenId}" не найден`);
        }
    } else {
        console.warn(`Страница "page-${screenId}" не найдена в DOM`);
    }
}

/**
 * Обновить визуальное состояние навигации
 * @param {string} activeScreenId - ID активного экрана
 */
function updateNavigation(activeScreenId) {
    // Сбрасываем активный класс у всех элементов навигации
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
    });
    
    // Находим соответствующий элемент навигации
    const navMap = {
        'roadmap': 0,
        'city': 1,
        'shop': 2,
        'profile': 3
    };
    
    const navIndex = navMap[activeScreenId];
    if (navIndex !== undefined) {
        const navItems = document.querySelectorAll('.nav-item');
        if (navItems[navIndex]) {
            navItems[navIndex].classList.add('active');
        }
    }
}

/**
 * Получить текущий активный экран
 * @returns {string|null}
 */
export function getCurrentScreen() {
    return currentScreen;
}

/**
 * Перерисовать текущий экран
 */
export function rerenderCurrentScreen() {
    if (currentScreen) {
        const screen = screens.get(currentScreen);
        if (screen && screen.render) {
            screen.render();
        }
    }
}

/**
 * Подписаться на события навигации
 * @param {function} callback - функция обратного вызова
 */
export function onNavigate(callback) {
    return EventBus.subscribe('navigate', callback);
}

/**
 * Опубликовать событие навигации
 * @param {string} screenId - ID экрана
 */
export function publishNavigate(screenId) {
    EventBus.publish('navigate', screenId);
}
