import Phaser from 'phaser';

const SKY_COLORS = {
  1: 0x1a3a1a, 2: 0x0a2a3a, 3: 0x1a1a2a,
  4: 0x2a0a0a, 5: 0x1a1a2a, 6: 0x0a001a,
};

export default class ParallaxBackground {
  constructor(scene, levelNumber, worldWidth) {
    this.scene = scene;
    this.camera = scene.cameras.main;
    this.levelNumber = levelNumber;

    this.bgImage = null;
    this.fallbackElements = [];

    const skyColor = SKY_COLORS[levelNumber] || SKY_COLORS[1];
    const sky = scene.add.rectangle(worldWidth / 2, 300, worldWidth, 600, skyColor)
      .setDepth(-11);
    this.sky = sky;

    const textureKey = 'bg' + levelNumber;
    if (scene.textures.exists(textureKey)) {
      const tex = scene.textures.get(textureKey);
      const src = tex.getSourceImage();
      if (src && src.width > 1 && src.height > 1) {
        this.bgImage = scene.add.tileSprite(
          0, 600, 800 * 3, src.height,
          textureKey
        )
          .setOrigin(0, 1)
          .setDepth(-10)
          .setScrollFactor(0)
          .setAlpha(0.5);
        this.bgImage.tileScaleX = 1;
        this.bgImage.tileScaleY = 1;
      } else {
        this.createFallback(worldWidth, levelNumber);
      }
    } else {
      this.createFallback(worldWidth, levelNumber);
    }
  }

  createFallback(worldWidth, levelNumber) {
    const palettes = {
      1: { far: 0x1a3a1a, mid: 0x2a5a2a, near: 0x0a2a0a },
      2: { far: 0x0a2a3a, mid: 0x1a4a5a, near: 0x0a1a2a },
      3: { far: 0x1a1a2a, mid: 0x2a2a3a, near: 0x0a0a1a },
      4: { far: 0x2a0a0a, mid: 0x4a1a1a, near: 0x6a2a0a },
      5: { far: 0x1a1a2a, mid: 0x3a3a3a, near: 0x5a4a3a },
      6: { far: 0x0a001a, mid: 0x1a0a2a, near: 0x2a0a3a },
    };
    const pal = palettes[levelNumber] || palettes[1];
    this.fallbackLayers = [];
    for (const [name, { count, sizeRange, speed, color }] of Object.entries({
      far: { count: 30, sizeRange: [3, 8], speed: 0.02, color: pal.far },
      mid: { count: 20, sizeRange: [6, 15], speed: 0.06, color: pal.mid },
      near: { count: 10, sizeRange: [12, 30], speed: 0.15, color: pal.near },
    })) {
      const elements = [];
      for (let i = 0; i < count; i++) {
        const size = Phaser.Math.Between(sizeRange[0], sizeRange[1]);
        const x = Phaser.Math.Between(0, worldWidth);
        const y = Phaser.Math.Between(50, 550);
        const alpha = 0.08 + Math.random() * 0.12;
        const shape = scene.add.circle(x, y, size / 2, color, alpha).setDepth(-9);
        elements.push({ sprite: shape, startX: x, speed });
      }
      this.fallbackLayers.push({ elements, speed });
    }
  }

  update() {
    const camX = this.camera.scrollX;
    if (this.bgImage) {
      this.bgImage.tilePositionX = camX * 0.15;
    }
    if (this.fallbackLayers) {
      this.fallbackLayers.forEach(layer => {
        layer.elements.forEach(el => {
          el.sprite.x = el.startX - camX * layer.speed;
        });
      });
    }
  }

  destroy() {
    if (this.sky) this.sky.destroy();
    if (this.bgImage) this.bgImage.destroy();
    if (this.fallbackLayers) {
      this.fallbackLayers.forEach(layer => {
        layer.elements.forEach(el => el.sprite.destroy());
      });
    }
  }
}
