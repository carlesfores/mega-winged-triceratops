import Phaser from "phaser";
import Player from "../objects/player";
import GameHud from "../objects/game-hud";
import Modal from "../objects/modal";

const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const LEVEL_END = 6600;
const PLAYER_START_X = 110;
const GAME_OVER_EXPLOSION_DURATION = 650;

const PLATFORM_HEIGHTS = {
  high: 330,
  middle: 390,
  low: 455,
};

const PLATFORM_LAYOUT = [
  { x: 0, width: 520, height: "middle" },
  { x: 650, width: 330, height: "high" },
  { x: 1080, width: 300, height: "middle", slope: -24 },
  { x: 1480, width: 300, height: "low" },
  { x: 1880, width: 340, height: "middle", slope: 28 },
  { x: 2320, width: 330, height: "high" },
  { x: 2750, width: 300, height: "low", slope: -30 },
  { x: 3150, width: 340, height: "middle" },
  { x: 3590, width: 340, height: "high", slope: 28 },
  { x: 4030, width: 300, height: "middle" },
  { x: 4430, width: 300, height: "low", slope: -26 },
  { x: 4830, width: 350, height: "high" },
  { x: 5280, width: 300, height: "middle", slope: 28 },
  { x: 5680, width: 330, height: "low", slope: -24 },
  { x: 6110, width: 490, height: "middle" },
];

const OBSTACLE_LAYOUT = [
  { platformIndex: 2, offset: 200, size: 80 },
  { platformIndex: 7, offset: 225, size: 80 },
  { platformIndex: 12, offset: 205, size: 80 },
];

export default class MainGameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
    this.score = 0;
    this.isGameOver = false;
    this.obstaclesByBodyId = new Map();
  }

  create() {
    this.score = 0;
    this.isGameOver = false;
    this.obstaclesByBodyId = new Map();
    this.createTextures();
    this.createWorld();
    this.createPlayer();
    this.createHud();
    this.createInput();
  }

  createTextures() {
    if (!this.textures.exists("runner-item")) {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0xf5e6b8);
      graphics.fillCircle(10, 10, 9);
      graphics.fillStyle(0x8eb8b0);
      graphics.fillCircle(10, 10, 4);
      graphics.generateTexture("runner-item", 20, 20);
      graphics.destroy();
    }
  }

  createWorld() {
    this.add
      .rectangle(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        GAME_WIDTH,
        GAME_HEIGHT,
        0x101722,
      )
      .setScrollFactor(0);

    this.add.rectangle(480, 115, 960, 2, 0x243744).setScrollFactor(0);
    this.add
      .text(26, 22, "WINGED RUNNER", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#8eb8b0",
        letterSpacing: 2,
      })
      .setScrollFactor(0);

    this.platformGraphics = this.add.graphics().setDepth(1);
    PLATFORM_LAYOUT.forEach((platform, index) => {
      this.createPlatform(platform);
      this.createItemsOnPlatform(platform);
      const obstacle = OBSTACLE_LAYOUT.find((entry) => entry.platformIndex === index);
      if (obstacle) {
        this.createObstacle(platform, obstacle);
      }
    });

    this.cameras.main.setBounds(0, 0, LEVEL_END, GAME_HEIGHT);
  }

  getPlatformTop(platform, progress) {
    const baseTop = PLATFORM_HEIGHTS[platform.height];
    return baseTop - (platform.slope || 0) / 2 + (platform.slope || 0) * progress;
  }

  createPlatform(platform) {
    const { x, width } = platform;
    const topLeft = this.getPlatformTop(platform, 0);
    const topRight = this.getPlatformTop(platform, 1);
    const points = [
      { x, y: topLeft },
      { x: x + width, y: topRight },
      { x: x + width, y: topRight + 24 },
      { x, y: topLeft + 24 },
    ];

    this.platformGraphics.fillStyle(0x385b60);
    this.platformGraphics.fillPoints(points, true);
    this.platformGraphics.lineStyle(4, 0x8eb8b0);
    this.platformGraphics.beginPath();
    this.platformGraphics.moveTo(points[0].x, points[0].y);
    this.platformGraphics.lineTo(points[1].x, points[1].y);
    this.platformGraphics.strokePath();
    this.platformGraphics.lineStyle(2, 0x263b49);
    this.platformGraphics.lineBetween(x, topLeft + 12, x + width, topRight + 12);

    this.matter.add.fromVertices(
      x + width / 2,
      (topLeft + topRight) / 2 + 12,
      points,
      { isStatic: true, friction: 0.8, label: "platform" },
    );
  }

  createObstacle(platform, obstacle) {
    const x = platform.x + obstacle.offset;
    const progress = obstacle.offset / platform.width;
    const baseY = this.getPlatformTop(platform, progress);
    const radius = obstacle.size / (2 * Math.cos(Math.PI / 10));
    const centerY = baseY - radius * Math.cos(Math.PI / 5);
    const vertices = Array.from({ length: 5 }, (_, index) => {
      const angle = -Math.PI / 2 + index * (2 * Math.PI / 5);
      return {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
      };
    });
    const points = vertices.map(({ x: vertexX, y: vertexY }) => ({
      x: x + vertexX,
      y: centerY + vertexY,
    }));
    const graphics = this.add.graphics().setDepth(2);
    graphics.fillStyle(0xe28b62);
    graphics.fillPoints(points, true);
    graphics.lineStyle(2, 0xf5e6b8);
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => graphics.lineTo(point.x, point.y));
    graphics.closePath();
    graphics.strokePath();

    const body = this.matter.add.fromVertices(x, centerY, vertices, {
      isStatic: true,
      friction: 0.6,
      label: "obstacle",
    });
    this.obstaclesByBodyId.set(body.id, { body, graphics });
  }

  createItemsOnPlatform(platform) {
    const { x, width } = platform;
    const itemCount = Math.max(1, Math.floor(width / 120));
    for (let index = 0; index < itemCount; index += 1) {
      const progress = (index + 1) / (itemCount + 1);
      const itemX = x + progress * width;
      const itemY = this.getPlatformTop(platform, progress) - 34;
      this.matter.add
        .image(itemX, itemY, "runner-item", undefined, {
          shape: { type: "circle", radius: 8 },
          isStatic: true,
          isSensor: true,
          label: "collectible",
        })
        .setDepth(2);
    }
  }

  createPlayer() {
    this.player = new Player(this, PLAYER_START_X, PLATFORM_HEIGHTS.middle - 18, "runner");
    this.cameras.main.startFollow(this.player, true, 1, 0);
  }

  createHud() {
    this.hud = new GameHud(this);
  }

  createInput() {
    const matterWorld = this.matter.world;
    this.input.on("pointerdown", this.handlePointerDown, this);
    this.input.on("pointerup", this.handlePointerUp, this);
    this.input.on("pointerupoutside", this.handlePointerUp, this);
    matterWorld.on("collisionstart", this.handleCollisionStart, this);
    this.events.once("shutdown", () => {
      this.input.off("pointerdown", this.handlePointerDown, this);
      this.input.off("pointerup", this.handlePointerUp, this);
      this.input.off("pointerupoutside", this.handlePointerUp, this);
      matterWorld.off("collisionstart", this.handleCollisionStart, this);
      this.gameOverModalTimer?.remove(false);
      this.gameOverModalTimer = null;
      this.obstaclesByBodyId.clear();
    });
  }

  handlePointerDown(pointer) {
    if (this.isGameOver) {
      return;
    }

    if (pointer.wasTouch && pointer.x >= GAME_WIDTH * 0.6) {
      this.player.dash();
    } else if (pointer.rightButtonDown()) {
      this.player.dash();
    } else {
      this.player.jump(pointer.wasTouch);
    }
  }

  handlePointerUp(pointer) {
    if (pointer.wasTouch) {
      this.player.releaseJump();
    }
  }

  collectItem(player, item) {
    if (!item?.active) {
      return;
    }
    item.destroy();
    this.score += 1;
    this.hud.setScore(this.score);
  }

  handleCollisionStart(event) {
    for (const pair of event.pairs) {
      const bodyA = pair.bodyA.parent || pair.bodyA;
      const bodyB = pair.bodyB.parent || pair.bodyB;
      const otherBody = bodyA === this.player.body
        ? bodyB
        : bodyB === this.player.body
          ? bodyA
          : null;

      if (!otherBody) {
        continue;
      }

      if (otherBody.label === "collectible") {
        this.collectItem(this.player, otherBody.gameObject);
      } else if (otherBody.label === "obstacle") {
        this.handleObstacleCollision(otherBody);
      }
    }
  }

  handleObstacleCollision(body) {
    const obstacle = this.obstaclesByBodyId.get(body.id);
    if (!obstacle || this.isGameOver) {
      return;
    }

    if (this.player.isDashing) {
      this.matter.world.remove(obstacle.body);
      obstacle.graphics.destroy();
      this.obstaclesByBodyId.delete(body.id);
      return;
    }

    this.endRun(false);
  }

  update() {
    if (this.isGameOver) {
      return;
    }

    this.player.setLevelProgress(
      (this.player.x - PLAYER_START_X) / (LEVEL_END - PLAYER_START_X),
    );
    this.player.update();

    if (this.player.y > GAME_HEIGHT + 80) {
      this.endRun(false);
    } else if (this.player.x >= LEVEL_END - 70) {
      this.endRun(true);
    }
  }

  endRun(didWin) {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;
    this.cameras.main.stopFollow();
    this.player.stop();
    const explosionX = this.player.x;
    const explosionY = this.player.y;
    this.player.setVisible(false);
    this.playGameOverExplosion(explosionX, explosionY);

    this.gameOverModalTimer = this.time.delayedCall(
      GAME_OVER_EXPLOSION_DURATION,
      () => {
        this.gameOverModalTimer = null;
        this.showGameOverModal(didWin);
      },
    );
  }

  playGameOverExplosion(x, y) {
    const flash = this.add.circle(x, y, 18, 0xf5e6b8).setDepth(5);
    this.tweens.add({
      targets: flash,
      scale: 3.5,
      alpha: 0,
      duration: 260,
      ease: "Cubic.Out",
      onComplete: () => flash.destroy(),
    });

    const shockwave = this.add.circle(x, y, 18, 0x000000, 0)
      .setStrokeStyle(4, 0x8eb8b0)
      .setDepth(5);
    this.tweens.add({
      targets: shockwave,
      scale: 4,
      alpha: 0,
      duration: 460,
      ease: "Cubic.Out",
      onComplete: () => shockwave.destroy(),
    });

    const colors = [0xe28b62, 0xf5e6b8, 0x8eb8b0];
    const shardCount = 12;
    for (let index = 0; index < shardCount; index += 1) {
      const angle = (index / shardCount) * Math.PI * 2
        + Phaser.Math.FloatBetween(-0.16, 0.16);
      const distance = Phaser.Math.Between(60, 135);
      const shard = this.add
        .triangle(
          x,
          y,
          0,
          -5,
          5,
          4,
          -5,
          4,
          colors[index % colors.length],
        )
        .setDepth(6)
        .setScale(Phaser.Math.FloatBetween(1.1, 2));

      this.tweens.add({
        targets: shard,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        angle: Phaser.Math.Between(-240, 240),
        scale: 0,
        alpha: 0,
        duration: Phaser.Math.Between(360, 560),
        delay: Phaser.Math.Between(0, 70),
        ease: "Cubic.Out",
        onComplete: () => shard.destroy(),
      });
    }
  }

  showGameOverModal(didWin) {
    this.endGameModal = new Modal(this, {
      title: didWin ? "¡META!" : "¡HAS CAÍDO!",
      message: didWin
        ? `Has conseguido ${this.score} items`
        : `Items conseguidos: ${this.score}`,
      buttons: [
        { label: "REINTENTAR", action: () => this.scene.restart() },
        { label: "MENÚ", action: () => this.scene.start("MenuScene") },
      ],
    });
  }
}
