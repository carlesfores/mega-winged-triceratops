import Phaser from "phaser";
import Player from "../objects/player";
import GameHud from "../objects/game-hud";
import Modal from "../objects/modal";

const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const LEVEL_END = 6600;
const PLAYER_START_X = 110;

const PLATFORM_HEIGHTS = {
  high: 330,
  middle: 390,
  low: 455,
};

const PLATFORM_LAYOUT = [
  { x: 0, width: 520, height: "middle" },
  { x: 650, width: 330, height: "high" },
  { x: 1080, width: 300, height: "middle" },
  { x: 1480, width: 300, height: "low" },
  { x: 1880, width: 340, height: "middle" },
  { x: 2320, width: 330, height: "high" },
  { x: 2750, width: 300, height: "low" },
  { x: 3150, width: 340, height: "middle" },
  { x: 3590, width: 340, height: "high" },
  { x: 4030, width: 300, height: "middle" },
  { x: 4430, width: 300, height: "low" },
  { x: 4830, width: 350, height: "high" },
  { x: 5280, width: 300, height: "middle" },
  { x: 5680, width: 330, height: "low" },
  { x: 6110, width: 490, height: "middle" },
];

export default class MainGameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
    this.score = 0;
    this.isGameOver = false;
  }

  preload() {
    this.load.spritesheet("runner", "/assets/sprites/1-bit-tileset.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  create() {
    this.score = 0;
    this.isGameOver = false;
    this.createTextures();
    this.createWorld();
    this.createPlayer();
    this.createHud();
    this.createInput();

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(
      this.player,
      this.items,
      this.collectItem,
      undefined,
      this,
    );
  }

  createTextures() {
    if (!this.textures.exists("runner-platform")) {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0x385b60);
      graphics.fillRect(0, 0, 64, 24);
      graphics.fillStyle(0x8eb8b0);
      graphics.fillRect(0, 0, 64, 4);
      graphics.fillStyle(0x263b49);
      graphics.fillRect(0, 8, 64, 2);
      graphics.generateTexture("runner-platform", 64, 24);
      graphics.destroy();
    }

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

    this.platforms = this.physics.add.staticGroup();
    this.items = this.physics.add.staticGroup();

    PLATFORM_LAYOUT.forEach(({ x, width, height }) => {
      const top = PLATFORM_HEIGHTS[height];
      const platform = this.platforms
        .create(x + width / 2, top + 12, "runner-platform")
        .setDisplaySize(width, 24)
        .refreshBody();
      platform.setDepth(1);

      this.createItemsOnPlatform(x, width, top);
    });

    this.physics.world.gravity.y = 1500;
    this.cameras.main.setBounds(0, 0, LEVEL_END, GAME_HEIGHT);
  }

  createItemsOnPlatform(x, width, top) {
    const itemCount = Math.max(1, Math.floor(width / 120));
    for (let index = 0; index < itemCount; index += 1) {
      const itemX = x + ((index + 1) * width) / (itemCount + 1);
      const item = this.items
        .create(itemX, top - 34, "runner-item")
        .setDepth(2);
      item.body.setSize(16, 16);
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
    this.input.on("pointerdown", this.handlePointerDown, this);
    this.input.on("pointerup", this.handlePointerUp, this);
    this.input.on("pointerupoutside", this.handlePointerUp, this);
    this.events.once("shutdown", () => {
      this.input.off("pointerdown", this.handlePointerDown, this);
      this.input.off("pointerup", this.handlePointerUp, this);
      this.input.off("pointerupoutside", this.handlePointerUp, this);
      this.player.stop();
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
    item.destroy();
    this.score += 1;
    this.hud.setScore(this.score);
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
    this.player.stop();

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
