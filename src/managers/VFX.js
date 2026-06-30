import Phaser from 'phaser';

export function spawnParticles(scene, x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const p = scene.add.circle(x, y, Phaser.Math.Between(2, 4), color, 0.9).setDepth(15);
    scene.tweens.add({
      targets: p,
      x: p.x + Phaser.Math.Between(-25, 25),
      y: p.y + Phaser.Math.Between(-30, -5),
      alpha: 0,
      scale: 0.2,
      duration: 350 + Math.random() * 200,
      onComplete: () => p.destroy()
    });
  }
}

export function createDeathEffect(scene, x, y, count = 6, color = 0xFF6666) {
  for (let i = 0; i < count; i++) {
    const p = scene.add.circle(x, y, Phaser.Math.Between(2, 5), color, 0.8);
    p.setDepth(15);
    scene.tweens.add({
      targets: p,
      x: p.x + Phaser.Math.Between(-30, 30),
      y: p.y + Phaser.Math.Between(-30, 30),
      alpha: 0,
      duration: 400,
      onComplete: () => p.destroy()
    });
  }
}

export function createBossDeathEffect(scene, x, y) {
  if (!scene || !scene.add) return;
  const colors = [0xFF4444, 0xFFD700, 0xFFFFFF, 0xFF8800, 0xFFFF00];
  for (let i = 0; i < 20; i++) {
    const color = colors[Phaser.Math.Between(0, colors.length - 1)];
    const p = scene.add.circle(x, y, Phaser.Math.Between(3, 8), color, 0.9);
    p.setDepth(20);
    scene.tweens.add({
      targets: p,
      x: p.x + Phaser.Math.Between(-60, 60),
      y: p.y + Phaser.Math.Between(-80, 20),
      alpha: 0,
      duration: 600 + Math.random() * 400,
      onComplete: () => p.destroy()
    });
  }
}

export function createDashEffect(scene, x, y, facingRight) {
  for (let i = 0; i < 5; i++) {
    const p = scene.add.circle(
      x + Phaser.Math.Between(-5, 5),
      y + Phaser.Math.Between(-5, 5),
      4, 0xFFFF00, 0.6
    );
    p.setDepth(1);
    scene.tweens.add({
      targets: p,
      x: x + (facingRight ? -40 : 40),
      alpha: 0,
      duration: 300,
      onComplete: () => p.destroy()
    });
  }
}
