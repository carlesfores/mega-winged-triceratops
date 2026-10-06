const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const BUTTON_WIDTH = 250;
const BUTTON_HEIGHT = 52;

export default class Modal {
  constructor(scene, { title, message, buttons }) {
    this.scene = scene;
    this.overlay = scene.add.container(0, 0).setDepth(10).setScrollFactor(0);

    const backdrop = scene.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x101722,
      0.88,
    );
    const heading = scene.add
      .text(GAME_WIDTH / 2, 190, title, {
        fontFamily: "monospace",
        fontSize: "42px",
        fontStyle: "bold",
        color: "#f5e6b8",
      })
      .setOrigin(0.5);
    const result = scene.add
      .text(GAME_WIDTH / 2, 245, message, {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#8eb8b0",
      })
      .setOrigin(0.5);

    this.overlay.add([backdrop, heading, result]);
    this.buttons = buttons.map(({ label, action }, index) => (
      this.createButton(340 + index * 70, label, action)
    ));
  }

  createButton(y, label, action) {
    const background = this.scene.add
      .rectangle(GAME_WIDTH / 2, y, BUTTON_WIDTH, BUTTON_HEIGHT, 0x263b49)
      .setStrokeStyle(2, 0x8eb8b0)
      .setScrollFactor(0)
      .setDepth(11)
      .setInteractive({ useHandCursor: true });
    const text = this.scene.add
      .text(GAME_WIDTH / 2, y, label, {
        fontFamily: "monospace",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#f5e6b8",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(12);

    background
      .on("pointerover", () => background.setFillStyle(0x3b5965))
      .on("pointerout", () => background.setFillStyle(0x263b49))
      .on("pointerup", action);

    return [background, text];
  }

  destroy() {
    this.overlay.destroy(true);
    this.buttons.flat().forEach((button) => button.destroy());
  }
}
