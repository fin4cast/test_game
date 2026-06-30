import Phaser from 'phaser';
import { createDeathEffect } from '../managers/VFX.js';
import audio from '../managers/AudioManager.js';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, patrolRange = 100, type = 'basic') {
    const texture = type === 'flying' ? 'flying_enemy' : 'enemy';
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.patrolRange = patrolRange;
    this.startX = x;
    this.startY = y;
    this.direction = 1;
    this.speed = 50 + Math.random() * 30;
    this.enemyType = type;
    this.hp = type === 'tough' ? 2 : 1;
    this.setCollideWorldBounds(true);
    this.setDepth(5);

    if (type === 'flying') {
      this.body.setAllowGravity(false);
      this.body.setSize(24, 24);
      this.body.setOffset(4, 4);
      this.flyTime = 0;
      this.flyAmplitude = 30 + Math.random() * 20;
      this.flySpeed = 0.002 + Math.random() * 0.002;
    } else {
      this.body.setSize(24, 24);
      this.body.setOffset(4, 8);
    }
  }

  takeDamage() {
    this.hp--;
    this.setTint(0xFF8888);
    this.scene.time.delayedCall(80, () => {
      if (this.active) this.clearTint();
    });
    if (this.hp <= 0) this.die();
  }

  die() {
    if (!this.active) return;
    createDeathEffect(this.scene, this.x, this.y);
    audio.enemyDie();
    this.destroy();
  }

  update(time, delta) {
    if (!this.active) return;

    if (this.enemyType === 'flying') {
      this.flyTime += delta;
      this.y = this.startY + Math.sin(this.flyTime * this.flySpeed) * this.flyAmplitude;

      if (this.scene.hero && this.scene.hero.active) {
        const dir = this.scene.hero.x > this.x ? 1 : -1;
        this.setVelocityX(dir * this.speed);
        this.setFlipX(dir < 0);
      }
    } else {
      if (this.x > this.startX + this.patrolRange) {
        this.direction = -1;
      } else if (this.x < this.startX - this.patrolRange) {
        this.direction = 1;
      }
      this.setVelocityX(this.speed * this.direction);
      this.setFlipX(this.direction < 0);
    }
  }
}
