import Phaser from 'phaser';
import BaseLevelScene from './BaseLevelScene.js';
import Enemy from '../entities/Enemy.js';
import Meteor from '../entities/Meteor.js';
import state from '../managers/GameState.js';
import LevelManager from '../managers/LevelManager.js';
import { createPlatforms } from '../managers/PlatformFactory.js';
import { spawnParticles } from '../managers/VFX.js';
import ParallaxBackground from '../managers/ParallaxBackground.js';
import audio from '../managers/AudioManager.js';
import saveManager from '../managers/SaveManager.js';

export default class GameScene extends BaseLevelScene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.levelNumber = data.level || 1;
    state.currentLevel = this.levelNumber;
    state.inBoss = false;
    state.bossHP = 0;
    state.bossMaxHP = 0;
  }

  create() {
    if (!this.validateLevelData()) return;

    this.cameras.main.fadeIn(300);
    this.scene.launch('HUDScene');

    this.physics.world.setBounds(0, -200, this.levelData.worldWidth, 1000);

    this.createBackground();
    this.parallax = new ParallaxBackground(this, this.levelNumber, this.levelData.worldWidth);

    this.platformGroup = this.physics.add.staticGroup();
    this.movingPlatforms = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });
    createPlatforms(this, this.levelData.platforms, this.platformGroup, this.movingPlatforms);
    this.createHero(this.levelData.playerStart.x, this.levelData.playerStart.y);
    this.enemyGroup = this.physics.add.group();
    this.enemyGroup = this.physics.add.group();
    this.flyingEnemyGroup = this.physics.add.group({ allowGravity: false });
    this.createEnemies();
    this.heroProjectiles = this.physics.add.group({ allowGravity: false });
    this.collectibles = this.physics.add.group({ allowGravity: false, immovable: true });
    this.spikeGroup = this.physics.add.staticGroup();
    this.createSpikes();
    this.createCollectibles();
    this.setupCamera();
    this.setupInput();
    this.setupCollisions();
    this.setupMeteors();
    this.createBossTrigger();
  }

  validateLevelData() {
    this.levelData = LevelManager.getLevel(this.levelNumber);
    if (!this.levelData) {
      console.error(`Уровень ${this.levelNumber} не найден`);
      this.scene.start('MenuScene');
      return false;
    }
    if (!this.levelData.platforms || this.levelData.platforms.length === 0) {
      console.error(`Уровень ${this.levelNumber} не содержит платформ`);
      this.scene.start('MenuScene');
      return false;
    }
    if (!this.levelData.bossTrigger) {
      console.error(`Уровень ${this.levelNumber} не содержит bossTrigger`);
      this.scene.start('MenuScene');
      return false;
    }
    if (!this.levelData.playerStart) {
      console.error(`Уровень ${this.levelNumber} не содержит playerStart`);
      this.scene.start('MenuScene');
      return false;
    }
    return true;
  }

  createBackground() {
    const { bgColor, worldWidth } = this.levelData;
    this.add.rectangle(worldWidth / 2, 300, worldWidth, 600, bgColor).setDepth(-12);
  }

  createEnemies() {
    if (this.levelData.enemies) {
      this.levelData.enemies.forEach(e => {
        const type = e.type || 'basic';
        const enemy = new Enemy(this, e.x, e.y, e.patrolRange || 100, type);

        if (type === 'flying') {
          this.flyingEnemyGroup.add(enemy);
        } else {
          this.enemyGroup.add(enemy);
        }

        this.tweens.add({
          targets: enemy, alpha: 0.6, duration: 600 + Math.random() * 400,
          yoyo: true, repeat: -1
        });
      });
    }
  }

  createSpikes() {
    if (this.levelData.spikes) {
      this.levelData.spikes.forEach(s => {
        const spike = this.add.sprite(s.x, s.y, 'spike');
        this.physics.add.existing(spike, true);
        this.spikeGroup.add(spike);
      });
    }
  }

  setupMeteors() {
    this.meteorGroup = null;
    this.meteorTimers = null;
    if (!this.levelData.meteors) return;
    this.meteorGroup = this.physics.add.group({ allowGravity: false });
    this.meteorTimers = [];

    this.levelData.meteors.forEach((cfg, idx) => {
      const timer = this.time.addEvent({
        delay: cfg.interval,
        callback: () => {
          if (!this.hero || !this.hero.active) return;
          const spawnX = Phaser.Math.Between(cfg.spawnX[0], cfg.spawnX[1]);
          const angle = Math.PI / 2 + (Math.random() - 0.5) * 0.6;
          const meteor = new Meteor(this, spawnX, -30, angle);
          this.meteorGroup.add(meteor);
        },
        loop: true
      });
      this.meteorTimers.push(timer);
    });
  }

  createCollectibles() {
    if (this.levelData.collectibles) {
      this.levelData.collectibles.forEach(c => {
        const sprite = this.add.sprite(c.x, c.y, c.type === 'heart' ? 'heart' : 'coin');
        sprite.setData('type', c.type);
        this.collectibles.add(sprite);

        this.tweens.add({
          targets: sprite,
          y: c.y - 5,
          duration: 800 + Math.random() * 400,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      });
    }
  }

  setupCamera() {
    this.cameras.main.setBounds(0, 0, this.levelData.worldWidth, 600);
    this.cameras.main.startFollow(this.hero, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(100, 50);
  }

  setupCollisions() {
    this.physics.add.collider(this.hero, this.platformGroup);
    this.physics.add.collider(this.hero, this.movingPlatforms);
    this.physics.add.collider(this.enemyGroup, this.platformGroup);
    this.physics.add.collider(this.enemyGroup, this.movingPlatforms);

    this.physics.add.collider(this.heroProjectiles, this.platformGroup, (b) => {
      if (b.active) b.destroy();
    });
    this.physics.add.collider(this.heroProjectiles, this.movingPlatforms, (b) => {
      if (b.active) b.destroy();
    });

    this.physics.add.overlap(this.heroProjectiles, this.enemyGroup, (bullet, enemy) => {
      if (bullet.active && enemy.active) {
        bullet.destroy();
        enemy.takeDamage();
      }
    });
    this.physics.add.overlap(this.heroProjectiles, this.flyingEnemyGroup, (bullet, enemy) => {
      if (bullet.active && enemy.active) {
        bullet.destroy();
        enemy.takeDamage();
      }
    });

    this.physics.add.overlap(this.hero, this.enemyGroup, (hero, enemy) => {
      if (hero.active && enemy.active && !hero.invulnerable) {
        hero.takeDamage(1);
        state.hp = hero.hp;
        this.cameras.main.shake(150, 0.005);
      }
    });
    this.physics.add.overlap(this.hero, this.flyingEnemyGroup, (hero, enemy) => {
      if (hero.active && enemy.active && !hero.invulnerable) {
        hero.takeDamage(1);
        state.hp = hero.hp;
        this.cameras.main.shake(150, 0.005);
      }
    });

    this.physics.add.overlap(this.hero, this.spikeGroup, (hero, spike) => {
      if (hero.active && !hero.invulnerable) {
        hero.takeDamage(1);
        state.hp = hero.hp;
        this.cameras.main.shake(100, 0.008);
        hero.setVelocityY(-300);
        hero.setVelocityX(hero.facingRight ? -200 : 200);
      }
    });

    this.physics.add.overlap(this.hero, this.collectibles, (hero, item) => {
      if (!item.active) return;
      const type = item.getData('type');
      if (type === 'coin') {
        state.coins = state.coins + 1;
        audio.coin();
        spawnParticles(this, item.x, item.y, 0xFFD700, 4);
      } else if (type === 'heart') {
        hero.heal(1);
        state.hp = hero.hp;
        audio.heal();
        spawnParticles(this, item.x, item.y, 0xFF0066, 6);
      }
      item.destroy();
    });
  }

  createBossTrigger() {
    const t = this.levelData.bossTrigger;
    const trigger = this.add.zone(t.x, t.y, 100, 600);
    this.physics.add.existing(trigger, true);
    this.physics.add.overlap(this.hero, trigger, () => this.goToBoss());
  }

  goToBoss() {
    state.hp = this.hero.hp;
    saveManager.save();
    this.scene.start('BossScene', { level: this.levelNumber });
  }

  update(time, delta) {
    if (!this.hero || !this.hero.active) return;

    if (this.checkHeroFall()) return;

    this.parallax.update();
    this.hero.update(time, delta);
    this.handleEInput();
    this.handleEscInput();

    this.enemyGroup.getChildren().forEach(enemy => {
      if (enemy.active) enemy.update(time, delta);
    });
    this.flyingEnemyGroup.getChildren().forEach(enemy => {
      if (enemy.active) enemy.update(time, delta);
    });
    if (this.meteorGroup) {
      this.meteorGroup.getChildren().forEach(meteor => {
        if (meteor.active) meteor.update();
      });
    }
  }
}
