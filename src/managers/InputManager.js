import Phaser from 'phaser';

export default class InputManager {
  constructor(scene) {
    this.scene = scene;
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keyW = scene.input.keyboard.addKey('W');
    this.keyA = scene.input.keyboard.addKey('A');
    this.keyS = scene.input.keyboard.addKey('S');
    this.keyD = scene.input.keyboard.addKey('D');
    this.keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyShift = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.keyE = scene.input.keyboard.addKey('E');
    this.keyEsc = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.wasd = {
      up: this.keyW, down: this.keyS, left: this.keyA, right: this.keyD,
      space: this.keySpace, shift: this.keyShift, e: this.keyE
    };
  }

  get left() { return this.cursors.left.isDown || this.wasd.left.isDown; }
  get right() { return this.cursors.right.isDown || this.wasd.right.isDown; }
  get upJustDown() {
    return Phaser.Input.Keyboard.JustDown(this.cursors.up)
      || Phaser.Input.Keyboard.JustDown(this.wasd.up)
      || Phaser.Input.Keyboard.JustDown(this.wasd.space);
  }
  get dashJustDown() { return Phaser.Input.Keyboard.JustDown(this.wasd.shift); }
  get eJustDown() { return Phaser.Input.Keyboard.JustDown(this.keyE); }
  get escJustDown() { return Phaser.Input.Keyboard.JustDown(this.keyEsc); }

  onPointerDown(fn) {
    this.scene.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) fn();
    });
  }
}
