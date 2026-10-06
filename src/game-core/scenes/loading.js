import Phaser from "phaser";

export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: "LoadingScene" });
  }

  preload() {
    this.showLoadingMessage();
    this.loadImages();
    this.loadSpritesheet();
  }

  create() {
    this.scene.start("MenuScene");
  }

  showLoadingMessage() {
    this.add
      .text(480, 270, "Cargando", {
        fontFamily: "monospace",
        fontSize: "24px",
        color: "#f5e6b8",
      })
      .setOrigin(0.5);
  }

  loadImages() {
    this.load.image("leaf_0", "assets/sprites/leaf-00.png");
  }

  loadSpritesheet() {
    this.load.spritesheet("runner", "/assets/sprites/1-bit-tileset.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
  }
}

