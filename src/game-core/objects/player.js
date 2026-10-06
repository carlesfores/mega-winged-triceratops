export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture, 300);

    this.isJumping = false;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setGravityY(900);
    this.setBounce(0);
    this.setDragX(800);
    this.setMaxVelocity(600, 500);
    
    this.setTint(0xFF0000);
  
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    scene.anims.create({
      key: 'idle',
      frames: scene.anims.generateFrameNumbers('OneBitTiles', { start: 300, end: 300 }),
      frameRate: 5,
      repeat: -1
    });
  
    scene.anims.create({
      key: 'run',
      frames: scene.anims.generateFrameNumbers('OneBitTiles', { start: 301, end: 303 }),
      frameRate: 12,
      repeat: -1
    });

    scene.anims.create({
      key: 'jump',
      frames: scene.anims.generateFrameNumbers('OneBitTiles', { start: 304, end: 304 }),
      frameRate: 12,
      repeat: -1
    });
  }

  update() {
    if (this.cursors.left.isDown) {
      this.setVelocityX(-300);
      this.setFlipX(true);
      this.play('run', true);
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(300);
      this.setFlipX(false);
      this.play('run', true);
    } else {
      this.setVelocityX(0);
      this.play('idle', true);
    }

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.body.onFloor()) {
      this.play('jump', true);
      this.setVelocityY(-300);
      this.isJumping = true;
    }

    if (this.isJumping && this.body.velocity.y < 0 && this.spaceKey.isUp) {
      this.setVelocityY(this.body.velocity.y / 2);
      this.isJumping = false;
    }
  }
}