/**
 * QuizEngine - Движок для проведения квизов
 * Управление вопросами, ответами, подсчётом результатов
 */

import { state, EventBus } from '../../core/AppState.js';
import { DB } from '../../data/GameData.js';
import { calculateIncome } from '../../core/GameLogic.js';
import { safeSave } from '../../core/Storage.js';
import { showToast, showCelebration } from '../UIComponents.js';
import { navigateTo } from '../ScreenManager.js';

// Текущее состояние квиза
let quizState = {
    moduleId: null,
    level: 1,
    topic: null,
    questions: [],
    index: 0,
    correctCount: 0,
    streak: 0
};

// Выбранные варианты ответов
let selectedOptions = [];

/**
 * Начать новый квиз
 * @param {number} moduleId - ID модуля
 * @param {number} level - уровень сложности
 * @param {string} topic - тема
 * @param {Array} questions - массив вопросов
 */
export function startQuiz(moduleId, level, topic, questions) {
    quizState = {
        moduleId,
        level,
        topic,
        questions,
        index: 0,
        correctCount: 0,
        streak: 0
    };
    selectedOptions = [];
    
    renderQuestion();
}

/**
 * Отрендерить текущий вопрос
 */
export function renderQuestion() {
    try {
        const q = quizState.questions[quizState.index];
        
        // Обновляем заголовок квиза
        const taskNumEl = document.getElementById('quizTaskNum');
        const currentEl = document.getElementById('quizCurrent');
        const totalEl = document.getElementById('quizTotal');
        const streakEl = document.getElementById('quizStreak');
        const questionTextEl = document.getElementById('questionText');
        
        if (taskNumEl) taskNumEl.innerText = quizState.moduleId;
        if (currentEl) currentEl.innerText = quizState.index + 1;
        if (totalEl) totalEl.innerText = quizState.questions.length;
        if (streakEl) streakEl.innerText = quizState.streak;
        if (questionTextEl) questionTextEl.innerText = q.q;
        
        // Рендерим варианты ответов
        const optsContainer = document.getElementById('optionsContainer');
        if (optsContainer) {
            optsContainer.innerHTML = '';
            selectedOptions = [];
            
            q.options.forEach((opt, idx) => {
                const div = document.createElement('div');
                div.className = 'quiz-option';
                div.innerHTML = `<span class="option-number">${idx + 1}</span><span>${opt}</span>`;
                div.onclick = () => selectOption(idx, div);
                optsContainer.appendChild(div);
            });
        }
        
        // Показываем кнопку проверки, скрываем кнопку продолжения
        const checkBtn = document.getElementById('checkAnswerBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');
        const resultDiv = document.getElementById('quizResult');
        
        if (checkBtn) checkBtn.style.display = 'block';
        if (nextBtn) nextBtn.style.display = 'none';
        if (resultDiv) resultDiv.classList.add('hidden');
    } catch (e) {
        console.error('Ошибка рендера вопроса:', e);
    }
}

/**
 * Выбрать вариант ответа
 * @param {number} idx - индекс варианта
 * @param {HTMLElement} el - элемент варианта
 */
export function selectOption(idx, el) {
    try {
        const q = quizState.questions[quizState.index];
        const isMultipleChoice = Array.isArray(q.correct);
        
        if (isMultipleChoice) {
            // Множественный выбор
            if (selectedOptions.includes(idx)) {
                selectedOptions = selectedOptions.filter(i => i !== idx);
                el.classList.remove('selected');
            } else {
                selectedOptions.push(idx);
                el.classList.add('selected');
            }
        } else {
            // Единственный выбор
            selectedOptions = [idx];
            document.querySelectorAll('.quiz-option').forEach(d => d.classList.remove('selected'));
            el.classList.add('selected');
        }
    } catch (e) {
        console.error('Ошибка выбора варианта:', e);
    }
}

/**
 * Проверить ответ
 */
export function checkAnswer() {
    try {
        if (selectedOptions.length === 0) {
            showToast('⚠️ Выберите вариант ответа!');
            return;
        }
        
        const q = quizState.questions[quizState.index];
        const opts = document.querySelectorAll('.quiz-option');
        
        // Скрываем кнопку проверки, показываем кнопку продолжения
        const checkBtn = document.getElementById('checkAnswerBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');
        
        if (checkBtn) checkBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'block';
        
        // Проверяем правильность
        let isCorrect = false;
        
        if (Array.isArray(q.correct)) {
            // Множественный выбор - сравниваем наборы
            const selectedSet = new Set(selectedOptions.sort());
            const correctSet = new Set(q.correct.sort());
            isCorrect = selectedSet.size === correctSet.size && 
                       [...selectedSet].every(val => correctSet.has(val));
        } else {
            // Единственный выбор
            isCorrect = selectedOptions.length === 1 && selectedOptions[0] === q.correct;
        }
        
        const resultDiv = document.getElementById('quizResult');
        
        if (isCorrect) {
            // Правильный ответ
            selectedOptions.forEach(idx => {
                if (opts[idx]) opts[idx].classList.add('correct');
            });
            
            quizState.correctCount++;
            quizState.streak++;
            
            // Награда
            state.xp += 10;
            state.coins += 5;
            
            if (resultDiv) {
                resultDiv.classList.remove('hidden');
                resultDiv.innerHTML = `
                    <div class="result-icon">✅</div>
                    <h4>Отлично!</h4>
                    <p>${q.explanation || 'Правильный ответ!'}</p>
                    <button class="btn-secondary" onclick="window.showExplanation()">📖 Пояснение</button>
                `;
            }
            
            showToast(`🎯 Верно! +10 XP, +5 🪙`);
        } else {
            // Неправильный ответ
            selectedOptions.forEach(idx => {
                if (opts[idx]) opts[idx].classList.add('wrong');
            });
            
            // Подсвечиваем правильные
            if (Array.isArray(q.correct)) {
                q.correct.forEach(idx => {
                    if (opts[idx]) opts[idx].classList.add('correct');
                });
            } else {
                if (opts[q.correct]) opts[q.correct].classList.add('correct');
            }
            
            quizState.streak = 0;
            
            if (resultDiv) {
                resultDiv.classList.remove('hidden');
                resultDiv.innerHTML = `
                    <div class="result-icon">❌</div>
                    <h4 style="color:var(--error)">Ошибка</h4>
                    <p>${q.explanation || 'Правильный ответ подсвечен.'}</p>
                `;
            }
            
            showToast('❌ Ошибка! Попробуйте еще раз.');
        }
        
        saveGame();
    } catch (e) {
        console.error('Ошибка проверки ответа:', e);
    }
}

/**
 * Показать пояснение к вопросу
 */
export function showExplanation() {
    const q = quizState.questions[quizState.index];
    alert(`📖 Пояснение:\n\n${q.explanation || 'Нет дополнительного пояснения.'}`);
}

/**
 * Перейти к следующему вопросу
 */
export function nextQuestion() {
    quizState.index++;
    selectedOptions = [];
    
    if (quizState.index < quizState.questions.length) {
        renderQuestion();
    } else {
        finishQuiz();
    }
}

/**
 * Завершить квиз и обработать результаты
 */
export function finishQuiz() {
    try {
        const mod = DB.modules.find(m => m.id === quizState.moduleId);
        
        if (!state.progress[quizState.moduleId]) {
            state.progress[quizState.moduleId] = { 
                levelIndex: 0, 
                attempts: 0, 
                gold: false, 
                completed: false 
            };
        }
        
        const p = state.progress[quizState.moduleId];
        p.attempts++;
        
        const accuracy = quizState.correctCount / quizState.questions.length;
        const totalLevels = mod.levels || 1;
        
        if (accuracy >= 0.8) {
            // Успешное прохождение (80%+ правильных)
            if (p.levelIndex < totalLevels - 1) {
                // Следующий уровень
                p.levelIndex++;
                showToast(`📚 Уровень ${quizState.level} завершён! Открыт уровень ${p.levelIndex + 1}`);
                state.xp += 50;
                state.coins += 25;
            } else {
                // Модуль полностью пройден
                p.completed = true;
                
                if (p.attempts >= 3) {
                    p.gold = true;
                    showToast('🏆 ЗОЛОТО ПОЛУЧЕНО!');
                    state.xp += 100;
                    state.coins += 50;
                    checkAchievement('gold_student');
                    showCelebration();
                }
                
                showToast('🎉 Модуль завершен!');
                state.xp += 200;
                checkAchievement('module_complete');
            }
        } else {
            // Недостаточно точности
            showToast('💪 Попробуйте еще раз (нужно 80% правильных)');
        }
        
        checkAchievement('first_blood');
        saveGame();
        
        // Возвращаемся на дорожную карту
        navigateTo('roadmap');
    } catch (e) {
        console.error('Ошибка завершения квиза:', e);
    }
}

/**
 * Проверить достижение
 * @param {string} id - ID достижения
 */
function checkAchievement(id) {
    if (!state.achievements.includes(id)) {
        state.achievements.push(id);
        showToast(`🏆 Ачивка: ${id}!`);
        saveGame();
    }
}

/**
 * Сохранить игру
 */
function saveGame() {
    try {
        safeSave('dostoino_save_v4', getStateForSave());
    } catch (e) {
        console.error('Ошибка сохранения:', e);
    }
}

/**
 * Получить состояние для сохранения
 */
function getStateForSave() {
    return {
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
}

// Экспортируем функции глобально для использования в HTML
if (typeof window !== 'undefined') {
    window.showExplanation = showExplanation;
}

/**
 * Главный объект QuizEngine для внешнего использования
 */
export const QuizEngine = {
    startQuiz,
    renderQuestion,
    selectOption,
    checkAnswer,
    nextQuestion,
    getQuizState: () => ({ ...quizState }),
    reset: () => {
        quizState = {
            moduleId: null,
            level: 1,
            topic: null,
            questions: [],
            index: 0,
            correctCount: 0,
            streak: 0
        };
        selectedOptions = [];
    }
};
