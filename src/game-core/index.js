import Phaser from "phaser";
import LoadingScene from "./scenes/loading";
import MenuScene from "./scenes/menu";
import GameScene from "./scenes/game";

const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  parent: 'game-core-container',
  scene: [
    LoadingScene, 
    MenuScene, 
    GameScene
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: "matter",
    matter: {
      gravity: { x: 0, y: 1.5, scale: 0.001 },
      debug: false,
    }
  },
  pixelArt: true,
  roundPixels: true 
};

const InitGame = (parent) => {
  return new Phaser.Game({...config, parent});
};

export default InitGame;