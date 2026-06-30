import Phaser from 'phaser';
import state from '../managers/GameState.js';

export default class HUDScene extends Phaser.Scene {
  constructor() {
    super('HUDScene');
  }

  create() {
    this.hpText = this.add.text(16, 16, '', {
      fontSize: '22px', fontFamily: 'Arial', color: '#FFFFFF'
    }).setDepth(100);

    this.coinText = this.add.text(16, 46, '', {
      fontSize: '16px', fontFamily: 'Arial', color: '#FFD700'
    }).setDepth(100);

    this.levelText = this.add.text(784, 16, '', {
      fontSize: '15px', fontFamily: 'Arial', color: '#AAAAAA'
    }).setOrigin(1, 0).setDepth(100);

    this.abilityText = this.add.text(16, 72, '', {
      fontSize: '12px', fontFamily: 'Arial', color: '#88FF88'
    }).setDepth(100);

    this.bossHPText = this.add.text(400, 56, '', {
      fontSize: '16px', fontFamily: 'Arial', color: '#FF6666'
    }).setOrigin(0.5).setDepth(100);

    this.bossBarBg = null;
    this.bossBarFill = null;

    this.hudUpdateHandler = () => this.updateHUD();
    state.on('changedata', this.hudUpdateHandler);
    this.events.on('shutdown', () => {
      state.off('changedata', this.hudUpdateHandler);
    });
    this.updateHUD();
  }

  updateHUD() {
    const levelNames = ['', 'Ур.1: Звёздные джунгли', 'Ур.2: Ледяная пещера', 'Ур.3: Космическая станция'];
    this.levelText.setText(levelNames[state.currentLevel] || '');

    let hpDisplay = '';
    for (let i = 0; i < state.maxHp; i++) {
      hpDisplay += i < state.hp ? '★ ' : '☆ ';
    }
    this.hpText.setText(hpDisplay.trim());

    this.coinText.setText(`● ${state.coins}`);

    const abilities = [];
    if (state.abilityCount >= 1) abilities.push('Двойной прыжок');
    if (state.abilityCount >= 2) abilities.push('Рывок');
    this.abilityText.setText(abilities.join(' | '));

    if (this.bossBarBg) { this.bossBarBg.destroy(); this.bossBarBg = null; }
    if (this.bossBarFill) { this.bossBarFill.destroy(); this.bossBarFill = null; }

    if (state.inBoss && state.bossMaxHP > 0 && state.bossHP > 0) {
      const barWidth = 300;
      const fillWidth = (state.bossHP / state.bossMaxHP) * barWidth;

      this.bossBarBg = this.add.rectangle(400, 48, barWidth, 10, 0x333333).setDepth(100);
      this.bossBarFill = this.add.rectangle(250, 48, fillWidth, 10, 0xFF4444)
        .setOrigin(0, 0.5).setDepth(101);

      const bossNames = ['', 'ГИГАНТСКИЙ ЦВЕТОК', 'СНЕЖНЫЙ ГОЛЕМ', 'ТЁМНАЯ ЗВЕЗДА'];
      this.bossHPText.setText(`${bossNames[state.currentLevel]} [${state.bossHP}/${state.bossMaxHP}]`);
    } else if (state.inBoss) {
      this.bossHPText.setText('');
    } else {
      this.bossHPText.setText('');
    }
  }
}
