import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.won = data.won || false;
    this.level = data.level || 1;
  }

  create() {
    const { width, height } = this.cameras.main;

    if (this.won) {
      this.cameras.main.setBackgroundColor('#001a00');

      this.add.text(width / 2, height / 3 - 20, '★ ВЕЛИКАЯ ПОБЕДА ★', {
        fontSize: '46px', fontFamily: 'Arial', color: '#FFD700',
        stroke: '#FF8C00', strokeThickness: 4
      }).setOrigin(0.5);

      this.add.text(width / 2, height / 3 + 50, 'Ты прошёл все уровни и победил всех боссов!', {
        fontSize: '20px', fontFamily: 'Arial', color: '#88FF88'
      }).setOrigin(0.5);

      const coins = this.registry.get('coins') || 0;
      this.add.text(width / 2, height / 3 + 85, `Монет собрано: ${coins}`, {
        fontSize: '18px', fontFamily: 'Arial', color: '#FFD700'
      }).setOrigin(0.5);
    } else {
      this.cameras.main.setBackgroundColor('#1a0000');

      this.add.text(width / 2, height / 3 - 20, 'ПОРАЖЕНИЕ', {
        fontSize: '52px', fontFamily: 'Arial', color: '#FF4444',
        stroke: '#8B0000', strokeThickness: 4
      }).setOrigin(0.5);

      this.add.text(width / 2, height / 3 + 50, 'Звезда погасла... Но ты можешь попробовать снова!', {
        fontSize: '18px', fontFamily: 'Arial', color: '#FF8888'
      }).setOrigin(0.5);
    }

    const retryBtn = this.add.text(width / 2, height / 2 + 70, '[ ПОВТОРИТЬ ]', {
      fontSize: '26px', fontFamily: 'Arial', color: '#FFFFFF',
      backgroundColor: '#333366', padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setDepth(100).setInteractive({ useHandCursor: true });

    retryBtn.on('pointerover', () => retryBtn.setColor('#FFD700'));
    retryBtn.on('pointerout', () => retryBtn.setColor('#FFFFFF'));
    retryBtn.on('pointerdown', () => {
      const lvl = this.won ? 1 : this.level;
      this.registry.set('hp', 3);
      this.registry.set('coins', 0);
      this.registry.set('abilityCount', 0);
      this.scene.start('GameScene', { level: lvl });
      this.scene.launch('HUDScene');
    });

    const menuBtn = this.add.text(width / 2, height / 2 + 120, '[ ГЛАВНОЕ МЕНЮ ]', {
      fontSize: '20px', fontFamily: 'Arial', color: '#AAAAAA',
      padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setDepth(100).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerover', () => menuBtn.setColor('#FFFFFF'));
    menuBtn.on('pointerout', () => menuBtn.setColor('#AAAAAA'));
    menuBtn.on('pointerdown', () => {
      this.scene.stop('HUDScene');
      this.scene.start('MenuScene');
    });

    const star = this.add.image(width / 2, height / 3 - 90, 'hero').setScale(this.won ? 3 : 2);
    this.tweens.add({ targets: star, angle: 360, duration: 3000, repeat: -1 });

    if (!this.won) {
      this.tweens.add({
        targets: star, alpha: 0.3, duration: 800, yoyo: true, repeat: -1
      });
    }
  }
}
