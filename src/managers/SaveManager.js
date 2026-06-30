import state from './GameState.js';

const SAVE_KEY = 'star_platformer_save';

class SaveManager {
  save() {
    const data = {
      hp: state.hp,
      maxHp: state.maxHp,
      coins: state.coins,
      abilityCount: state.abilityCount,
      currentLevel: state.currentLevel,
      timestamp: Date.now()
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      // localStorage недоступен
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      state.hp = data.hp ?? 3;
      state.maxHp = data.maxHp ?? 5;
      state.coins = data.coins ?? 0;
      state.abilityCount = data.abilityCount ?? 0;
      state.currentLevel = data.currentLevel ?? 1;
      return true;
    } catch (e) {
      return false;
    }
  }

  hasSave() {
    try {
      return localStorage.getItem(SAVE_KEY) !== null;
    } catch (e) {
      return false;
    }
  }

  deleteSave() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {
      // ignore
    }
  }
}

const saveManager = new SaveManager();
export default saveManager;
