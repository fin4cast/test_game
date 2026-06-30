import Phaser from 'phaser';

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
    this.registry.events.on('changedata', this.hudUpdateHandler);
    this.events.on('shutdown', () => {
      this.registry.events.off('changedata', this.hudUpdateHandler);
    });
    this.updateHUD();
  }

  updateHUD() {
    const hp = this.registry.get('hp') ?? 0;
    const maxHp = this.registry.get('maxHp') ?? 5;
    const coins = this.registry.get('coins') ?? 0;
    const level = this.registry.get('currentLevel') ?? 1;
    const inBoss = this.registry.get('inBoss') ?? false;
    const bossHP = this.registry.get('bossHP') ?? 0;
    const bossMaxHP = this.registry.get('bossMaxHP') ?? 0;
    const abilityCount = this.registry.get('abilityCount') ?? 0;

    const levelNames = ['', 'Ур.1: Звёздные джунгли', 'Ур.2: Ледяная пещера', 'Ур.3: Космическая станция'];
    this.levelText.setText(levelNames[level] || '');

    let hpDisplay = '';
    for (let i = 0; i < maxHp; i++) {
      hpDisplay += i < hp ? '★ ' : '☆ ';
    }
    this.hpText.setText(hpDisplay.trim());

    this.coinText.setText(`● ${coins}`);

    const abilities = [];
    if (abilityCount >= 1) abilities.push('Двойной прыжок');
    if (abilityCount >= 2) abilities.push('Рывок');
    this.abilityText.setText(abilities.join(' | '));

    if (this.bossBarBg) { this.bossBarBg.destroy(); this.bossBarBg = null; }
    if (this.bossBarFill) { this.bossBarFill.destroy(); this.bossBarFill = null; }

    if (inBoss && bossMaxHP > 0 && bossHP > 0) {
      const barWidth = 300;
      const fillWidth = (bossHP / bossMaxHP) * barWidth;

      this.bossBarBg = this.add.rectangle(400, 48, barWidth, 10, 0x333333).setDepth(100);
      this.bossBarFill = this.add.rectangle(250, 48, fillWidth, 10, 0xFF4444)
        .setOrigin(0, 0.5).setDepth(101);

      const bossNames = ['', 'ГИГАНТСКИЙ ЦВЕТОК', 'СНЕЖНЫЙ ГОЛЕМ', 'ТЁМНАЯ ЗВЕЗДА'];
      this.bossHPText.setText(`${bossNames[level]} [${bossHP}/${bossMaxHP}]`);
    } else if (inBoss) {
      this.bossHPText.setText('');
    } else {
      this.bossHPText.setText('');
    }
  }
}
