import Phaser from 'phaser';
import state from '../managers/GameState.js';
import audio from '../managers/AudioManager.js';
import saveManager from '../managers/SaveManager.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    audio.init();
    this.input.once('pointerdown', () => audio.resume());

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

    let continueBtn = null;

    if (saveManager.hasSave()) {
      continueBtn = this.add.text(width / 2, height / 2 + 90, '[ ПРОДОЛЖИТЬ ]', {
        fontSize: '22px',
        fontFamily: 'Arial',
        color: '#88FF88',
        backgroundColor: '#336633',
        padding: { x: 18, y: 8 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      continueBtn.on('pointerover', () => { continueBtn.setColor('#FFFFFF'); audio.buttonHover(); });
      continueBtn.on('pointerout', () => continueBtn.setColor('#88FF88'));
      continueBtn.on('pointerdown', () => {
        audio.buttonClick();
        saveManager.load();
        this.scene.start('GameScene', { level: state.currentLevel });
      });
    }

    startBtn.on('pointerover', () => { startBtn.setColor('#FFD700'); audio.buttonHover(); });
    startBtn.on('pointerout', () => startBtn.setColor('#FFFFFF'));
    startBtn.on('pointerdown', () => {
      audio.buttonClick();
      saveManager.deleteSave();
      state.reset();
      state.currentLevel = 1;
      this.scene.start('GameScene', { level: 1 });
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
