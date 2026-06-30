import Phaser from 'phaser';
import BaseLevelScene from './BaseLevelScene.js';
import Boss from '../entities/Boss.js';
import state from '../managers/GameState.js';
import LevelManager from '../managers/LevelManager.js';
import audio from '../managers/AudioManager.js';
import saveManager from '../managers/SaveManager.js';

export default class BossScene extends BaseLevelScene {
  constructor() {
    super('BossScene');
  }

  init(data) {
    this.levelNumber = data.level || 1;
    state.inBoss = true;
  }

  create() {
    this.cameras.main.fadeIn(500);
    this.physics.world.setBounds(0, -200, 800, 1000);
    this.cameras.main.setBackgroundColor('#0a0011');

    this.scene.launch('HUDScene');

    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, 800);
      const y = Phaser.Math.Between(0, 600);
      const r = Phaser.Math.Between(1, 2);
      this.add.circle(x, y, r, 0xFFFFFF, 0.03 + Math.random() * 0.06).setDepth(-10);
    }

    this.arenaPlatforms = this.physics.add.staticGroup();
    this.createArena();

    this.createHero(120, 400);
    this.hero.setCollideWorldBounds(true);

    this.bossClones = [];
    this.boss = new Boss(this, 600, 200, this.levelNumber);

    state.bossHP = this.boss.hp;
    state.bossMaxHP = this.boss.maxHp;

    this.heroProjectiles = this.physics.add.group({ allowGravity: false });
    this.bossProjectiles = this.physics.add.group({ allowGravity: false });

    this.setupCollisions();
    this.setupInput();

    this.cameras.main.setBounds(0, 0, 800, 600);
    this.cameras.main.startFollow(this.hero, true, 0.08, 0.08);

    const warning = this.add.text(400, 280, `⚠ ${LevelManager.getBossName(this.levelNumber)} ⚠`, {
      fontSize: '28px', fontFamily: 'Arial', color: '#FF4444',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: warning, alpha: 0, delay: 1800, duration: 500,
      onComplete: () => warning.destroy()
    });

    this.battleStarted = false;
    this.time.delayedCall(2000, () => { this.battleStarted = true; });
  }

  createArena() {
    const floor = this.add.tileSprite(400, 584, 800, 32, 'platform_ground');
    this.physics.add.existing(floor, true);
    this.floor = floor;

    const leftWall = this.add.rectangle(0, 300, 16, 600, 0x333333);
    this.physics.add.existing(leftWall, true);

    const rightWall = this.add.rectangle(800, 300, 16, 600, 0x333333);
    this.physics.add.existing(rightWall, true);

    const arenaPlats = [
      { x: 150, y: 460, w: 100, h: 16 },
      { x: 400, y: 370, w: 100, h: 16 },
      { x: 650, y: 460, w: 100, h: 16 },
    ];
    arenaPlats.forEach(p => {
      const plat = this.add.tileSprite(p.x, p.y, p.w, p.h, 'platform_ground');
      this.physics.add.existing(plat, true);
      this.arenaPlatforms.add(plat);
    });
  }

  setupCollisions() {
    this.physics.add.collider(this.hero, this.floor);
    this.physics.add.collider(this.hero, this.arenaPlatforms);
    this.physics.add.collider(this.boss, this.floor);
    this.physics.add.collider(this.boss, this.arenaPlatforms);

    this.physics.add.overlap(this.heroProjectiles, this.boss, (boss, bullet) => {
      if (!bullet.active || !boss.active) return;
      const wasAlive = boss.hp > 0;
      boss.takeDamage(1);
      bullet.destroy();
      state.bossHP = boss.hp;
      if (wasAlive && boss.hp <= 0) this.handleVictory();
    });

    this.physics.add.collider(this.heroProjectiles, this.floor, (_, bullet) => {
      if (bullet.active) bullet.destroy();
    });

    this.physics.add.overlap(this.bossProjectiles, this.hero, (hero, proj) => {
      if (!proj.active || !hero.active) return;
      proj.destroy();
      hero.takeDamage(1);
      state.hp = hero.hp;
      this.cameras.main.shake(100, 0.008);
    });

    this.physics.add.collider(this.bossProjectiles, this.floor, (_, proj) => {
      if (proj.active) proj.destroy();
    });

    this.physics.add.overlap(this.hero, this.boss, () => {
      if (this.hero.active && this.boss.active && !this.hero.invulnerable) {
        this.hero.takeDamage(1);
        state.hp = this.hero.hp;
        this.cameras.main.shake(150, 0.005);
      }
    });
  }

  spawnBossClones(x, y) {
    this.boss.destroy();
    this.bossClones = [];

    const offsets = [-100, 100];
    offsets.forEach((offset, i) => {
      const clone = new Boss(this, x + offset, y - 50, 4, true);
      if (i === 0) {
        clone.halfMinX = 50;
        clone.halfMaxX = 380;
      } else {
        clone.halfMinX = 420;
        clone.halfMaxX = 750;
      }
      clone.setScale(0.9);
      clone.maxHp = 4;
      clone.hp = 4;
      clone.speed = 140;
      clone.attackInterval = 2300;
      this.bossClones.push(clone);

      this.physics.add.collider(clone, this.floor);
      this.physics.add.collider(clone, this.arenaPlatforms);

      this.physics.add.overlap(this.heroProjectiles, clone, (boss, bullet) => {
        if (!bullet.active || !boss.active) return;
        boss.takeDamage(1);
        bullet.destroy();
        this.checkCloneVictory();
      });

      this.physics.add.overlap(this.hero, clone, () => {
        if (this.hero.active && clone.active && !this.hero.invulnerable) {
          this.hero.takeDamage(1);
          state.hp = this.hero.hp;
          this.cameras.main.shake(150, 0.005);
        }
      });
    });

    state.bossHP = 4;
    state.bossMaxHP = 4;
  }

  checkCloneVictory() {
    const alive = this.bossClones.filter(c => c.active);
    if (alive.length === 0) {
      this.handleVictory();
    } else {
      state.bossHP = alive.reduce((sum, c) => sum + c.hp, 0) / alive.length;
    }
  }

  handleVictory() {
    if (this._victoryHandled) return;
    this._victoryHandled = true;

    if (this.boss && this.boss.active) this.boss.destroy();
    this.hero.setActive(false);
    this.hero.setVelocity(0, 0);
    this.hero.setVisible(false);

    state.hp = Math.min(this.hero.hp + 1, this.hero.maxHp);
    state.abilityCount = state.abilityCount + 1;
    state.unlockedLevels = Math.max(state.unlockedLevels, this.levelNumber + 1);
    state.inBoss = false;
    state.bossHP = 0;
    state.bossMaxHP = 0;
    saveManager.save();
    audio.victory();

    const victoryText = this.add.text(400, 200, 'ПОБЕДА!', {
      fontSize: '52px', fontFamily: 'Arial', color: '#FFD700',
      stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(100);

    const nextLevel = LevelManager.getNextLevel(this.levelNumber);
    const btnLabel = nextLevel === null ? 'Завершить игру' : 'Следующий уровень';

    const btn = this.add.text(400, 320, `[ ${btnLabel} ]`, {
      fontSize: '26px', fontFamily: 'Arial', color: '#FFFFFF',
      backgroundColor: '#333366', padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setDepth(100).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#FFD700'));
    btn.on('pointerout', () => btn.setColor('#FFFFFF'));

    btn.on('pointerdown', () => {
      this.scene.stop('HUDScene');
      if (nextLevel === null) {
        this.scene.start('GameOverScene', { won: true });
      } else {
        this.scene.start('GameScene', { level: nextLevel });
      }
    });

    const star = this.add.image(400, 130, 'hero').setScale(2).setDepth(100);
    this.tweens.add({ targets: star, angle: 360, duration: 2000, repeat: -1 });
  }

  handleDefeat() {
    if (this._defeatHandled) return;
    this._defeatHandled = true;
    this.handleHeroDeath();
  }

  update(time, delta) {
    if (!this.hero || !this.hero.active) return;

    if (this.checkHeroFall()) return;

    this.hero.update(time, delta);
    this.handleEInput();
    this.handleEscInput();

    if (this.battleStarted) {
      if (this.boss.active) {
        this.boss.update(time, delta, this.hero);
      }
      this.bossClones.forEach(clone => {
        if (clone.active) clone.update(time, delta, this.hero);
      });
    }
  }
}
