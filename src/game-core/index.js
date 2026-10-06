import Phaser from "phaser";
import LoadingScene from "./scenes/loading";
import MenuScene from "./scenes/menu";
import GameScene from "./scenes/game";

const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 480,
  parent: 'game-content', 
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
    default: 'arcade',
    arcade: {
      // debug: true,
      gravity: { y: 0 }
    }
  },
  pixelArt: true,
  roundPixels: true 
};

const InitGame = (parent) => {
  return new Phaser.Game({...config, parent});
};

export default InitGame;