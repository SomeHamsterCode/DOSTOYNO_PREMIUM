/**
 * GameData - База данных игры
 * Модули, здания, предметы магазина, вопросы
 */

export const DB = {
    // Модули обучения (задания ЕГЭ)
    modules: [
        { id: 9, title: "Задание 9", subtitle: "Гласные в корне слова", topics: ["Уровень 1", "Уровень 2", "Уровень 3", "Уровень 4"], icon: "✏️", levels: 4 },
        { id: 10, title: "Задание 10", subtitle: "Правописание приставок", topics: ["ПРЕ-/ПРИ-", "Ы/И после приставок", "ПРИ- (значения)"], icon: "🔤", levels: 3 },
        { id: 11, title: "Задание 11", subtitle: "Правописание суффиксов", topics: ["Н/НН в суффиксах", "Суффиксы прилагательных", "Суффиксы существительных"], icon: "🧩", levels: 3 },
        { id: 12, title: "Задание 12", subtitle: "Правописание окончаний", topics: ["Окончания глаголов", "Суффиксы причастий"], icon: "🔚", levels: 2 },
        { id: 13, title: "Задание 13", subtitle: "Слитное и раздельное написание", topics: ["НЕ с разными частями речи", "Тоже/также", "Что(бы)"], icon: "🔗", locked: true, levels: 3 },
        { id: 14, title: "Задание 14", subtitle: "Дефис", topics: ["Сложные слова", "Частицы -то, -либо, -нибудь"], icon: "➖", locked: true, levels: 2 },
        { id: 15, title: "Задание 15", subtitle: "Правописание наречий и предлогов", topics: ["Наречия", "Производные предлоги"], icon: "📝", locked: true, levels: 2 }
    ],
    
    // Здания для города
    buildings: [
        { id: 'lib', name: 'Библиотека', cost: 100, income: 10, icon: '📚', level: 1 },
        { id: 'arena', name: 'Арена тестов', cost: 300, income: 10, icon: '⚔️', level: 1 },
        { id: 'uni', name: 'Университет', cost: 1200, income: 25, icon: '🎓', level: 1 },
        { id: 'lab', name: 'Лаборатория', cost: 2500, income: 50, icon: '🧪', level: 1 },
        { id: 'obs', name: 'Обсерватория', cost: 6000, income: 100, icon: '🔭', level: 1 }
    ],
    
    // Предметы магазина (кастомизация аватара)
    shopItems: [
        { id: 'hair_default', type: 'hair', name: 'Базовая', cost: 0, bonus: 0, icon: '🧑‍🎓', rarity: 'common' },
        { id: 'hair_care', type: 'hair', name: 'Каре', cost: 150, bonus: 0.5, icon: '👩', rarity: 'common' },
        { id: 'hair_mohawk', type: 'hair', name: 'Ирокез', cost: 300, bonus: 1.0, icon: '👨‍🦲', rarity: 'rare' },
        { id: 'cloth_default', type: 'clothes', name: 'Футболка', cost: 0, bonus: 0, icon: '👕', rarity: 'common' },
        { id: 'cloth_hoodie', type: 'clothes', name: 'Худи', cost: 200, bonus: 0.5, icon: '🧥', rarity: 'common' },
        { id: 'cloth_suit', type: 'clothes', name: 'Костюм', cost: 1000, bonus: 2.5, icon: '🤵', rarity: 'legendary' },
        { id: 'acc_none', type: 'acc', name: 'Без аксессуаров', cost: 0, bonus: 0, icon: '✨', rarity: 'common' },
        { id: 'acc_glasses', type: 'acc', name: 'Очки', cost: 100, bonus: 0.3, icon: '👓', rarity: 'common' },
        { id: 'acc_headphones', type: 'acc', name: 'Наушники', cost: 500, bonus: 1.5, icon: '🎧', rarity: 'rare' }
    ],
    
    // Вопросы для квизов по заданиям
    questions: {
        9: [
            { level: 1, q: "В каком ряду во всех словах пропущена безударная проверяемая гласная корня?", options: ["1) акад..мический, губ..рнатор", "2) удл..нить, выв..дение, выб..рать", "3) мех..нический, сист..матизировать", "4) экон..мичный, изл..гать"], correct: [1, 2], explanation: "Во 2-м ряду: удлИнить (длина), вывЕдение (вывод), выбИрать (выбор). В 3-м ряду: мехАнический (механизм), систЕматизировать (система)." },
            { level: 1, q: "В каком слове пропущена буква Е?", options: ["1) зап..рать", "2) выж..гать", "3) соб..рать", "4) ст..леть"], correct: 3, explanation: "В корне -СТЕЛ-/-СТИЛ- пишется Е, если за корнем следует Л." },
            { level: 2, q: "Укажите варианты с одной и той же буквой", options: ["1) сп..шите, гиги..нический", "2) ст..рожил, обозн..чение", "3) преобр..зить, ур..внение", "4) в..рсистый, г..ревать"], correct: [1, 3], explanation: "В 1-м ряду везде И. В 3-м ряду везде И." }
        ],
        10: [
            { level: 1, q: "В каком ряду пропущена одна и та же буква?", options: ["1) пр..образовать, пр..неприятный", "2) сверх..нтересный, меж..гровой", "3) по..черкнуть, на..кусить", "4) и..подлобья, ра..чертить"], correct: 1, explanation: "После приставок СВЕРХ-, МЕЖ-, ПАН- пишется И." },
            { level: 1, q: "В каком ряду пропущена буква И?", options: ["1) без..звестный, под..тожить", "2) пред..стория, меж..гровой", "3) дез..нформация, пан..сламизм", "4) по..грать, бе..дейный"], correct: 2, explanation: "После иноязычных приставок ДЕЗ-, СУБ-, ТРАНС-, КОНТР- пишется И." }
        ],
        11: [{ level: 1, q: "В каком ряду пропущена одна и та же буква?", options: ["1) ветре..ый, стекля..ый", "2) дли..ый, румя..ый", "3) соломе..ый, лебеди..ый", "4) гуси..ый, коже..ый"], correct: 1, explanation: "В суффиксах прилагательных -ЕНН-, -ОНН- пишется НН." }],
        12: [{ level: 1, q: "В каком ряду пишется буква Ю?", options: ["1) они бор..тся, они стро..т", "2) ты кле..шь, он вид..т", "3) мы помн..м, вы стел..те", "4) она дыш..т, они гон..т"], correct: 2, explanation: "Глаголы-исключения имеют окончания -ешь, -ем, -ете." }],
        13: [{ level: 1, q: "В каком предложении НЕ пишется слитно?", options: ["1) (Не)настный день", "2) Он (не)знал", "3) Это (не)правда", "4) Никогда (не)опаздывай"], correct: 0, explanation: "С прилагательными без НЕ НЕ пишется слитно." }],
        14: [{ level: 1, q: "В каком слове пишется дефис?", options: ["1) по(моему)", "2) кто(то)", "3) жёлто(красный)", "4) по(русски)"], correct: 2, explanation: "Сложные прилагательные цветов пишутся через дефис." }],
        15: [{ level: 1, q: "В каком слове пишется слитно?", options: ["1) на(протяжении)", "2) в(течение)", "3) в(заключение)", "4) на(встречу)"], correct: 3, explanation: "Производные предлоги пишутся слитно." }]
    }
};

/**
 * Получить модуль по ID
 * @param {number} id - ID модуля
 * @returns {object|null}
 */
export function getModuleById(id) {
    return DB.modules.find(m => m.id === id) || null;
}

/**
 * Получить вопросы для модуля и уровня
 * @param {number} moduleId - ID модуля
 * @param {number} level - уровень сложности
 * @returns {Array}
 */
export function getQuestionsForLevel(moduleId, level) {
    return DB.questions[moduleId]?.filter(q => q.level === level) || [];
}

/**
 * Получить здание по ID
 * @param {string} id - ID здания
 * @returns {object|null}
 */
export function getBuildingById(id) {
    return DB.buildings.find(b => b.id === id) || null;
}

/**
 * Получить предмет магазина по ID
 * @param {string} id - ID предмета
 * @returns {object|null}
 */
export function getShopItemById(id) {
    return DB.shopItems.find(item => item.id === id) || null;
}
