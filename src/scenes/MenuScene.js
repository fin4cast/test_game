import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor('#000011');

    this.add.text(width / 2, height / 3, '★ STAR PLATFORMER ★', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#FFD700',
      stroke: '#FF8C00',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 3 + 60, 'Платформер с героем-звездой', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#AAAAAA'
    }).setOrigin(0.5);

    const startBtn = this.add.text(width / 2, height / 2 + 40, '[ НАЧАТЬ ИГРУ ]', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: '#333366',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startBtn.on('pointerover', () => startBtn.setColor('#FFD700'));
    startBtn.on('pointerout', () => startBtn.setColor('#FFFFFF'));
    startBtn.on('pointerdown', () => {
      this.registry.set('hp', 3);
      this.registry.set('maxHp', 5);
      this.registry.set('coins', 0);
      this.registry.set('hasDoubleJump', false);
      this.registry.set('hasDash', false);
      this.registry.set('abilityCount', 1);
      this.registry.set('currentLevel', 1);
      this.registry.set('bossHP', 0);
      this.registry.set('bossMaxHP', 0);
      this.registry.set('inBoss', false);
      this.scene.start('GameScene', { level: 1 });
      this.scene.launch('HUDScene');
    });

    this.add.text(width / 2, height - 100,
      'Управление: ← → A D — движение | Space W ↑ — прыжок\nE — атака | Shift — рывок (после улучшения)', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#666666',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 50,
      'Соберите монеты, пройдите 3 уровня и победите боссов!', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#444444'
    }).setOrigin(0.5);

    const star = this.add.image(width / 2, height / 3 - 100, 'hero').setScale(3);
    this.tweens.add({ targets: star, angle: 360, duration: 4000, repeat: -1 });
    this.tweens.add({
      targets: star, y: star.y - 15, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });
  }
}
