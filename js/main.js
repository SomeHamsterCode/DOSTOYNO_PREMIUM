/**
 * main.js - Точка входа приложения
 * Инициализирует все модули и запускает приложение
 */

// Импорт основных модулей
import { state, loadState, subscribeToState, EventBus } from './core/AppState.js';
import { safeSave, safeLoad, removeData, clearTempStorage } from './core/Storage.js';
import { calculateIncome, calculateBonus, checkAchievement, checkAutoAchievements } from './core/GameLogic.js';
import { navigateTo, registerScreen, rerenderCurrentScreen } from './ui/ScreenManager.js';
import { updateUI, showToast, showCelebration } from './ui/UIComponents.js';
import { DB } from './data/GameData.js';

// Импорт экранов
import * as RoadmapScreen from './ui/screens/RoadmapScreen.js';
import { QuizEngine } from './ui/screens/QuizEngine.js';

// ============================================
// ГЛОБАЛЬНЫЕ ФУНКЦИИ (для доступа из HTML)
// ============================================

// Делаем функции доступными глобально для onclick обработчиков
window.navTo = navigateTo;
window.showToast = showToast;
window.showCelebration = showCelebration;
window.calculateIncome = calculateIncome;
window.calculateBonus = calculateBonus;

// ============================================
// СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// ============================================

// Ключ сохранения
const SAVE_KEY = 'dostoino_save_v4';

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

/**
 * Инициализировать приложение
 */
function init() {
    console.log('🚀 Инициализация приложения...');
    
    try {
        // Загружаем сохранённые данные
        const saved = safeLoad(SAVE_KEY);
        
        if (saved) {
            loadState(saved);
            
            // Проверяем, был ли уже начат прогресс
            const onboarding = document.getElementById('page-onboarding');
            const appInterface = document.getElementById('app-interface');
            
            if (onboarding && appInterface && state.username) {
                onboarding.style.display = 'none';
                appInterface.style.display = 'block';
                
                updateUI();
                startGameLoop();
                checkDailyReward();
                navigateTo('roadmap');
            }
        }
        
        // Регистрируем экраны
        registerScreen('roadmap', RoadmapScreen);
        
        // Подписываемся на изменения состояния для авто-обновления UI
        subscribeToState((property, value, oldValue) => {
            // Обновляем UI при изменении ключевых полей
            const uiFields = ['coins', 'xp', 'level', 'streak', 'cityBalance', 'equipped', 'buildings'];
            if (uiFields.includes(property)) {
                updateUI();
            }
        });
        
        console.log('✅ Приложение инициализировано');
    } catch (e) {
        console.error('❌ Критическая ошибка инициализации:', e);
    }
}

/**
 * Начать новую игру
 */
function startGame() {
    const nameInput = document.getElementById('usernameInput');
    const name = nameInput ? nameInput.value.trim() : '';
    
    if (!name || name.length < 2) {
        showToast('⚠️ Имя должно быть не менее 2 символов');
        return;
    }
    
    // Инициализируем состояние
    state.username = name;
    state.lastLogin = new Date().toDateString();
    state.streak = 1;
    state.coins = 150;
    state.lives = 999;
    state.energy = 999;
    
    // Сохраняем
    saveGame();
    
    // Переключаем интерфейс
    const onboarding = document.getElementById('page-onboarding');
    const appInterface = document.getElementById('app-interface');
    
    if (onboarding && appInterface) {
        onboarding.style.opacity = '0';
        setTimeout(() => {
            onboarding.style.display = 'none';
            appInterface.style.display = 'block';
            setTimeout(() => {
                appInterface.style.opacity = '1';
                updateUI();
                startGameLoop();
                navigateTo('roadmap');
            }, 50);
        }, 300);
    }
    
    showToast('🎉 Добро пожаловать в ДОСТОЙНО!');
}

/**
 * Сохранить игру
 */
function saveGame() {
    try {
        const saveData = {
            username: state.username,
            coins: state.coins,
            xp: state.xp,
            level: state.level,
            streak: state.streak,
            lastLogin: state.lastLogin,
            dailyRewardClaimed: state.dailyRewardClaimed,
            buildings: state.buildings,
            cityBalance: state.cityBalance,
            inventory: state.inventory,
            equipped: state.equipped,
            progress: state.progress,
            achievements: state.achievements,
            soundEnabled: state.soundEnabled,
            notificationsEnabled: state.notificationsEnabled,
            mapZoom: state.mapZoom,
            buildingPositions: state.buildingPositions,
            lives: state.lives,
            maxLives: state.maxLives,
            energy: state.energy,
            maxEnergy: state.maxEnergy
        };
        
        safeSave(SAVE_KEY, saveData);
        updateUI();
    } catch (e) {
        console.error('❌ Ошибка сохранения:', e);
        showToast('⚠️ Не удалось сохранить прогресс');
    }
}

/**
 * Сбросить прогресс
 */
function resetProgress() {
    if (confirm('⚠️ Вы уверены? Весь прогресс будет удален безвозвратно.')) {
        try {
            removeData(SAVE_KEY);
            clearTempStorage();
            location.reload();
        } catch (e) {
            console.error('Ошибка сброса прогресса:', e);
        }
    }
}

// ============================================
// ИГРОВОЙ ЦИКЛ
// ============================================

/**
 * Запустить игровой цикл (доход города)
 */
function startGameLoop() {
    setInterval(() => {
        try {
            const income = calculateIncome();
            if (income > 0) {
                state.coins += income;
                state.cityBalance += income;
                saveGame();
            }
        } catch (e) {
            console.error('Ошибка игрового цикла:', e);
        }
    }, 1000);
}

/**
 * Проверить ежедневную награду
 */
function checkDailyReward() {
    try {
        const today = new Date().toDateString();
        
        if (state.lastLogin !== today && !state.dailyRewardClaimed) {
            state.streak++;
            state.coins += 50;
            state.dailyRewardClaimed = true;
            state.lastLogin = today;
            showToast('🎁 Ежедневная награда: +50 🪙');
            saveGame();
        } else if (state.lastLogin === today) {
            state.dailyRewardClaimed = true;
        }
    } catch (e) {
        console.error('Ошибка проверки ежедневной награды:', e);
    }
}

// ============================================
// ГОРОД - ФУНКЦИИ
// ============================================

let selectedBuildingForPlacement = null;

/**
 * Отрендерить город
 */
function renderCity() {
    try {
        const grid = document.getElementById('buildingsGrid');
        const mapGrid = document.getElementById('mapGrid');
        
        if (!grid || !mapGrid) return;
        
        grid.innerHTML = '';
        mapGrid.innerHTML = '';
        
        // Рендерим сетку карты
        for (let i = 0; i < 25; i++) {
            const cell = document.createElement('div');
            cell.className = 'map-cell';
            cell.dataset.index = i;
            
            let buildingHere = null;
            for (const [buildingId, positions] of Object.entries(state.buildingPositions)) {
                if (positions.includes(i)) {
                    const b = DB.buildings.find(x => x.id === buildingId);
                    if (b) {
                        buildingHere = b;
                        break;
                    }
                }
            }
            
            if (buildingHere) {
                cell.classList.add('occupied');
                cell.innerHTML = `${buildingHere.icon}<span class="building-count">${state.buildings[buildingHere.id].count}</span>`;
                cell.onclick = () => showBuildingInfo(buildingHere);
            } else {
                cell.innerHTML = '📍';
                cell.onclick = () => placeBuilding(i);
            }
            
            mapGrid.appendChild(cell);
        }
        
        // Рендерим магазин зданий
        DB.buildings.forEach(b => {
            const owned = state.buildings[b.id] || { count: 0, level: 1 };
            const canBuy = state.coins >= b.cost;
            
            grid.innerHTML += `
                <div class="building-card ${owned.count > 0 ? 'owned' : ''}">
                    <span class="building-icon">${b.icon}</span>
                    <div class="building-name">${b.name}</div>
                    <div class="building-income">+${b.income} 🪙/сек</div>
                    <div class="building-level">Уровень: ${owned.level}</div>
                    <div class="building-cost">${b.cost.toLocaleString()} 🪙</div>
                    <div style="font-size:0.75rem; color:var(--text-sec); margin-bottom:10px;">У вас: ${owned.count}</div>
                    <button class="btn-buy" ${!canBuy ? 'disabled' : ''} onclick="buyBuilding('${b.id}')">
                        ${canBuy ? 'Купить' : 'Не хватает'}
                    </button>
                </div>`;
        });
    } catch (e) {
        console.error('Ошибка рендера города:', e);
    }
}

/**
 * Купить здание
 * @param {string} id - ID здания
 */
function buyBuilding(id) {
    try {
        const b = DB.buildings.find(x => x.id === id);
        
        if (state.coins >= b.cost) {
            state.coins -= b.cost;
            
            if (!state.buildings[id]) {
                state.buildings[id] = { count: 0, level: 1 };
            }
            
            state.buildings[id].count++;
            state.buildings[id].level = Math.min(state.buildings[id].level + 1, 10);
            b.cost = Math.floor(b.cost * 1.15);
            
            selectedBuildingForPlacement = id;
            showToast(`🏗️ ${b.name} куплено! Выберите место на карте.`);
            
            saveGame();
            renderCity();
            
            // Проверка достижения "Магнат"
            const totalBuildings = Object.values(state.buildings).reduce((sum, b) => sum + b.count, 0);
            if (totalBuildings >= 5) {
                checkAchievement('magnate');
            }
        } else {
            showToast('❌ Недостаточно монет!');
        }
    } catch (e) {
        console.error('Ошибка покупки здания:', e);
    }
}

/**
 * Разместить здание
 * @param {number} cellIndex - индекс ячейки
 */
function placeBuilding(cellIndex) {
    try {
        if (!selectedBuildingForPlacement) {
            showToast('⚠️ Сначала купите здание!');
            return;
        }
        
        // Проверяем, занята ли ячейка
        for (const positions of Object.values(state.buildingPositions)) {
            if (positions.includes(cellIndex)) {
                showToast('⚠️ Эта ячейка занята!');
                return;
            }
        }
        
        // Размещаем здание
        if (!state.buildingPositions[selectedBuildingForPlacement]) {
            state.buildingPositions[selectedBuildingForPlacement] = [];
        }
        state.buildingPositions[selectedBuildingForPlacement].push(cellIndex);
        
        selectedBuildingForPlacement = null;
        showToast('🏗️ Здание размещено!');
        
        saveGame();
        renderCity();
    } catch (e) {
        console.error('Ошибка размещения здания:', e);
    }
}

/**
 * Показать информацию о здании
 * @param {object} building - объект здания
 */
function showBuildingInfo(building) {
    const count = state.buildings[building.id].count;
    const income = count * building.income;
    alert(`📊 ${building.name}\n\nКоличество: ${count}\nДоход: ${income} 🪙/сек\nУровень: ${state.buildings[building.id].level}`);
}

/**
 * Увеличить/уменьшить масштаб карты
 * @param {number} direction - направление (+1 или -1)
 */
function zoomMap(direction) {
    state.mapZoom += direction * 0.1;
    state.mapZoom = Math.max(0.5, Math.min(2, state.mapZoom));
    
    const grid = document.getElementById('mapGrid');
    if (grid) {
        grid.style.transform = `scale(${state.mapZoom})`;
    }
    
    saveGame();
}

/**
 * Сбросить масштаб карты
 */
function resetMap() {
    state.mapZoom = 1;
    const grid = document.getElementById('mapGrid');
    if (grid) {
        grid.style.transform = 'scale(1)';
    }
    saveGame();
}

// ============================================
// МАГАЗИН - ФУНКЦИИ
// ============================================

/**
 * Отрендерить магазин
 * @param {string} filter - фильтр категории
 */
function renderShop(filter = 'all') {
    try {
        const grid = document.getElementById('shopGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        let count = 0;
        
        DB.shopItems.forEach(item => {
            if (filter !== 'all' && item.type !== filter) return;
            
            const owned = state.inventory.includes(item.id);
            const equipped = state.equipped[item.type] === item.id;
            count++;
            
            grid.innerHTML += `
                <div class="shop-item ${owned ? 'owned' : 'locked'} ${equipped ? 'equipped' : ''}" 
                     onclick="handleShopClick('${item.id}')">
                    <span class="shop-icon">${item.icon}</span>
                    <div class="shop-name">${item.name}</div>
                    <div class="shop-bonus">+${item.bonus}/сек</div>
                    <div class="shop-price">
                        ${owned ? (equipped ? '✓ Выбрано' : 'Надеть') : item.cost + ' 🪙'}
                    </div>
                </div>`;
        });
        
        const countEl = document.getElementById('shopCount');
        if (countEl) countEl.innerText = `${count} предметов`;
        
        updateUI();
    } catch (e) {
        console.error('Ошибка рендера магазина:', e);
    }
}

/**
 * Фильтровать товары в магазине
 * @param {string} type - тип товара
 */
function filterShop(type) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    renderShop(type);
}

/**
 * Обработать клик по товару
 * @param {string} id - ID товара
 */
function handleShopClick(id) {
    try {
        const item = DB.shopItems.find(i => i.id === id);
        const owned = state.inventory.includes(id);
        
        if (owned) {
            // Надеваем предмет
            state.equipped[item.type] = id;
            saveGame();
            renderShop();
            showToast(`✅ ${item.name} надето`);
        } else {
            // Покупаем предмет
            if (state.coins >= item.cost) {
                state.coins -= item.cost;
                state.inventory.push(id);
                state.equipped[item.type] = id;
                saveGame();
                renderShop();
                showToast(`🛒 Куплено: ${item.name}`);
            } else {
                showToast('❌ Недостаточно монет!');
            }
        }
    } catch (e) {
        console.error('Ошибка обработки клика в магазине:', e);
    }
}

/**
 * Сохранить внешний вид аватара
 */
function saveAvatar() {
    showToast('💾 Внешность сохранена!');
}

/**
 * Сбросить внешний вид аватара
 */
function resetAvatar() {
    state.equipped = { hair: 'hair_default', clothes: 'cloth_default', acc: 'acc_none' };
    saveGame();
    renderShop();
    showToast('🔄 Внешность сброшена');
}

// ============================================
// ПРОФИЛЬ - ФУНКЦИИ
// ============================================

/**
 * Отрендерить профиль
 */
function renderProfile() {
    try {
        updateUI();
        
        const list = document.getElementById('achievementsList');
        if (!list) return;
        
        list.innerHTML = '';
        
        const achievements = [
            { id: 'first_blood', icon: '🎯', name: 'Первая кровь', desc: 'Реши первый тест', unlocked: state.achievements.includes('first_blood') },
            { id: 'magnate', icon: '💰', name: 'Магнат', desc: 'Купи 5 зданий', unlocked: state.achievements.includes('magnate') },
            { id: 'gold_student', icon: '⭐', name: 'Золотой студент', desc: 'Получи золото в задании', unlocked: state.achievements.includes('gold_student') },
            { id: 'module_complete', icon: '📚', name: 'Эрудит', desc: 'Заверши модуль', unlocked: state.achievements.includes('module_complete') },
            { id: 'rich', icon: '🏆', name: 'Богач', desc: 'Накопи 10000 монет', unlocked: state.coins >= 10000 },
            { id: 'streak_7', icon: '🔥', name: 'Неделя подряд', desc: '7 дней стрик', unlocked: state.streak >= 7 }
        ];
        
        achievements.forEach(ach => {
            list.innerHTML += `
                <div class="achievement-item ${ach.unlocked ? 'unlocked' : 'locked'}">
                    <span class="ach-icon">${ach.unlocked ? ach.icon : '🔒'}</span>
                    <div>
                        <strong>${ach.name}</strong>
                        <p>${ach.desc}</p>
                    </div>
                </div>`;
        });
    } catch (e) {
        console.error('Ошибка рендера профиля:', e);
    }
}

// ============================================
// ЭКСПОРТ ГЛОБАЛЬНЫХ ФУНКЦИЙ
// ============================================

window.startGame = startGame;
window.resetProgress = resetProgress;
window.renderCity = renderCity;
window.buyBuilding = buyBuilding;
window.placeBuilding = placeBuilding;
window.showBuildingInfo = showBuildingInfo;
window.zoomMap = zoomMap;
window.resetMap = resetMap;
window.renderShop = renderShop;
window.filterShop = filterShop;
window.handleShopClick = handleShopClick;
window.saveAvatar = saveAvatar;
window.resetAvatar = resetAvatar;
window.renderProfile = renderProfile;

// Экспортируем QuizEngine для использования в RoadmapScreen
window.QuizEngine = QuizEngine;

// ============================================
// ЗАПУСК ПРИЛОЖЕНИЯ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 DOM загружен, запускаем приложение...');
    
    try {
        init();
    } catch (e) {
        console.error('❌ Критическая ошибка при запуске:', e);
        alert('Произошла ошибка при загрузке приложения. Попробуйте обновить страницу.');
    }
});
