import Phaser from 'phaser';
import Hero from '../entities/Hero.js';
import state from '../managers/GameState.js';
import InputManager from '../managers/InputManager.js';
import audio from '../managers/AudioManager.js';

export default class BaseLevelScene extends Phaser.Scene {
  constructor(key) {
    super(key);
  }

  setupInput() {
    this.keys = new InputManager(this);
    this.keys.onPointerDown(() => this.heroShoot());
    audio.init();
    this.input.once('pointerdown', () => audio.resume());
  }

  createHero(x, y) {
    this.hero = new Hero(this, x, y);
    this.hero.setAlpha(0);
    this.hero.setScale(0.3);
    this.tweens.add({
      targets: this.hero,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });

    const abilityCount = state.abilityCount;
    if (abilityCount >= 1) this.hero.addAbility('doubleJump');
    if (abilityCount >= 2) this.hero.addAbility('dash');

    this.hero.hp = state.hp;
    this.hero.maxHp = state.maxHp;

    this.hero.onDeath = () => this.handleHeroDeath();
  }

  heroShoot() {
    if (!this.hero || this.hero.attackCooldown > 0 || !this.hero.active) return;

    const bullet = this.hero.shoot();
    if (bullet) {
      this.heroProjectiles.add(bullet);
      const dir = bullet.getData('dir') || 1;
      bullet.body.setAllowGravity(false);
      bullet.body.setVelocityX(dir * 500);
    }
  }

  handleHeroDeath() {
    this.hero.setActive(false);
    this.hero.setVisible(false);
    this.time.delayedCall(800, () => {
      this.scene.stop('HUDScene');
      this.scene.start('GameOverScene', { won: false, level: state.currentLevel });
    });
  }

  handleEInput() {
    if (this.keys.eJustDown) {
      this.heroShoot();
    }
  }

  handleEscInput() {
    if (this.keys.escJustDown) {
      this.scene.stop('HUDScene');
      this.scene.start('MenuScene');
    }
  }

  checkHeroFall() {
    if (this.hero.y > 620) {
      this.handleHeroDeath();
      return true;
    }
    return false;
  }
}
