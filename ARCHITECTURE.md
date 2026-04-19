# Архитектура приложения ДОСТОЙНО

## Структура проекта (модульная, ES6 Modules)

```
/workspace
├── index.html              # Главный HTML файл (подключает только main.js)
├── css/
│   └── style.css          # Стили приложения
├── js/
│   ├── main.js            # Точка входа приложения
│   ├── app.js             # Старый файл (можно удалить после тестирования)
│   ├── core/              # Ядро приложения
│   │   ├── AppState.js    # Управление состоянием (Proxy + Pub/Sub)
│   │   ├── Storage.js     # Работа с localStorage
│   │   └── GameLogic.js   # Игровая логика и расчёты
│   ├── data/              # Данные
│   │   └── GameData.js    # База данных игры (вопросы, здания, предметы)
│   └── ui/                # Пользовательский интерфейс
│       ├── ScreenManager.js    # Менеджер экранов (роутинг)
│       ├── UIComponents.js     # Переиспользуемые компоненты
│       └── screens/            # Конкретные экраны
│           ├── RoadmapScreen.js    # Дорожная карта
│           └── QuizEngine.js       # Движок квизов
```

## Ключевые концепции

### 1. AppState - Реактивное состояние
Использует JavaScript Proxy для автоматического отслеживания изменений:
```javascript
import { state, subscribeToState } from './core/AppState.js';

// Подписка на изменения
subscribeToState((property, value, oldValue) => {
    console.log(`${property} изменилось с ${oldValue} на ${value}`);
});

// Изменение состояния автоматически уведомит подписчиков
state.coins = 100;
```

### 2. EventBus - Pub/Sub система
Для событий между модулями:
```javascript
import { EventBus } from './core/AppState.js';

// Подписка
EventBus.subscribe('user:levelup', (data) => {
    console.log('Новый уровень:', data.newLevel);
});

// Публикация
EventBus.publish('user:levelup', { newLevel: 5 });
```

### 3. ScreenManager - Управление экранами
Система для легкого добавления новых экранов:
```javascript
import { registerScreen, navigateTo } from './ui/ScreenManager.js';

// Регистрация нового экрана
registerScreen('newScreen', {
    init: (params) => { /* инициализация */ },
    render: (params) => { /* рендеринг */ },
    destroy: () => { /* очистка */ }
});

// Навигация
navigateTo('newScreen', { param: 'value' });
```

### 4. Модульность
Каждый файл — отдельный ES6 модуль:
- **core/** — базовая функциональность (состояние, хранение, логика)
- **data/** — данные приложения (без состояния)
- **ui/** — всё, что связано с отображением

## Как добавить новый экран

1. Создайте файл в `js/ui/screens/NewScreen.js`:
```javascript
import { state } from '../../core/AppState.js';
import { navigateTo } from '../ScreenManager.js';

export function init(params) {
    // Инициализация при открытии
}

export function render(params) {
    // Рендеринг контента
}

export function destroy() {
    // Очистка при закрытии
}
```

2. Зарегистрируйте экран в `main.js`:
```javascript
import * as NewScreen from './ui/screens/NewScreen.js';
registerScreen('newscreen', NewScreen);
```

3. Добавьте HTML-разметку в `index.html`:
```html
<div id="page-newscreen" class="page">
    <!-- Контент экрана -->
</div>
```

4. Переходите на экран:
```javascript
navigateTo('newscreen');
```

## Глобальные функции (для HTML onclick)

Следующие функции доступны глобально из HTML:
- `navTo(screenId)` — навигация
- `showToast(message)` — уведомление
- `showCelebration()` — анимация праздника
- `calculateIncome()` — расчёт дохода
- `calculateBonus()` — расчёт бонусов
- `startGame()` — начало игры
- `resetProgress()` — сброс прогресса
- `renderCity()` — рендер города
- `buyBuilding(id)` — покупка здания
- `renderShop(filter)` — рендер магазина
- `renderProfile()` — рендер профиля
- `openModule(modId)` — открытие модуля

## Сохранение данных

Данные сохраняются в localStorage с ключом `dostoino_save_v4`:
```javascript
import { safeSave, safeLoad } from './core/Storage.js';

// Сохранение
safeSave('myKey', { data: 'value' });

// Загрузка
const data = safeLoad('myKey');
```

## Преимущества новой архитектуры

1. **Разделение ответственности** — каждый модуль отвечает за свою задачу
2. **Легкость расширения** — новые экраны добавляются за 4 шага
3. **Реактивность** — UI обновляется автоматически при изменении состояния
4. **Тестируемость** — модули можно тестировать изолированно
5. **Читаемость** — код организован логически, комментарии на русском
6. **Без сборки** — работает напрямую в браузере через ES Modules

## Миграция со старого app.js

Старый `app.js` содержит всю логику в одном файле. Новая структура:
- Данные → `js/data/GameData.js`
- Состояние → `js/core/AppState.js`
- Логика → `js/core/GameLogic.js`
- Рендеринг → `js/ui/screens/*.js`
- Утилиты → `js/ui/UIComponents.js`, `js/core/Storage.js`

После тестирования новый `app.js` можно безопасно удалить.
