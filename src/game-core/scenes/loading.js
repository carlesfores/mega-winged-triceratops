export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoadingScene' });
  }

  preload() {      
    this.loadAudios();
    this.loadImages();
  }

  create() {
    this.scene.start('MenuScene');
  }

  loadAudios() {
    
  }

  loadImages() {

  }
}