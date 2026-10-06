const GAME_WIDTH = 960;

export default class GameHud {
  constructor(scene) {
    this.scoreText = scene.add
      .text(GAME_WIDTH - 26, 22, "ITEMS 0", {
        fontFamily: "monospace",
        fontSize: "18px",
        fontStyle: "bold",
        color: "#f5e6b8",
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(10);
  }

  setScore(score) {
    this.scoreText.setText(`ITEMS ${score}`);
  }
}

