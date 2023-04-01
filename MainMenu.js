class MainMenu extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenu' });
  }

  preload() {
    this.load.image('playButton', 'assets/playButton.png');
  }

  create() {
    this.playButton = this.add.image(400, 300, 'playButton').setInteractive();
    this.playButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}
