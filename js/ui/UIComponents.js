/**
 * UIComponents - Переиспользуемые UI компоненты
 * Toast уведомления, кнопки, карточки и т.д.
 */

import { state } from '../core/AppState.js';
import { getAvatarIcon } from '../core/GameLogic.js';

/**
 * Показать всплывающее уведомление (toast)
 * @param {string} message - текст уведомления
 * @param {number} duration - длительность в мс
 */
export function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.innerText = message;
        toast.classList.add('show');
        
        // Очищаем предыдущий таймер если есть
        if (toast.hideTimeout) {
            clearTimeout(toast.hideTimeout);
        }
        
        toast.hideTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }
}

/**
 * Обновить все элементы UI с данными из состояния
 */
export function updateUI() {
    try {
        // Элементы с простыми значениями
        const elements = {
            'coinDisplay': Math.floor(state.coins),
            'headerName': state.username,
            'headerLevel': state.level,
            'headerXP': state.xp % 100,
            'streakDisplay': state.streak,
            'profileName': state.username,
            'profileXp': state.xp % 100,
            'cityIncome': calculateIncomeDisplay(),
            'cityBalance': Math.floor(state.cityBalance),
            'avatarBonus': '+' + calculateBonusDisplay()
        };
        
        for (const [id, value] of Object.entries(elements)) {
            const el = document.getElementById(id);
            if (el) el.innerText = value;
        }
        
        // Обновляем аватарки
        const icon = getAvatarIcon();
        ['headerAvatar', 'shopAvatarPreview', 'profileAvatar', 'startAvatar'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = icon;
        });
        
        // Бесконечные ресурсы отображаются как ∞
        const livesEl = document.getElementById('livesDisplay');
        const energyEl = document.getElementById('energyDisplay');
        if (livesEl) livesEl.innerText = '∞';
        if (energyEl) energyEl.innerText = '∞';
        
        // Обновляем полоску XP
        const xpFill = document.getElementById('xpFill');
        if (xpFill) {
            const xpPercent = (state.xp % 100);
            xpFill.style.width = xpPercent + '%';
        }
    } catch (e) {
        console.error('Ошибка обновления UI:', e);
    }
}

/**
 * Рассчитать и отформатировать доход
 * @returns {string}
 */
function calculateIncomeDisplay() {
    let income = 0;
    
    if (typeof window.calculateIncome === 'function') {
        income = window.calculateIncome();
    }
    
    return income.toFixed(1) + ' 🪙/сек';
}

/**
 * Рассчитать и отформатировать бонус
 * @returns {string}
 */
function calculateBonusDisplay() {
    let bonus = 0;
    
    if (typeof window.calculateBonus === 'function') {
        bonus = window.calculateBonus();
    }
    
    return bonus.toFixed(1);
}

/**
 * Создать анимацию празднования (шарики)
 */
export function showCelebration() {
    try {
        const container = document.createElement('div');
        container.className = 'celebration-balloons';
        
        const colors = ['#7f2aff', '#ffcc00', '#2ed573', '#ff4757'];
        
        for (let i = 0; i < 15; i++) {
            const balloon = document.createElement('div');
            balloon.className = 'celebration-balloon';
            balloon.style.cssText = `
                position:absolute;
                left:${Math.random()*100}%;
                bottom:-150px;
                width:${60+Math.random()*40}px;
                height:${60+Math.random()*40}px;
                background:${colors[Math.floor(Math.random()*colors.length)]};
                border-radius:50%;
                animation:floatUp ${3+Math.random()*2}s ease-in forwards;
                z-index:9999;
            `;
            container.appendChild(balloon);
        }
        
        document.body.appendChild(container);
        
        // Удаляем контейнер после завершения анимации
        setTimeout(() => container.remove(), 6000);
    } catch (e) {
        console.error('Ошибка показа празднования:', e);
    }
}

/**
 * Показать модальное окно с пояснением
 * @param {string} title - заголовок
 * @param {string} content - содержимое
 */
export function showModal(title, content) {
    alert(`${title}\n\n${content}`);
}

/**
 * Подтвердить действие с пользователем
 * @param {string} message - сообщение для подтверждения
 * @returns {boolean}
 */
export function confirmAction(message) {
    return confirm(message);
}
