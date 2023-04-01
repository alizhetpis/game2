class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.load.image('player', 'assets/player.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('enemy', 'assets/enemy.png');
    this.load.image('background', 'assets/background.png');
    this.load.audio('shootSound', 'assets/shootSound.wav');
    // Загрузите другие необходимые ассеты
  }

  create() {
    // Добавьте фоновое изображение
    this.add.image(400, 300, 'background');

    // Добавьте звуковые эффекты
    this.shootSound = this.sound.add('shootSound');

    // Добавьте жизни, очки и паузу
    this.lives = 3;
    this.score = 0;
    this.nextEnemySpawn = 0;
    this.isPaused = false;

    // Добавьте текстовые элементы для жизней и очков
    this.livesText = this.add.text(10, 10, `Lives: ${this.lives}`, {
      fontSize: '16px',
      color: '#fff',
    });
    this.scoreText = this.add.text(10, 30, `Score: ${this.score}`, {
      fontSize: '16px',
      color: '#fff',
    });

    // Создайте пул пуль
    this.bullets = this.add.group({
      classType: Bullet,
      runChildUpdate: true,
      maxSize: 10,
    });

    // Создайте пул пуль врагов
    this.enemyBullets = this.add.group({
      classType: EnemyBullet,
      runChildUpdate: true,
      maxSize: 10,
    });

    // Добавьте логику паузы
    this.input.keyboard.on('keydown-P', () => {
      this.isPaused = !this.isPaused;
      this.physics.world.isPaused = this.isPaused;
    });

    // Создайте игрока
    this.player = this.physics.add.image(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    this.input.keyboard.enabled = true;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.fireKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // Создайте группу врагов
    this.enemies = this.physics.add.group();
    this.spawnEnemy();

    this.physics.add.collider(
      this.player,
      this.enemies,
      this.handlePlayerEnemyCollision,
      null,
      this
    );
  }

  update(time, delta) {
    console.log('update');
    if (!this.isPaused) {
      this.handleInput();
      this.handlePlayerInput();
      this.handleEnemySpawn();
      this.enemies.getChildren().forEach((enemy) => enemy.update());
      this.bullets.getChildren().forEach((bullet) => bullet.update());
      this.enemyBullets.getChildren().forEach((bullet) => bullet.update());
      this.physics.overlap(
        this.bullets,
        this.enemies,
        this.hitEnemy,
        null,
        this
      );
      this.physics.overlap(
        this.player,
        this.enemyBullets,
        this.handlePlayerEnemyCollision,
        null,
        this
      );
      this.physics.overlap(
        this.player,
        this.enemies,
        this.handlePlayerEnemyCollision,
        null,
        this
      );
    }
  }

  spawnEnemy() {
    const enemy = new Enemy(this, Phaser.Math.Between(50, 750), 0);
    enemy.shootDelay = Phaser.Math.Between(2000, 5000);
    enemy.nextShootTime = 0;
    this.enemies.add(enemy);
  }

  handleEnemyShoot(enemy) {
    const enemyBullet = this.enemyBullets.get();
    if (enemyBullet && enemy.active) {
      const angle = Phaser.Math.Angle.BetweenPoints(enemy, this.player);
      enemyBullet.fire(enemy.x, enemy.y, angle);
    }
  }

  handleEnemySpawn() {
    if (this.time.now > this.nextEnemySpawn && !this.isPaused) {
      this.spawnEnemy();
      this.nextEnemySpawn = this.time.now + this.enemySpawnDelay;
    }
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.active && this.time.now > enemy.nextShootTime) {
        this.handleEnemyShoot(enemy);
        enemy.nextShootTime = this.time.now + enemy.shootDelay;
      }
    });
  }

  hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();
    this.spawnEnemy();
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);
  }

  handlePlayerEnemyCollision(player, enemy) {
    enemy.setActive(false);
    enemy.setVisible(false);
    this.lives -= 1;
    this.livesText.setText(`Lives: ${this.lives}`);
    if (this.lives <= 0) {
      this.scene.start('GameOver', { score: this.score });
    }
  }
}

class Bullet extends Phaser.GameObjects.Image {
  constructor(scene) {
    super(scene, 0, 0, 'bullet');
    this.speed = 400;
    this.active = false;
    this.visible = false;
  }

  fire(x, y) {
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);
    this.setVelocityY(-this.speed);
  }

  update() {
    if (this.y < 0) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}

class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy');
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.setVelocityY(100);
  }

  update() {
    if (this.y > 600) {
      this.destroy();
    }
  }
}

class EnemyBullet extends Phaser.GameObjects.Image {
  constructor(scene) {
    super(scene, 0, 0, 'bullet');
    this.speed = 400;
    this.active = false;
    this.visible = false;
  }

  fire(x, y, angle) {
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);
    this.setRotation(angle);
    this.scene.physics.velocityFromRotation(
      angle - Math.PI / 2,
      this.speed,
      this.body.velocity
    );
  }

  update() {
    if (this.y > 600 || this.y < 0 || this.x > 800 || this.x < 0) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}
