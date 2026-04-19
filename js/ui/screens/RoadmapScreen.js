/**
 * RoadmapScreen - Экран дорожной карты
 * Отображение модулей, прогресса и навигация к квизам
 */

import { state } from '../../core/AppState.js';
import { DB, getModuleById } from '../../data/GameData.js';
import { navigateTo } from '../ScreenManager.js';
import { QuizEngine } from './QuizEngine.js';

/**
 * Инициализировать экран дорожной карты
 */
export function init() {
    // Можно добавить дополнительную логику инициализации
}

/**
 * Отрендерить дорожную карту
 */
export function render() {
    try {
        const container = document.getElementById('roadmapNodes');
        if (!container) return;
        
        container.innerHTML = '';
        
        const containerWidth = container.offsetWidth || 700;
        const nodeSpacing = 320;
        const centerX = containerWidth / 2;
        const nodePositions = [];
        
        // Позиционируем модули зигзагом
        DB.modules.forEach((mod, index) => {
            const offset = index % 2 === 0 ? -220 : 220;
            nodePositions.push({ 
                x: centerX + offset, 
                y: 150 + (index * nodeSpacing), 
                index, 
                mod 
            });
        });
        
        // Рисуем соединительные линии (шарики на пути)
        for (let i = 0; i < nodePositions.length - 1; i++) {
            const start = nodePositions[i];
            const end = nodePositions[i + 1];
            
            for (let j = 1; j <= 3; j++) {
                const t = j / 4;
                const ball = document.createElement('div');
                ball.className = `path-ball ${j % 2 === 0 ? 'medium' : 'small'}`;
                ball.style.left = `${start.x + (end.x - start.x) * t}px`;
                ball.style.top = `${start.y + (end.y - start.y) * t}px`;
                container.appendChild(ball);
            }
        }
        
        // Рендерим узлы модулей
        nodePositions.forEach(({ x, y, index, mod }) => {
            const modState = state.progress[mod.id] || { levelIndex: 0, attempts: 0, gold: false, completed: false };
            const prevMod = getModuleById(mod.id - 1);
            const prevDone = prevMod ? (state.progress[prevMod.id]?.completed) : true;
            const isLocked = !prevDone && mod.id !== 9;
            
            let statusClass = modState.completed ? 'completed' : (modState.levelIndex > 0 || mod.id === 9 ? 'current' : '');
            if (isLocked) statusClass = 'locked';
            
            const totalLevels = mod.levels || 3;
            const progressDots = Array.from({ length: totalLevels }, (_, i) => {
                let dotClass = 'progress-dot';
                if (i < modState.levelIndex) dotClass += ' completed';
                if (i === modState.levelIndex && !isLocked) dotClass += ' current';
                return `<div class="${dotClass}"></div>`;
            }).join('');
            
            const cardOffset = index % 2 === 0 ? 140 : -300;
            
            const nodeHTML = `
                <div class="roadmap-node ${statusClass}" 
                     style="left:${x-45}px;top:${y-45}px;" 
                     onclick="${isLocked ? '' : `window.openModule(${mod.id})`}">
                    ${modState.gold ? '<div class="gold-crown">👑</div>' : ''}
                    ${isLocked ? '<div class="node-lock">🔒</div>' : ''}
                    ${modState.levelIndex === 0 && mod.id === 9 ? '<div class="start-button">▶ START</div>' : ''}
                    <div class="node-circle">${mod.id}<div class="node-number">${mod.icon}</div></div>
                    <div class="node-info" style="left:${cardOffset}px;">
                        <div class="node-title">${mod.title}</div>
                        <div class="node-subtitle">${mod.subtitle}</div>
                        <div class="node-progress">${progressDots}</div>
                        ${modState.completed ? '<div style="margin-top:10px;font-size:0.75rem;color:var(--success);font-weight:600;">✅ Пройдено</div>' : ''}
                    </div>
                </div>`;
            
            container.innerHTML += nodeHTML;
        });
        
        // Добавляем нижний отступ
        const lastNode = nodePositions[nodePositions.length - 1];
        if (lastNode) {
            const spacer = document.createElement('div');
            spacer.style.cssText = `height:250px;position:absolute;left:0;top:${lastNode.y+150}px;width:100%;`;
            container.appendChild(spacer);
        }
    } catch (e) {
        console.error('Ошибка рендера дорожной карты:', e);
    }
}

/**
 * Открыть модуль для прохождения
 * @param {number} modId - ID модуля
 */
export function openModule(modId) {
    try {
        const mod = getModuleById(modId);
        const modState = state.progress[modId] || { levelIndex: 0, attempts: 0, gold: false, completed: false };
        
        if (modState.completed) {
            showToast('✅ Модуль уже пройден!');
            return;
        }
        
        const topicName = mod.topics[modState.levelIndex] || `Уровень ${modState.levelIndex + 1}`;
        let qs = DB.questions[modId]?.filter(q => q.level === (modState.levelIndex + 1)) || [];
        
        if (qs.length === 0) {
            qs = [{ 
                level: modState.levelIndex + 1, 
                q: `Вопрос уровня ${modState.levelIndex + 1}`, 
                options: ["Верно", "Неверно", "Не знаю"], 
                correct: 0, 
                explanation: "Правильный ответ." 
            }];
        }
        
        // Инициализируем квиз
        QuizEngine.startQuiz(modId, modState.levelIndex + 1, topicName, qs);
        
        // Переходим на экран квиза
        navigateTo('quiz');
    } catch (e) {
        console.error('Ошибка открытия модуля:', e);
    }
}

// Экспортируем функцию глобально для использования в HTML
if (typeof window !== 'undefined') {
    window.openModule = openModule;
}

/**
 * Показать toast уведомление
 * @param {string} msg 
 */
function showToast(msg) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.innerText = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}
