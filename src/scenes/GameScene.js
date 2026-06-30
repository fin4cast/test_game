import Phaser from 'phaser';
import Hero from '../entities/Hero.js';
import Enemy from '../entities/Enemy.js';
import level1 from '../levels/level1.json';
import level2 from '../levels/level2.json';
import level3 from '../levels/level3.json';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.levelNumber = data.level || 1;
    this.registry.set('currentLevel', this.levelNumber);
    this.registry.set('inBoss', false);
    this.registry.set('bossHP', 0);
    this.registry.set('bossMaxHP', 0);
  }

  create() {
    const levels = [null, level1, level2, level3];
    this.levelData = levels[this.levelNumber];

    this.physics.world.setBounds(0, -200, this.levelData.worldWidth, 1000);

    this.createBackground();
    this.platformGroup = this.physics.add.staticGroup();
    this.movingPlatforms = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });
    this.createPlatforms();
    this.createHero();
    this.enemyGroup = this.physics.add.group();
    this.createEnemies();
    this.projectiles = this.physics.add.group({ allowGravity: false });
    this.collectibles = this.physics.add.group({ allowGravity: false, immovable: true });
    this.createCollectibles();
    this.setupCamera();
    this.setupInput();
    this.setupCollisions();
    this.createBossTrigger();

    this.coinsCollected = this.registry.get('coins') || 0;
    this.registry.events.emit('changedata');
  }

  createBackground() {
    const { bgColor, worldWidth } = this.levelData;
    this.add.rectangle(worldWidth / 2, 300, worldWidth, 600, bgColor).setDepth(-10);

    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(0, worldWidth);
      const y = Phaser.Math.Between(0, 500);
      const r = Phaser.Math.Between(1, 3);
      this.add.circle(x, y, r, 0xFFFFFF, 0.05 + Math.random() * 0.1).setDepth(-9);
    }
  }

  createPlatforms() {
    this.levelData.platforms.forEach(p => {
      if (p.moveX || p.moveY) {
        const plat = this.physics.add.sprite(p.x, p.y, p.texture || 'platform_ground');
        plat.setDisplaySize(p.width, p.height);
        plat.body.setImmovable(true);
        plat.body.setAllowGravity(false);

        if (p.moveX) {
          this.tweens.add({
            targets: plat,
            x: p.x + p.moveX,
            duration: p.duration || 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        }
        if (p.moveY) {
          this.tweens.add({
            targets: plat,
            y: p.y + p.moveY,
            duration: p.duration || 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        }
        this.movingPlatforms.add(plat);
      } else {
        const plat = this.add.tileSprite(p.x, p.y, p.width, p.height, p.texture || 'platform_ground');
        this.physics.add.existing(plat, true);
        this.platformGroup.add(plat);
      }
    });
  }

  createHero() {
    const start = this.levelData.playerStart;
    this.hero = new Hero(this, start.x, start.y);

    const abilityCount = this.registry.get('abilityCount') || 0;
    if (abilityCount >= 1) this.hero.addAbility('doubleJump');
    if (abilityCount >= 2) this.hero.addAbility('dash');

    this.hero.hp = this.registry.get('hp') || 3;
    this.hero.maxHp = this.registry.get('maxHp') || 5;

    this.hero.onDeath = () => this.handleHeroDeath();
  }

  createEnemies() {
    if (this.levelData.enemies) {
      this.levelData.enemies.forEach(e => {
        const enemy = new Enemy(this, e.x, e.y, e.patrolRange || 100, e.type || 'basic');
        this.enemyGroup.add(enemy);
      });
    }
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

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyW = this.input.keyboard.addKey('W');
    this.keyA = this.input.keyboard.addKey('A');
    this.keyS = this.input.keyboard.addKey('S');
    this.keyD = this.input.keyboard.addKey('D');
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.keyE = this.input.keyboard.addKey('E');

    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) this.heroShoot();
    });

    this.wasd = {
      up: this.keyW, down: this.keyS, left: this.keyA, right: this.keyD,
      space: this.keySpace, shift: this.keyShift, e: this.keyE
    };
  }

  setupCollisions() {
    this.physics.add.collider(this.hero, this.platformGroup);
    this.physics.add.collider(this.hero, this.movingPlatforms);
    this.physics.add.collider(this.enemyGroup, this.platformGroup);
    this.physics.add.collider(this.enemyGroup, this.movingPlatforms);

    this.physics.add.collider(this.projectiles, this.platformGroup, (b) => b.destroy());
    this.physics.add.collider(this.projectiles, this.movingPlatforms, (b) => b.destroy());

    this.physics.add.overlap(this.projectiles, this.enemyGroup, (bullet, enemy) => {
      if (bullet.active && enemy.active) {
        bullet.destroy();
        enemy.die();
      }
    });

    this.physics.add.overlap(this.hero, this.enemyGroup, (hero, enemy) => {
      if (hero.active && enemy.active && !hero.invulnerable) {
        hero.takeDamage(1);
        this.registry.set('hp', hero.hp);
        this.cameras.main.shake(150, 0.005);
      }
    });

    this.physics.add.overlap(this.hero, this.collectibles, (hero, item) => {
      if (!item.active) return;
      const type = item.getData('type');
      if (type === 'coin') {
        this.coinsCollected++;
        this.registry.set('coins', this.coinsCollected);
        this.spawnParticles(item.x, item.y, 0xFFD700, 4);
      } else if (type === 'heart') {
        hero.heal(1);
        this.registry.set('hp', hero.hp);
        this.spawnParticles(item.x, item.y, 0xFF0066, 6);
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
    this.registry.set('hp', this.hero.hp);
    this.registry.set('maxHp', this.hero.maxHp);
    this.registry.set('coins', this.coinsCollected);
    this.scene.start('BossScene', { level: this.levelNumber });
  }

  handleHeroDeath() {
    this.hero.setActive(false);
    this.hero.setVisible(false);
    this.time.delayedCall(800, () => {
      this.scene.stop('HUDScene');
      this.scene.start('GameOverScene', { won: false, level: this.levelNumber });
    });
  }

  spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const p = this.add.circle(x, y, Phaser.Math.Between(2, 4), color, 0.9).setDepth(15);
      this.tweens.add({
        targets: p,
        x: p.x + Phaser.Math.Between(-25, 25),
        y: p.y + Phaser.Math.Between(-30, -5),
        alpha: 0,
        scale: 0.2,
        duration: 350 + Math.random() * 200,
        onComplete: () => p.destroy()
      });
    }
  }

  heroShoot() {
    if (this.hero.attackCooldown > 0 || !this.hero.active) return;
    this.hero.attackCooldown = 400;

    const dir = this.hero.facingRight ? 1 : -1;
    const bullet = this.add.sprite(this.hero.x + dir * 22, this.hero.y - 4, 'star');
    bullet.setScale(0.6);
    bullet.setDepth(5);
    this.projectiles.add(bullet);
    bullet.body.setVelocityX(dir * 500);

    this.time.delayedCall(2000, () => {
      if (bullet.active) bullet.destroy();
    });
  }

  update(time, delta) {
    if (!this.hero || !this.hero.active) return;

    if (this.hero.y > 620) {
      this.handleHeroDeath();
      return;
    }

    this.hero.update(time, delta, this.cursors, this.wasd);

    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      this.heroShoot();
    }

    this.enemyGroup.getChildren().forEach(enemy => {
      if (enemy.active) enemy.update(time, delta);
    });
  }
}
