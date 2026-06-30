# TODO: Доработки Star Platformer

## ✅ Критично

- [x] **SessionManager/GameState** — `src/managers/GameState.js`
- [x] **BaseLevelScene** — устранено дублирование GameScene ↔ BossScene
- [x] **Hero.shoot()** — используется единый метод, убиты дубли
- [x] **Обработка ошибок** — `validateLevelData()` в GameScene

## ✅ Важно

- [x] **LevelManager** — навигация по уровням, имена
- [x] **InputManager** — централизация клавиш
- [x] **VFX** — единый модуль частиц (spawnParticles, deathEffect, dashEffect, bossDeathEffect)
- [x] **PlatformFactory** — создание платформ вынесено
- [x] **HUD auto-launch** — HUD запускается из GameScene/BossScene

## ✅ Средняя приоритетность

- [x] **Hero.update()** — без параметров, через InputManager
- [x] **Анимации** — spawn (fade+scale), attack flash, enemy hit flash, bullet bounce, enemy glow
- [x] **Параллаксный фон** — 3 слоя, уровень-специфичные цвета
- [x] **Звуки** — Web Audio API: jump, shoot, hit, coin, heal, death, dash, bossHit, enemyDie, victory, button

## ✅ Низкая приоритетность

- [x] **Сохранение прогресса** — `SaveManager` (localStorage), автосохранение при переходе к боссу и после победы, кнопка «Продолжить» в меню
- [x] **Оптимизация** — код-сплит Phaser (39 KB игровой код vs 1.4 MB Phaser), gzip/brotli компрессия
- [x] **Деплой** — `vercel.json`, GitHub Actions workflow (`.github/workflows/deploy.yml`)

## Отложено (требуют внешних ресурсов)

- [ ] **TypeScript** — слишком инвазивно, типизация через JSDoc опционально
- [ ] **Внешние спрайты** — замена процедурной генерации на Aseprite/Figma спрайты
