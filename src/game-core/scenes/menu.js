import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  create() {
    this.menuView = this.add.container(0, 0);

    this.createBackground();
    this.createTitle();
    this.createMenuButtons();
  }

  createBackground() {
    this.menuView.add([this.add.rectangle(480, 270, 960, 540, 0x101722)]);
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

    this.menuView.add([title]);
  }

  createMenuButtons() {
    const buttons = [
      { label: "JUGAR", action: () => this.scene.start("GameScene") },
      {
        label: "CÓMO JUGAR",
        action: () =>
          this.showPanel(
            "CÓMO JUGAR",
            "Avanzas automáticamente.\nEspacio / ↑ / Z o toque izq.: doble salto (mantén para saltar más).\nX / Mayús o toque der.: dash.",
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
      .image(480, y, "button_depth")
      .setInteractive({ useHandCursor: true });

    const text = this.add
      .text(480, y, label, {
        fontFamily: "monospace",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#101722",
      })
      .setOrigin(0.5);

    background.on("pointerup", () => {
      action();
    });

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

