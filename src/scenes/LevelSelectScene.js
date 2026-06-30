import Phaser from 'phaser';
import state from '../managers/GameState.js';
import LevelManager from '../managers/LevelManager.js';
import audio from '../managers/AudioManager.js';

const COLORS = [
  null,
  0x33AA33, 0x33AAAA, 0x8833AA,
  0xCC3333, 0xCC8833, 0x3333CC
];

export default class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelectScene');
  }

  create() {
    audio.init();
    this.input.once('pointerdown', () => audio.resume());

    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor('#000011');

    this.add.text(width / 2, 40, '★ ВЫБОР УРОВНЯ ★', {
      fontSize: '32px', fontFamily: 'Arial', color: '#FFD700',
      stroke: '#FF8C00', strokeThickness: 3
    }).setOrigin(0.5);

    const cols = 3;
    const cardW = 200;
    const cardH = 160;
    const gapX = 30;
    const gapY = 30;
    const totalW = cols * cardW + (cols - 1) * gapX;
    const startX = (width - totalW) / 2 + cardW / 2;
    const startY = 120;

    for (let i = 1; i <= LevelManager.totalLevels; i++) {
      const col = (i - 1) % cols;
      const row = Math.floor((i - 1) / cols);
      const cx = startX + col * (cardW + gapX);
      const cy = startY + row * (cardH + gapY);

      const unlocked = i <= state.unlockedLevels;
      const color = unlocked ? COLORS[i] || 0x333366 : 0x222222;

      const bg = this.add.graphics();
      bg.fillStyle(color, 0.8);
      bg.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 10);
      bg.lineStyle(2, unlocked ? 0xFFFFFF : 0x555555, 0.5);
      bg.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 10);

      this.add.text(cx, cy - 45, `УРОВЕНЬ ${i}`, {
        fontSize: '20px', fontFamily: 'Arial', color: unlocked ? '#FFFFFF' : '#555555'
      }).setOrigin(0.5);

      this.add.text(cx, cy - 15, LevelManager.getName(i), {
        fontSize: '14px', fontFamily: 'Arial', color: unlocked ? '#CCCCCC' : '#444444'
      }).setOrigin(0.5);

      if (unlocked) {
        const stars = '★'.repeat(i);
        this.add.text(cx, cy + 15, stars, {
          fontSize: '16px', fontFamily: 'Arial', color: '#FFD700'
        }).setOrigin(0.5);

        this.add.text(cx, cy + 40, 'ИГРАТЬ', {
          fontSize: '16px', fontFamily: 'Arial', color: '#88FF88',
          backgroundColor: '#336633', padding: { x: 12, y: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          .on('pointerover', function () { this.setColor('#FFFFFF'); audio.buttonHover(); })
          .on('pointerout', function () { this.setColor('#88FF88'); })
          .on('pointerdown', () => {
            audio.buttonClick();
            state.currentLevel = i;
            this.scene.start('GameScene', { level: i });
          });
      } else {
        this.add.text(cx, cy + 20, '🔒 ЗАКРЫТО', {
          fontSize: '14px', fontFamily: 'Arial', color: '#555555'
        }).setOrigin(0.5);
      }
    }

    const backBtn = this.add.text(width / 2, height - 40, '[ НАЗАД ]', {
      fontSize: '22px', fontFamily: 'Arial', color: '#AAAAAA',
      padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => { backBtn.setColor('#FFFFFF'); audio.buttonHover(); });
    backBtn.on('pointerout', () => backBtn.setColor('#AAAAAA'));
    backBtn.on('pointerdown', () => {
      audio.buttonClick();
      this.scene.start('MenuScene');
    });
  }
}
