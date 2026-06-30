import Phaser from 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, patrolRange = 100, type = 'basic') {
    super(scene, x, y, 'enemy');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.patrolRange = patrolRange;
    this.startX = x;
    this.direction = 1;
    this.speed = 50 + Math.random() * 30;
    this.enemyType = type;
    this.setCollideWorldBounds(true);
    this.body.setSize(24, 24);
    this.body.setOffset(4, 8);
    this.setDepth(5);
  }

  die() {
    if (!this.active) return;
    this.createDeathEffect();
    this.destroy();
  }

  createDeathEffect() {
    for (let i = 0; i < 6; i++) {
      const p = this.scene.add.circle(
        this.x, this.y,
        Phaser.Math.Between(2, 5), 0xFF6666, 0.8
      );
      p.setDepth(15);
      this.scene.tweens.add({
        targets: p,
        x: p.x + Phaser.Math.Between(-30, 30),
        y: p.y + Phaser.Math.Between(-30, 30),
        alpha: 0,
        duration: 400,
        onComplete: () => p.destroy()
      });
    }
  }

  update(time, delta) {
    if (!this.active) return;

    if (this.x > this.startX + this.patrolRange) {
      this.direction = -1;
    } else if (this.x < this.startX - this.patrolRange) {
      this.direction = 1;
    }

    this.setVelocityX(this.speed * this.direction);
    this.setFlipX(this.direction < 0);
  }
}
