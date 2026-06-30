import Phaser from 'phaser';

export default class Meteor extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, angle) {
    super(scene, x, y, 'meteor');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.setDepth(5);

    const speed = 250 + Math.random() * 150;
    this.body.setVelocityX(Math.cos(angle) * speed);
    this.body.setVelocityY(Math.sin(angle) * speed);
    this.setRotation(angle + Math.PI / 2);
    this.setScale(0.6 + Math.random() * 0.4);

    scene.tweens.add({
      targets: this,
      angle: this.angle + 2,
      duration: 400,
      repeat: -1
    });

    scene.time.delayedCall(4000, () => {
      if (this.active) this.destroy();
    });

    this._collider = scene.physics.add.overlap(scene.hero, this, (h, m) => {
      if (h.active && m.active && !h.invulnerable) {
        h.takeDamage(1);
        scene.cameras.main.shake(100, 0.008);
      }
    });
  }

  destroy() {
    if (this._collider) {
      this._collider.destroy();
      this._collider = null;
    }
    super.destroy();
  }
}
