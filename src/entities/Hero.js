import Phaser from 'phaser';
import { createDashEffect } from '../managers/VFX.js';
import audio from '../managers/AudioManager.js';

export default class Hero extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'hero');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.hp = 3;
    this.maxHp = 5;
    this.speed = 200;
    this.jumpVelocity = -480;
    this.hasDoubleJump = false;
    this.hasDash = false;
    this.canDoubleJump = true;
    this.isDashing = false;
    this.dashCooldown = 0;
    this.dashDuration = 0;
    this.normalGravity = 800;
    this.attackCooldown = 0;
    this.invulnerable = false;
    this.invulnerableTimer = 0;
    this.facingRight = true;
    this.onDeath = null;
    this.wasOnGround = true;

    this.setCollideWorldBounds(true);
    this.body.setSize(20, 28);
    this.body.setOffset(6, 4);
    this.setDepth(10);
  }

  update(time, delta) {
    if (!this.active) return;

    this.invulnerableTimer -= delta;
    if (this.invulnerable) {
      this.setAlpha(Math.sin(time * 0.01) > 0 ? 1 : 0.3);
      if (this.invulnerableTimer <= 0) {
        this.invulnerable = false;
        this.setAlpha(1);
      }
    }

    if (this.isDashing) {
      this.dashDuration -= delta;
      if (this.dashDuration <= 0) {
        this.isDashing = false;
        this.body.setAllowGravity(true);
      }
      return;
    }

    if (this.dashCooldown > 0) this.dashCooldown -= delta;
    if (this.attackCooldown > 0) this.attackCooldown -= delta;

    const keys = this.scene.keys;
    if (!keys) return;

    const left = keys.left;
    const right = keys.right;
    const onGround = this.body.blocked.down;

    if (!this.wasOnGround && onGround) {
      audio.jump();
    }
    this.wasOnGround = onGround;

    if (left) {
      this.setVelocityX(-this.speed);
      this.facingRight = false;
      this.setFlipX(true);
    } else if (right) {
      this.setVelocityX(this.speed);
      this.facingRight = true;
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }

    if (keys.upJustDown) {
      if (onGround) {
        this.setVelocityY(this.jumpVelocity);
        this.canDoubleJump = this.hasDoubleJump;
        audio.jump();
      } else if (this.canDoubleJump && this.hasDoubleJump) {
        this.setVelocityY(this.jumpVelocity);
        this.canDoubleJump = false;
        audio.jump();
      }
    }

    if (keys.dashJustDown && this.hasDash && this.dashCooldown <= 0 && !this.isDashing) {
      this.isDashing = true;
      this.dashDuration = 200;
      this.dashCooldown = 1500;
      const dir = this.facingRight ? 1 : -1;
      this.setVelocityX(dir * 550);
      this.setVelocityY(0);
      this.body.setAllowGravity(false);
      createDashEffect(this.scene, this.x, this.y, this.facingRight);
      audio.dash();
    }
  }

  shoot() {
    if (this.attackCooldown > 0 || !this.scene) return null;
    this.attackCooldown = 400;

    this.setTint(0xFFFFAA);
    this.scene.time.delayedCall(60, () => {
      if (this.active) this.clearTint();
    });

    const dir = this.facingRight ? 1 : -1;
    const bullet = this.scene.add.sprite(this.x + dir * 22, this.y - 4, 'star');
    bullet.setScale(0.6);
    bullet.setDepth(5);
    bullet.setData('dir', dir);

    this.scene.tweens.add({
      targets: bullet, scaleX: 0.8, scaleY: 0.8, duration: 50, yoyo: true
    });

    this.scene.time.delayedCall(2000, () => {
      if (bullet.active) bullet.destroy();
    });

    audio.shoot();
    return bullet;
  }

  takeDamage(amount = 1) {
    if (this.invulnerable) return;
    this.hp -= amount;
    this.invulnerable = true;
    this.invulnerableTimer = 1200;
    this.setVelocityY(-200);
    this.setVelocityX(this.facingRight ? -100 : 100);
    audio.hit();

    if (this.hp <= 0) {
      this.hp = 0;
      this.setActive(false);
      this.setVelocity(0, 0);
      this.body.setAllowGravity(false);
      audio.death();
      if (this.onDeath) this.onDeath();
    }
  }

  heal(amount = 1) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    audio.heal();
  }

  addAbility(ability) {
    if (ability === 'doubleJump') this.hasDoubleJump = true;
    if (ability === 'dash') this.hasDash = true;
  }
}
