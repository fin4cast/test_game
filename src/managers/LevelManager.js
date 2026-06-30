import level1 from '../levels/level1.json';
import level2 from '../levels/level2.json';
import level3 from '../levels/level3.json';
import level4 from '../levels/level4.json';
import level5 from '../levels/level5.json';
import level6 from '../levels/level6.json';

const LEVELS = [null, level1, level2, level3, level4, level5, level6];

class LevelManager {
  getLevel(num) {
    return LEVELS[num] || null;
  }

  getNextLevel(num) {
    return num < 6 ? num + 1 : null;
  }

  isValidLevel(num) {
    return num >= 1 && num <= 6;
  }

  getName(num) {
    const names = ['', 'Звёздные джунгли', 'Ледяная пещера', 'Космическая станция', 'Китайский храм', 'Механическая фабрика', 'Финальная цитадель'];
    return names[num] || '';
  }

  getBossName(num) {
    const names = ['', 'ГИГАНТСКИЙ ЦВЕТОК', 'СНЕЖНЫЙ ГОЛЕМ', 'ТЁМНАЯ ЗВЕЗДА', 'КРАСНАЯ КНОПКА', 'ЧАСОВОЙ ГОЛЕМ', 'ТЕНЕВОЙ СТРАТЕГ'];
    return names[num] || '';
  }

  get totalLevels() {
    return LEVELS.length - 1;
  }
}

export default new LevelManager();
