import Phaser from "phaser";

const RUN_SPEED_START = 390;
const RUN_SPEED_END = 585;
const DASH_SPEED_START = 960;
const DASH_SPEED_END = 1320;
const DASH_DURATION = 300;
const DASH_COOLDOWN = 700;
const JUMP_VELOCITY = -570;
const AIR_JUMP_VELOCITY = -520;
const MAX_FALL_SPEED = 900;
const JUMP_RELEASE_MULTIPLIER = 0.45;
const PHYSICS_HZ = 60;

export default class Player extends Phaser.Physics.Matter.Sprite {
  constructor(scene, x, y, texture) {
    super(scene.matter.world, x, y, texture, 300, {
      shape: { type: "rectangle", width: 12, height: 14 },
      friction: 0,
      frictionAir: 0.01,
      restitution: 0,
      label: "player",
    });

    this.scene = scene;
    this.isDashing = false;
    this.jumpsUsed = 0;
    this.groundContacts = new Set();
    this.jumpInputHeld = false;
    this.touchJumpHeld = false;
    this.dashEndsAt = 0;
    this.dashAvailableAt = 0;
    this.runSpeed = RUN_SPEED_START;
    this.dashSpeed = DASH_SPEED_START;

    scene.add.existing(this);

    this.setScale(2.5);
    this.setDepth(3);
    this.setFixedRotation();
    this.setFriction(0, 0.01, 0);
    this.setOnCollideActive((pair) => this.trackGroundContact(pair, true));
    this.setOnCollideEnd((pair) => this.trackGroundContact(pair, false));

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

  trackGroundContact(pair, isContacting) {
    const playerIsBodyA = pair.bodyA === this.body || pair.bodyA.parent === this.body;
    const otherBody = playerIsBodyA ? pair.bodyB : pair.bodyA;
    const otherParent = otherBody.parent || otherBody;
    const normalTowardPlayerY = playerIsBodyA
      ? -pair.collision.normal.y
      : pair.collision.normal.y;
    const isGroundContact = normalTowardPlayerY > 0.5;

    if (isContacting && isGroundContact) {
      this.groundContacts.add(otherParent.id);
      if (this.body.velocity.y >= 0) {
        this.jumpsUsed = 0;
      }
    } else if (!isContacting) {
      this.groundContacts.delete(otherParent.id);
    }
  }

  jump(isTouch = false) {
    const grounded = this.groundContacts.size > 0 && this.body.velocity.y >= 0;
    if (grounded) {
      this.jumpsUsed = 0;
    }
    if (this.jumpsUsed >= 2) {
      return;
    }

    const jumpVelocity = this.jumpsUsed === 0 ? JUMP_VELOCITY : AIR_JUMP_VELOCITY;
    this.setVelocityY(jumpVelocity / PHYSICS_HZ);
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
    const accelerationProgress = levelProgress ** 2;
    this.runSpeed = Phaser.Math.Linear(
      RUN_SPEED_START,
      RUN_SPEED_END,
      accelerationProgress,
    );
    this.dashSpeed = Phaser.Math.Linear(
      DASH_SPEED_START,
      DASH_SPEED_END,
      accelerationProgress,
    );
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

    const grounded = this.groundContacts.size > 0 && this.body.velocity.y >= 0;
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

    if (this.body.velocity.y > MAX_FALL_SPEED / PHYSICS_HZ) {
      this.setVelocityY(MAX_FALL_SPEED / PHYSICS_HZ);
    }

    this.isDashing = this.scene.time.now < this.dashEndsAt;
    const runVelocity = this.isDashing ? this.dashSpeed : this.runSpeed;
    this.setVelocityX(runVelocity / PHYSICS_HZ);

    if (grounded) {
      this.play("runner-run", true);
    }
  }

  stop() {
    this.isDashing = false;
    this.groundContacts.clear();
    this.touchJumpHeld = false;
    this.jumpInputHeld = false;
    this.setVelocity(0, 0);
    this.anims.stop();
  }
}
