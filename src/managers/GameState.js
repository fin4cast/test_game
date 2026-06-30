import Phaser from 'phaser';

class GameState {
  constructor() {
    this.emitter = new Phaser.Events.EventEmitter();
    this.reset();
  }

  reset() {
    this._hp = 3;
    this._maxHp = 5;
    this._coins = 0;
    this._hasDoubleJump = false;
    this._hasDash = false;
    this._abilityCount = 0;
    this._currentLevel = 1;
    this._bossHP = 0;
    this._bossMaxHP = 0;
    this._inBoss = false;
  }

  resetRun() {
    this._hp = 3;
    this._coins = 0;
    this._bossHP = 0;
    this._bossMaxHP = 0;
    this._inBoss = false;
  }

  set(key, value) {
    const privateKey = '_' + key;
    if (privateKey in this) {
      this[privateKey] = value;
      this.emitter.emit('changedata', key, value);
    }
  }

  get(key) {
    const privateKey = '_' + key;
    if (privateKey in this) return this[privateKey];
    return undefined;
  }

  get hp() { return this._hp; }
  set hp(v) { this._hp = v; this.emitter.emit('changedata', 'hp', v); }

  get maxHp() { return this._maxHp; }
  set maxHp(v) { this._maxHp = v; this.emitter.emit('changedata', 'maxHp', v); }

  get coins() { return this._coins; }
  set coins(v) { this._coins = v; this.emitter.emit('changedata', 'coins', v); }

  get hasDoubleJump() { return this._hasDoubleJump; }
  set hasDoubleJump(v) { this._hasDoubleJump = v; this.emitter.emit('changedata', 'hasDoubleJump', v); }

  get hasDash() { return this._hasDash; }
  set hasDash(v) { this._hasDash = v; this.emitter.emit('changedata', 'hasDash', v); }

  get abilityCount() { return this._abilityCount; }
  set abilityCount(v) { this._abilityCount = v; this.emitter.emit('changedata', 'abilityCount', v); }

  get currentLevel() { return this._currentLevel; }
  set currentLevel(v) { this._currentLevel = v; this.emitter.emit('changedata', 'currentLevel', v); }

  get bossHP() { return this._bossHP; }
  set bossHP(v) { this._bossHP = v; this.emitter.emit('changedata', 'bossHP', v); }

  get bossMaxHP() { return this._bossMaxHP; }
  set bossMaxHP(v) { this._bossMaxHP = v; this.emitter.emit('changedata', 'bossMaxHP', v); }

  get inBoss() { return this._inBoss; }
  set inBoss(v) { this._inBoss = v; this.emitter.emit('changedata', 'inBoss', v); }

  on(event, fn, ctx) {
    this.emitter.on(event, fn, ctx);
  }

  off(event, fn, ctx) {
    this.emitter.off(event, fn, ctx);
  }
}

const state = new GameState();
export default state;
