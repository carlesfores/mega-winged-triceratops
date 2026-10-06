import Phaser from "phaser";

const RUN_SPEED_START = 300;
const RUN_SPEED_END = 450;
const DASH_SPEED_START = 744;
const DASH_SPEED_END = 1020;
const DASH_DURATION = 300;
const DASH_COOLDOWN = 700;
const JUMP_VELOCITY = -570;
const AIR_JUMP_VELOCITY = -520;
const JUMP_RELEASE_MULTIPLIER = 0.45;

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture, 300);

    this.scene = scene;
    this.isDashing = false;
    this.jumpsUsed = 0;
    this.jumpInputHeld = false;
    this.touchJumpHeld = false;
    this.dashEndsAt = 0;
    this.dashAvailableAt = 0;
    this.runSpeed = RUN_SPEED_START;
    this.dashSpeed = DASH_SPEED_START;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(2.5);
    this.setDepth(3);
    this.setCollideWorldBounds(false);
    this.setGravityY(0);
    this.setMaxVelocity(DASH_SPEED_END, 850);
    this.body.setSize(12, 14).setOffset(2, 2);

    this.keys = scene.input.keyboard.addKeys({
      jump: "SPACE",
      alternateJump: "UP",
      alternateJump2: "Z",
      dash: "SHIFT",
      alternateDash: "X",
    });

    this.createAnimations();
    this.play("runner-run");
  }

  createAnimations() {
    if (!this.scene.anims.exists("runner-run")) {
      this.scene.anims.create({
        key: "runner-run",
        frames: this.scene.anims.generateFrameNumbers("runner", { start: 301, end: 303 }),
        frameRate: 12,
        repeat: -1,
      });
    }
    if (!this.scene.anims.exists("runner-jump")) {
      this.scene.anims.create({
        key: "runner-jump",
        frames: this.scene.anims.generateFrameNumbers("runner", { start: 304, end: 304 }),
        frameRate: 1,
        repeat: 0,
      });
    }
  }

  jump(isTouch = false) {
    const grounded = (this.body.blocked.down || this.body.touching.down)
      && this.body.velocity.y >= 0;
    if (grounded) {
      this.jumpsUsed = 0;
    }
    if (this.jumpsUsed >= 2) {
      return;
    }

    this.setVelocityY(this.jumpsUsed === 0 ? JUMP_VELOCITY : AIR_JUMP_VELOCITY);
    this.jumpsUsed += 1;
    this.jumpInputHeld = true;
    this.touchJumpHeld = isTouch;
    this.play("runner-jump", true);
  }

  releaseJump() {
    this.touchJumpHeld = false;
  }

  setLevelProgress(progress) {
    const levelProgress = Phaser.Math.Clamp(progress, 0, 1);
    this.runSpeed = Phaser.Math.Linear(RUN_SPEED_START, RUN_SPEED_END, levelProgress);
    this.dashSpeed = Phaser.Math.Linear(DASH_SPEED_START, DASH_SPEED_END, levelProgress);
  }

  dash() {
    const now = this.scene.time.now;
    if (now < this.dashAvailableAt) {
      return;
    }

    this.isDashing = true;
    this.dashEndsAt = now + DASH_DURATION;
    this.dashAvailableAt = now + DASH_COOLDOWN;
  }

  update() {
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.keys.jump);
    const alternateJumpPressed = Phaser.Input.Keyboard.JustDown(this.keys.alternateJump);
    const alternateJump2Pressed = Phaser.Input.Keyboard.JustDown(this.keys.alternateJump2);
    if (jumpPressed || alternateJumpPressed || alternateJump2Pressed) {
      this.jump();
    }
    if (
      Phaser.Input.Keyboard.JustDown(this.keys.dash)
      || Phaser.Input.Keyboard.JustDown(this.keys.alternateDash)
    ) {
      this.dash();
    }

    const grounded = (this.body.blocked.down || this.body.touching.down)
      && this.body.velocity.y >= 0;
    if (grounded) {
      this.jumpsUsed = 0;
    }

    const jumpHeld = this.touchJumpHeld
      || this.keys.jump.isDown
      || this.keys.alternateJump.isDown
      || this.keys.alternateJump2.isDown;
    if (this.jumpInputHeld && !jumpHeld && this.body.velocity.y < 0) {
      this.setVelocityY(this.body.velocity.y * JUMP_RELEASE_MULTIPLIER);
      this.jumpInputHeld = false;
    }

    this.isDashing = this.scene.time.now < this.dashEndsAt;
    this.setVelocityX(this.isDashing ? this.dashSpeed : this.runSpeed);

    if (grounded) {
      this.play("runner-run", true);
    }
  }

  stop() {
    this.isDashing = false;
    this.touchJumpHeld = false;
    this.jumpInputHeld = false;
    this.setVelocity(0, 0);
    this.anims.stop();
  }
}
