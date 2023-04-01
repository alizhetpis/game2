class GameOver extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOver' });
  }

  init(data) {
    this.score = data.score;
  }

  preload() {
    this.load.image('restartButton', 'assets/restartButton.png');
  }

  create() {
    this.add.text(300, 200, `Game Over\nScore: ${this.score}`, {
      fontSize: '32px',
      color: '#fff',
    });
    this.restartButton = this.add
      .image(400, 400, 'restartButton')
      .setInteractive();
    this.restartButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}
