import Phaser from 'phaser';

export default class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, bossType) {
    const textures = [null, 'boss1', 'boss2', 'boss3'];
    super(scene, x, y, textures[bossType]);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.bossType = bossType;
    this.maxHp = bossType === 1 ? 5 : bossType === 2 ? 8 : 12;
    this.hp = this.maxHp;
    this.speed = bossType === 1 ? 80 : bossType === 2 ? 110 : 130;
    this.isVulnerable = true;
    this.phase = 1;
    this.attackTimer = 2000;
    this.attackInterval = 2500;
    this.attackPattern = 0;
    this.teleportTimer = 0;
    this.setCollideWorldBounds(true);
    this.body.setAllowGravity(true);
    this.body.setSize(50, 50);
    this.setDepth(8);

    const scales = [null, 1.5, 1.3, 1.8];
    this.setScale(scales[bossType]);

    if (bossType === 1) {
      this.isVulnerable = false;
      this.attackInterval = 2000;
    }
    if (bossType === 2) {
      this.isVulnerable = true;
      this.attackInterval = 2800;
    }
    if (bossType === 3) {
      this.isVulnerable = true;
      this.attackInterval = 2200;
    }
  }

  update(time, delta, hero) {
    if (!this.active || !hero || !hero.active) return;

    this.attackTimer -= delta;

    switch (this.bossType) {
      case 1: this.updateBoss1(delta, hero); break;
      case 2: this.updateBoss2(delta, hero); break;
      case 3: this.updateBoss3(time, delta, hero); break;
    }
  }

  updateBoss1(delta, hero) {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, hero.x, hero.y);

    if (dist > 180) {
      const dir = hero.x > this.x ? 1 : -1;
      this.setVelocityX(dir * this.speed);
    } else {
      this.setVelocityX(0);
    }

    this.setFlipX(hero.x < this.x);

    if (this.attackTimer <= 0) {
      if (!this.isVulnerable) {
        this.attackPattern++;
        if (this.attackPattern >= 3) {
          this.isVulnerable = true;
          this.setTint(0xFF8888);
          this.attackTimer = 2500;

          this.scene.time.delayedCall(2000, () => {
            if (this.active) {
              this.isVulnerable = false;
              this.clearTint();
            }
          });
        } else {
          this.shootSpread(hero, 3);
          this.attackTimer = this.attackInterval;
        }
      } else {
        this.isVulnerable = false;
        this.clearTint();
        this.shootSpread(hero, 3);
        this.attackTimer = this.attackInterval;
      }
    }
  }

  updateBoss2(delta, hero) {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, hero.x, hero.y);
    this.setFlipX(hero.x < this.x);

    if (this.hp <= this.maxHp * 0.5 && this.phase === 1) {
      this.phase = 2;
      this.speed *= 1.4;
      this.attackInterval = 2200;
    }

    if (this.attackTimer <= 0) {
      if (this.isVulnerable && this.body.blocked.down) {
        this.isVulnerable = false;
        this.clearTint();
        this.attackTimer = 1500;
        return;
      }

      const dir = hero.x > this.x ? 1 : -1;
      this.setVelocityX(dir * 250);
      this.setVelocityY(-420);

      this.scene.time.delayedCall(900, () => {
        if (!this.active) return;
        this.isVulnerable = true;
        this.setTint(0x8888FF);
        this.scene.time.delayedCall(1800, () => {
          if (this.active) {
            this.isVulnerable = false;
            this.clearTint();
          }
        });
      });

      this.attackTimer = this.attackInterval;
    }
  }

  updateBoss3(time, delta, hero) {
    this.setFlipX(hero.x < this.x);

    if (this.hp <= this.maxHp * 0.7 && this.phase === 1) {
      this.phase = 2;
      this.attackInterval = 1800;
    }
    if (this.hp <= this.maxHp * 0.35 && this.phase === 2) {
      this.phase = 3;
      this.attackInterval = 1200;
    }

    this.setVelocityX(Math.sin(time * 0.003) * this.speed * 1.5);

    if (this.body.blocked.down) {
      this.setVelocityY(-200);
    }

    this.isVulnerable = true;

    if (this.attackTimer <= 0) {
      switch (this.phase) {
        case 1:
          this.shootSpread(hero, 5);
          this.attackTimer = this.attackInterval;
          break;
        case 2:
          this.shootSpread(hero, 5);
          this.attackTimer = this.attackInterval;
          if (this.teleportTimer >= 3000) {
            this.teleport();
            this.teleportTimer = 0;
          }
          this.teleportTimer += delta;
          break;
        case 3:
          this.shootWave();
          this.attackTimer = this.attackInterval;
          break;
      }
    }
  }

  shootSpread(hero, count) {
    const baseAngle = Phaser.Math.Angle.Between(this.x, this.y, hero.x, hero.y);
    const spreadAngle = 0.8;
    const startAngle = baseAngle - spreadAngle / 2;
    const step = spreadAngle / (count - 1 || 1);

    for (let i = 0; i < count; i++) {
      const angle = startAngle + step * i;
      this.createProjectile(angle, 200);
    }
  }

  shootWave() {
    for (let i = -3; i <= 3; i++) {
      const proj = this.scene.add.sprite(this.x + i * 25, this.y, 'star');
      proj.setScale(0.3);
      proj.setTint(0xFF0000);
      proj.setDepth(5);
      if (this.scene.bossProjectiles) {
        this.scene.bossProjectiles.add(proj);
        proj.body.setVelocityY(180);
      }
      this.scene.time.delayedCall(4000, () => {
        if (proj.active) proj.destroy();
      });
    }
  }

  createProjectile(angle, speed) {
    const proj = this.scene.add.sprite(this.x, this.y, 'star');
    proj.setScale(0.35);
    proj.setTint(0xFF4444);
    proj.setDepth(5);
    if (this.scene.bossProjectiles) {
      this.scene.bossProjectiles.add(proj);
      proj.body.setVelocityX(Math.cos(angle) * speed);
      proj.body.setVelocityY(Math.sin(angle) * speed);
    }
    this.scene.time.delayedCall(4000, () => {
      if (proj.active) proj.destroy();
    });
  }

  teleport() {
    const x = Phaser.Math.Between(150, 650);
    const y = Phaser.Math.Between(200, 400);

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.setPosition(x, y);
        this.body.reset(x, y);
        this.scene.tweens.add({
          targets: this,
          alpha: 1,
          duration: 200
        });
      }
    });
  }

  takeDamage(amount) {
    if (!this.isVulnerable || !this.active) return;

    this.hp -= amount;
    this.setTint(0xFFFFFF);

    this.scene.time.delayedCall(80, () => {
      if (this.active) this.clearTint();
    });
  }

  destroy() {
    this.createDeathEffect();
    super.destroy();
  }

  createDeathEffect() {
    const colors = [0xFF4444, 0xFFD700, 0xFFFFFF, 0xFF8800, 0xFFFF00];
    for (let i = 0; i < 20; i++) {
      const color = colors[Phaser.Math.Between(0, colors.length - 1)];
      const p = this.scene.add.circle(
        this.x, this.y,
        Phaser.Math.Between(3, 8), color, 0.9
      );
      p.setDepth(20);
      this.scene.tweens.add({
        targets: p,
        x: p.x + Phaser.Math.Between(-60, 60),
        y: p.y + Phaser.Math.Between(-80, 20),
        alpha: 0,
        duration: 600 + Math.random() * 400,
        onComplete: () => p.destroy()
      });
    }
  }
}
