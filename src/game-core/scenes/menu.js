import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  create() {
    this.menuView = this.add.container(0, 0);
    this.createBackground(this.menuView);
    this.createTitle();
    this.createMenuButtons();
  }

  createBackground(container) {
    container.add([
      this.add.rectangle(480, 270, 960, 540, 0x101722),
      this.add
        .rectangle(480, 270, 900, 480, 0x101722, 0)
        .setStrokeStyle(4, 0x3b5363),
      this.add
        .rectangle(480, 270, 880, 460, 0x101722, 0)
        .setStrokeStyle(2, 0x243744),
    ]);
  }

  createTitle() {
    const title = this.add
      .text(480, 96, "MEGA WINGED TRICERATOPS", {
        fontFamily: "monospace",
        fontSize: "42px",
        fontStyle: "bold",
        color: "#f5e6b8",
        stroke: "#101722",
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    const subtitle = this.add
      .text(480, 151, "UNA NUEVA AVENTURA", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#8eb8b0",
        letterSpacing: 5,
      })
      .setOrigin(0.5);

    this.menuView.add([title, subtitle]);
  }

  createMenuButtons() {
    const buttons = [
      { label: "JUGAR", action: () => this.scene.start("GameScene") },
      {
        label: "CÓMO JUGAR",
        action: () =>
          this.showPanel(
            "CÓMO JUGAR",
            "Toca una vez o pulsa Espacio / ↑ para saltar.\nDoble toque o Mayús para hacer dash.",
          ),
      },
      {
        label: "OPCIONES",
        action: () =>
          this.showPanel("OPCIONES", "Todavía no hay opciones disponibles."),
      },
    ];

    buttons.forEach(({ label, action }, index) => {
      this.createButton(label, 270 + index * 78, action);
    });
  }

  createButton(label, y, action, container = this.menuView) {
    const background = this.add
      .rectangle(480, y, 300, 58, 0x263b49)
      .setStrokeStyle(2, 0x8eb8b0)
      .setInteractive({ useHandCursor: true });
    const text = this.add
      .text(480, y, label, {
        fontFamily: "monospace",
        fontSize: "22px",
        fontStyle: "bold",
        color: "#f5e6b8",
      })
      .setOrigin(0.5);

    background
      .on("pointerover", () => background.setFillStyle(0x3b5965))
      .on("pointerout", () => background.setFillStyle(0x263b49))
      .on("pointerup", action);

    container.add([background, text]);
  }

  showPanel(title, message) {
    this.menuView.setVisible(false);
    this.panelView = this.add.container(0, 0);

    const backdrop = this.add.rectangle(480, 270, 960, 540, 0x101722, 0.96);
    const panelTitle = this.add
      .text(480, 170, title, {
        fontFamily: "monospace",
        fontSize: "32px",
        fontStyle: "bold",
        color: "#f5e6b8",
      })
      .setOrigin(0.5);
    const panelMessage = this.add
      .text(480, 260, message, {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#d5ded8",
        align: "center",
        lineSpacing: 12,
      })
      .setOrigin(0.5);

    this.panelView.add([backdrop, panelTitle, panelMessage]);
    this.createButton(
      "VOLVER",
      390,
      () => {
        this.panelView.removeAll(true);
        this.panelView.destroy();
        this.panelView = null;
        this.menuView.setVisible(true);
      },
      this.panelView,
    );
  }
}
