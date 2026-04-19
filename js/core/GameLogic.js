/**
 * GameLogic - Игровая логика и расчёты
 * Доход, бонусы, проверки достижений
 */

import { DB } from '../data/GameData.js';
import { state } from './AppState.js';

/**
 * Рассчитать общий доход от зданий и экипировки
 * @returns {number} - доход в секунду
 */
export function calculateIncome() {
    let income = 0;
    
    // Доход от зданий
    DB.buildings.forEach(building => {
        if (state.buildings[building.id]) {
            income += state.buildings[building.id].count * building.income;
        }
    });
    
    // Бонусы от экипировки
    ['hair', 'clothes', 'acc'].forEach(type => {
        if (state.equipped[type]) {
            const item = DB.shopItems.find(i => i.id === state.equipped[type]);
            if (item) {
                income += item.bonus;
            }
        }
    });
    
    return income;
}

/**
 * Рассчитать бонус к доходу от экипировки
 * @returns {number} - бонус
 */
export function calculateBonus() {
    let bonus = 0;
    
    ['hair', 'clothes', 'acc'].forEach(type => {
        if (state.equipped[type]) {
            const item = DB.shopItems.find(item => item.id === state.equipped[type]);
            if (item) {
                bonus += item.bonus;
            }
        }
    });
    
    return bonus;
}

/**
 * Получить иконку аватара на основе экипировки
 * @returns {string} - emoji иконка
 */
export function getAvatarIcon() {
    let icon = '🧑‍🎓';
    
    if (state.equipped.hair) {
        const hairItem = DB.shopItems.find(item => item.id === state.equipped.hair);
        if (hairItem) {
            icon = hairItem.icon;
        }
    }
    
    return icon;
}

/**
 * Проверить и разблокировать достижение
 * @param {string} achievementId - ID достижения
 * @returns {boolean} - было ли достижение разблокировано
 */
export function checkAchievement(achievementId) {
    if (!state.achievements.includes(achievementId)) {
        state.achievements.push(achievementId);
        return true; // Достижение только что разблокировано
    }
    return false; // Уже было разблокировано
}

/**
 * Проверить условия для автоматических достижений
 */
export function checkAutoAchievements() {
    const achievements = [];
    
    // Богач - накопить 10000 монет
    if (state.coins >= 10000 && !state.achievements.includes('rich')) {
        achievements.push('rich');
    }
    
    // Неделя подряд - 7 дней стрик
    if (state.streak >= 7 && !state.achievements.includes('streak_7')) {
        achievements.push('streak_7');
    }
    
    return achievements;
}

/**
 * Получить список всех достижений с их статусом
 * @returns {Array} - массив достижений
 */
export function getAllAchievements() {
    const achievementsList = [
        { id: 'first_blood', icon: '🎯', name: 'Первая кровь', desc: 'Реши первый тест' },
        { id: 'magnate', icon: '💰', name: 'Магнат', desc: 'Купи 5 зданий' },
        { id: 'gold_student', icon: '⭐', name: 'Золотой студент', desc: 'Получи золото в задании' },
        { id: 'module_complete', icon: '📚', name: 'Эрудит', desc: 'Заверши модуль' },
        { id: 'rich', icon: '🏆', name: 'Богач', desc: 'Накопи 10000 монет' },
        { id: 'streak_7', icon: '🔥', name: 'Неделя подряд', desc: '7 дней стрик' }
    ];
    
    return achievementsList.map(ach => ({
        ...ach,
        unlocked: state.achievements.includes(ach.id) || 
                  (ach.id === 'rich' && state.coins >= 10000) ||
                  (ach.id === 'streak_7' && state.streak >= 7)
    }));
}
