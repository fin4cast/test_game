import level1 from '../levels/level1.json';
import level2 from '../levels/level2.json';
import level3 from '../levels/level3.json';

const LEVELS = [null, level1, level2, level3];

class LevelManager {
  getLevel(num) {
    return LEVELS[num] || null;
  }

  getNextLevel(num) {
    return num < 3 ? num + 1 : null;
  }

  isValidLevel(num) {
    return num >= 1 && num <= 3;
  }

  getName(num) {
    const names = ['', 'Звёздные джунгли', 'Ледяная пещера', 'Космическая станция'];
    return names[num] || '';
  }

  getBossName(num) {
    const names = ['', 'ГИГАНТСКИЙ ЦВЕТОК', 'СНЕЖНЫЙ ГОЛЕМ', 'ТЁМНАЯ ЗВЕЗДА'];
    return names[num] || '';
  }

  get totalLevels() {
    return LEVELS.length - 1;
  }
}

export default new LevelManager();
