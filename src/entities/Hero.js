import Phaser from 'phaser';

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

    this.setCollideWorldBounds(true);
    this.body.setSize(20, 28);
    this.body.setOffset(6, 4);
    this.setDepth(10);
    this.jumpPressed = false;
  }

  update(time, delta, cursors, wasd) {
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

    const left = cursors.left.isDown || (wasd && wasd.left && wasd.left.isDown);
    const right = cursors.right.isDown || (wasd && wasd.right && wasd.right.isDown);
    const onGround = this.body.blocked.down;

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

    const jumpJustDown = Phaser.Input.Keyboard.JustDown(cursors.up) ||
      (wasd && (Phaser.Input.Keyboard.JustDown(wasd.up) || Phaser.Input.Keyboard.JustDown(wasd.space)));

    if (jumpJustDown) {
      if (onGround) {
        this.setVelocityY(this.jumpVelocity);
        this.canDoubleJump = this.hasDoubleJump;
      } else if (this.canDoubleJump && this.hasDoubleJump) {
        this.setVelocityY(this.jumpVelocity);
        this.canDoubleJump = false;
      }
    }

    const dashJustDown = wasd && wasd.shift && Phaser.Input.Keyboard.JustDown(wasd.shift);

    if (dashJustDown && this.hasDash && this.dashCooldown <= 0 && !this.isDashing) {
      this.isDashing = true;
      this.dashDuration = 200;
      this.dashCooldown = 1500;
      const dir = this.facingRight ? 1 : -1;
      this.setVelocityX(dir * 550);
      this.setVelocityY(0);
      this.body.setAllowGravity(false);
      this.createDashEffect();
    }
  }

  shoot() {
    if (this.attackCooldown > 0 || !this.scene) return null;
    this.attackCooldown = 400;

    const dir = this.facingRight ? 1 : -1;
    const bullet = this.scene.physics.add.sprite(this.x + dir * 22, this.y - 4, 'star');
    bullet.setScale(0.6);
    bullet.setVelocityX(dir * 500);
    bullet.body.setAllowGravity(false);
    bullet.setDepth(5);

    this.scene.time.delayedCall(2000, () => {
      if (bullet.active) bullet.destroy();
    });

    return bullet;
  }

  createDashEffect() {
    for (let i = 0; i < 5; i++) {
      const p = this.scene.add.circle(
        this.x + Phaser.Math.Between(-5, 5),
        this.y + Phaser.Math.Between(-5, 5),
        4, 0xFFFF00, 0.6
      );
      p.setDepth(1);
      this.scene.tweens.add({
        targets: p,
        x: this.x + (this.facingRight ? -40 : 40),
        alpha: 0,
        duration: 300,
        onComplete: () => p.destroy()
      });
    }
  }

  takeDamage(amount = 1) {
    if (this.invulnerable) return;
    this.hp -= amount;
    this.invulnerable = true;
    this.invulnerableTimer = 1200;
    this.setVelocityY(-200);
    this.setVelocityX(this.facingRight ? -100 : 100);

    if (this.hp <= 0) {
      this.hp = 0;
      this.setActive(false);
      this.setVelocity(0, 0);
      this.body.setAllowGravity(false);
      if (this.onDeath) this.onDeath();
    }
  }

  heal(amount = 1) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  addAbility(ability) {
    if (ability === 'doubleJump') this.hasDoubleJump = true;
    if (ability === 'dash') this.hasDash = true;
  }
}
