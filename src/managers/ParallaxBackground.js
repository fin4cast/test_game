import Phaser from 'phaser';

const LAYER_CONFIGS = {
  1: {
    far: { color: 0x1a3a1a, count: 30, sizeRange: [3, 8], speed: 0.02 },
    mid: { color: 0x2a5a2a, count: 20, sizeRange: [6, 15], speed: 0.06 },
    near: { color: 0x0a2a0a, count: 10, sizeRange: [12, 30], speed: 0.15 },
  },
  2: {
    far: { color: 0x0a2a3a, count: 30, sizeRange: [3, 8], speed: 0.02 },
    mid: { color: 0x1a4a5a, count: 20, sizeRange: [6, 15], speed: 0.06 },
    near: { color: 0x0a1a2a, count: 10, sizeRange: [12, 30], speed: 0.15 },
  },
  3: {
    far: { color: 0x1a1a2a, count: 30, sizeRange: [3, 8], speed: 0.02 },
    mid: { color: 0x2a2a3a, count: 20, sizeRange: [6, 15], speed: 0.06 },
    near: { color: 0x0a0a1a, count: 10, sizeRange: [12, 30], speed: 0.15 },
  },
  4: {
    far: { color: 0x2a0a0a, count: 30, sizeRange: [3, 8], speed: 0.02 },
    mid: { color: 0x4a1a1a, count: 20, sizeRange: [6, 15], speed: 0.06 },
    near: { color: 0x6a2a0a, count: 10, sizeRange: [12, 30], speed: 0.15 },
  },
  5: {
    far: { color: 0x1a1a2a, count: 30, sizeRange: [3, 8], speed: 0.02 },
    mid: { color: 0x3a3a3a, count: 20, sizeRange: [6, 15], speed: 0.06 },
    near: { color: 0x5a4a3a, count: 10, sizeRange: [12, 30], speed: 0.15 },
  },
  6: {
    far: { color: 0x0a001a, count: 40, sizeRange: [2, 6], speed: 0.02 },
    mid: { color: 0x1a0a2a, count: 25, sizeRange: [5, 12], speed: 0.06 },
    near: { color: 0x2a0a3a, count: 12, sizeRange: [10, 25], speed: 0.15 },
  },
};

export default class ParallaxBackground {
  constructor(scene, levelNumber, worldWidth) {
    this.scene = scene;
    this.layers = [];
    this.camera = scene.cameras.main;

    const cfg = LAYER_CONFIGS[levelNumber] || LAYER_CONFIGS[1];

    for (const layerName of ['far', 'mid', 'near']) {
      const lc = cfg[layerName];
      const elements = [];

      for (let i = 0; i < lc.count; i++) {
        const size = Phaser.Math.Between(lc.sizeRange[0], lc.sizeRange[1]);
        const x = Phaser.Math.Between(0, worldWidth);
        const y = Phaser.Math.Between(50, 550);
        const alpha = 0.08 + Math.random() * 0.12;
        const shape = this.scene.add.circle(x, y, size / 2, lc.color, alpha);
        shape.setDepth(-10 + layerName === 'near' ? 1 : layerName === 'mid' ? 0 : -1);
        elements.push({ sprite: shape, startX: x, startY: y, size });
      }

      this.layers.push({ elements, speed: lc.speed });
    }
  }

  update() {
    const camX = this.camera.scrollX;
    this.layers.forEach(layer => {
      layer.elements.forEach(el => {
        el.sprite.x = el.startX - camX * layer.speed;
      });
    });
  }

  destroy() {
    this.layers.forEach(layer => {
      layer.elements.forEach(el => el.sprite.destroy());
    });
    this.layers = [];
  }
}
