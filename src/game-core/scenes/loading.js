import Phaser from "phaser";

export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: "LoadingScene" });
  }

  preload() {
    this.add
      .text(480, 270, "Cargando", {
        fontFamily: "monospace",
        fontSize: "24px",
        color: "#f5e6b8",
      })
      .setOrigin(0.5);

    this.load.spritesheet("runner", "/assets/sprites/1-bit-tileset.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.image("font-tekken-2", "/assets/sprites/font-tekken-2.png");
    this.load.tilemapTiledJSON("level-map", "/assets/sprites/1-bit-map.json");
  }

  create() {
    this.scene.start("MenuScene");
  }
}