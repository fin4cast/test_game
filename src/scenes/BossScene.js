import Phaser from 'phaser';
import Hero from '../entities/Hero.js';
import Boss from '../entities/Boss.js';

export default class BossScene extends Phaser.Scene {
  constructor() {
    super('BossScene');
  }

  init(data) {
    this.levelNumber = data.level || 1;
    this.registry.set('inBoss', true);
  }

  create() {
    this.physics.world.setBounds(0, -200, 800, 1000);
    this.cameras.main.setBackgroundColor('#0a0011');

    this.arenaPlatforms = this.physics.add.staticGroup();
    this.createArena();

    const hp = this.registry.get('hp') || 3;
    const maxHp = this.registry.get('maxHp') || 5;
    const abilityCount = this.registry.get('abilityCount') || 0;

    this.hero = new Hero(this, 120, 400);
    this.hero.hp = hp;
    this.hero.maxHp = maxHp;
    if (abilityCount >= 1) this.hero.addAbility('doubleJump');
    if (abilityCount >= 2) this.hero.addAbility('dash');
    this.hero.setCollideWorldBounds(true);

    this.boss = new Boss(this, 600, 200, this.levelNumber);

    this.registry.set('bossHP', this.boss.hp);
    this.registry.set('bossMaxHP', this.boss.maxHp);

    this.heroProjectiles = this.physics.add.group({ allowGravity: false });
    this.bossProjectiles = this.physics.add.group({ allowGravity: false });

    this.setupCollisions();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyW = this.input.keyboard.addKey('W');
    this.keyA = this.input.keyboard.addKey('A');
    this.keyS = this.input.keyboard.addKey('S');
    this.keyD = this.input.keyboard.addKey('D');
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.keyE = this.input.keyboard.addKey('E');
    this.wasd = {
      up: this.keyW, down: this.keyS, left: this.keyA, right: this.keyD,
      space: this.keySpace, shift: this.keyShift, e: this.keyE
    };

    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) this.heroShoot();
    });

    this.cameras.main.setBounds(0, 0, 800, 600);
    this.cameras.main.startFollow(this.hero, true, 0.08, 0.08);

    const bossNames = ['', 'ГИГАНТСКИЙ ЦВЕТОК', 'СНЕЖНЫЙ ГОЛЕМ', 'ТЁМНАЯ ЗВЕЗДА'];
    const warning = this.add.text(400, 280, `⚠ ${bossNames[this.levelNumber]} ⚠`, {
      fontSize: '28px', fontFamily: 'Arial', color: '#FF4444',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: warning, alpha: 0, delay: 1800, duration: 500,
      onComplete: () => warning.destroy()
    });

    this.hero.onDeath = () => this.handleDefeat();
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
      boss.takeDamage(1);
      bullet.destroy();
      this.registry.set('bossHP', boss.hp);
      if (boss.hp <= 0) this.handleVictory();
    });

    this.physics.add.collider(this.heroProjectiles, this.floor, (_, bullet) => {
      if (bullet.active) bullet.destroy();
    });

    this.physics.add.overlap(this.bossProjectiles, this.hero, (hero, proj) => {
      if (!proj.active || !hero.active) return;
      proj.destroy();
      hero.takeDamage(1);
      this.registry.set('hp', hero.hp);
      this.cameras.main.shake(100, 0.008);
      if (hero.hp <= 0) this.handleDefeat();
    });

    this.physics.add.collider(this.bossProjectiles, this.floor, (_, proj) => {
      if (proj.active) proj.destroy();
    });

    this.physics.add.overlap(this.hero, this.boss, () => {
      if (this.hero.active && this.boss.active && !this.hero.invulnerable) {
        this.hero.takeDamage(1);
        this.registry.set('hp', this.hero.hp);
        this.cameras.main.shake(150, 0.005);
        if (this.hero.hp <= 0) this.handleDefeat();
      }
    });
  }

  handleVictory() {
    this.boss.destroy();
    this.hero.setActive(false);
    this.hero.setVelocity(0, 0);
    this.hero.setVisible(false);

    this.registry.set('hp', Math.min(this.hero.hp + 1, this.hero.maxHp));
    const abilityCount = this.registry.get('abilityCount') || 0;
    this.registry.set('abilityCount', abilityCount + 1);

    const victoryText = this.add.text(400, 200, 'ПОБЕДА!', {
      fontSize: '52px', fontFamily: 'Arial', color: '#FFD700',
      stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(100);

    const nextLevel = this.levelNumber + 1;
    const btnLabel = nextLevel > 3 ? 'Завершить игру' : 'Следующий уровень';

    const btn = this.add.text(400, 320, `[ ${btnLabel} ]`, {
      fontSize: '26px', fontFamily: 'Arial', color: '#FFFFFF',
      backgroundColor: '#333366', padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setDepth(100).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#FFD700'));
    btn.on('pointerout', () => btn.setColor('#FFFFFF'));

    btn.on('pointerdown', () => {
      if (nextLevel > 3) {
        this.scene.stop('HUDScene');
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
    this.hero.setActive(false);
    this.hero.setVisible(false);
    this.time.delayedCall(800, () => {
      this.scene.stop('HUDScene');
      this.scene.start('GameOverScene', { won: false, level: this.levelNumber });
    });
  }

  heroShoot() {
    if (this.hero.attackCooldown > 0 || !this.hero.active) return;
    this.hero.attackCooldown = 400;

    const dir = this.hero.facingRight ? 1 : -1;
    const bullet = this.add.sprite(this.hero.x + dir * 22, this.hero.y - 4, 'star');
    bullet.setScale(0.6);
    bullet.setDepth(5);
    this.heroProjectiles.add(bullet);
    bullet.body.setVelocityX(dir * 500);

    this.time.delayedCall(2000, () => {
      if (bullet.active) bullet.destroy();
    });
  }

  update(time, delta) {
    if (!this.hero || !this.hero.active) return;

    if (this.hero.y > 620) {
      this.handleDefeat();
      return;
    }

    this.hero.update(time, delta, this.cursors, this.wasd);

    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      this.heroShoot();
    }

    if (this.battleStarted && this.boss.active) {
      this.boss.update(time, delta, this.hero);
    }
  }
}
