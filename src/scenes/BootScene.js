import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.generateHeroTexture();
    this.generateStarTexture();
    this.generatePlatformTexture('platform_ground', 0x8B4513, 0x654321);
    this.generatePlatformTexture('platform_ice', 0x87CEEB, 0x6CA6CD);
    this.generatePlatformTexture('platform_metal', 0x808080, 0x606060);
    this.generateEnemyTexture();
    this.generateBoss1Texture();
    this.generateBoss2Texture();
    this.generateBoss3Texture();
    this.generateCoinTexture();
    this.generateHeartTexture();
    this.generateParticleTexture();

    this.scene.start('MenuScene');
  }

  generateHeroTexture() {
    const g = this.add.graphics();
    const cx = 16, cy = 16, outerR = 14, innerR = 6, points = 5;
    g.fillStyle(0xFFFF00);
    g.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI / points) - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
    g.fillPath();
    g.fillStyle(0xFFD700);
    g.fillCircle(cx, cy, 5);
    g.fillStyle(0xFFFFFF);
    g.fillCircle(cx - 4, cy - 3, 3);
    g.fillCircle(cx + 4, cy - 3, 3);
    g.fillStyle(0x000000);
    g.fillCircle(cx - 4, cy - 3, 1.5);
    g.fillCircle(cx + 4, cy - 3, 1.5);
    g.lineStyle(1.5, 0x000000);
    g.beginPath();
    g.arc(cx, cy + 2, 3.5, 0.3, Math.PI - 0.3, false);
    g.strokePath();
    g.generateTexture('hero', 32, 32);
    g.destroy();
  }

  generateStarTexture() {
    const g = this.add.graphics();
    g.fillStyle(0xFFFF88);
    g.fillCircle(8, 8, 6);
    g.fillStyle(0xFFFFFF);
    g.fillCircle(8, 8, 3);
    g.generateTexture('star', 16, 16);
    g.destroy();
  }

  generatePlatformTexture(key, color1, color2) {
    const g = this.add.graphics();
    g.fillStyle(color1);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(color2);
    g.fillRect(0, 0, 32, 4);
    g.lineStyle(1, 0x000000, 0.3);
    g.strokeRect(0, 0, 32, 32);
    g.generateTexture(key, 32, 32);
    g.destroy();
  }

  generateEnemyTexture() {
    const g = this.add.graphics();
    g.fillStyle(0xFF4444);
    g.fillCircle(16, 16, 14);
    g.fillStyle(0xFFFFFF);
    g.fillCircle(10, 12, 3);
    g.fillCircle(22, 12, 3);
    g.fillStyle(0x000000);
    g.fillCircle(10, 12, 1.5);
    g.fillCircle(22, 12, 1.5);
    g.generateTexture('enemy', 32, 32);
    g.destroy();
  }

  generateBoss1Texture() {
    const g = this.add.graphics();
    g.fillStyle(0x228B22);
    g.fillCircle(32, 32, 30);
    g.fillStyle(0x32CD32);
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI / 4);
      g.fillCircle(32 + 28 * Math.cos(angle), 32 + 28 * Math.sin(angle), 8);
    }
    g.fillStyle(0xFF69B4);
    g.fillCircle(32, 32, 12);
    g.fillStyle(0x8B0000);
    g.fillCircle(24, 28, 4);
    g.fillCircle(40, 28, 4);
    g.generateTexture('boss1', 64, 64);
    g.destroy();
  }

  generateBoss2Texture() {
    const g = this.add.graphics();
    g.fillStyle(0x87CEEB);
    g.fillRect(8, 20, 48, 44);
    g.fillStyle(0xE0FFFF);
    g.fillRect(4, 8, 56, 20);
    g.fillStyle(0xFFFFFF);
    g.fillCircle(18, 24, 5);
    g.fillCircle(46, 24, 5);
    g.fillStyle(0x0000FF);
    g.fillCircle(18, 24, 2);
    g.fillCircle(46, 24, 2);
    g.fillStyle(0xFFFFFF);
    g.fillTriangle(32, 12, 26, 22, 38, 22);
    g.lineStyle(3, 0xA9A9A9);
    g.strokeRect(8, 20, 48, 44);
    g.generateTexture('boss2', 64, 64);
    g.destroy();
  }

  generateBoss3Texture() {
    const g = this.add.graphics();
    const cx = 32, cy = 32, outerR = 30, innerR = 12, points = 5;
    g.fillStyle(0x4B0082);
    g.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI / points) - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
    g.fillPath();
    g.fillStyle(0x8B008B);
    g.fillCircle(cx, cy, 8);
    g.fillStyle(0xFF0000);
    g.fillCircle(cx - 8, cy - 4, 3);
    g.fillCircle(cx + 8, cy - 4, 3);
    g.generateTexture('boss3', 64, 64);
    g.destroy();
  }

  generateCoinTexture() {
    const g = this.add.graphics();
    g.fillStyle(0xFFD700);
    g.fillCircle(12, 12, 10);
    g.fillStyle(0xFFA500);
    g.fillCircle(12, 12, 6);
    g.fillStyle(0xFFD700);
    g.fillCircle(12, 12, 4);
    g.generateTexture('coin', 24, 24);
    g.destroy();
  }

  generateHeartTexture() {
    const g = this.add.graphics();
    g.fillStyle(0xFF0066);
    g.fillCircle(8, 8, 8);
    g.fillCircle(16, 8, 8);
    g.fillTriangle(0, 10, 24, 10, 12, 22);
    g.generateTexture('heart', 24, 24);
    g.destroy();
  }

  generateParticleTexture() {
    const g = this.add.graphics();
    g.fillStyle(0xFFFFFF);
    g.fillCircle(4, 4, 4);
    g.generateTexture('particle', 8, 8);
    g.destroy();
  }
}
