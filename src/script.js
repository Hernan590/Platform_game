// Variables globales
let platforms, cursors, stars, bombs;
let score = 0;
let scoreText;
let gameOver = false;

//Menu
const MenuScene = {
    key: 'MenuScene',

    create: function () {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000)
            .setOrigin(0); 

        this.add.text(centerX, centerY - 150, 'Bienvenido', {
            fontFamily: 'Arial',
            fontSize: '64px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const startButton = this.add.text(centerX, centerY + 50, 'Iniciar Juego', {
            fontFamily: 'Arial',
            fontSize: '32px',
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            padding: { x: 30, y: 15 },
            borderRadius: 10
        }).setOrigin(0.5).setInteractive();

        startButton.on('pointerover', () => {
            startButton.setStyle({ backgroundColor: '#333333', color: '#ffff00' });
        });

        startButton.on('pointerout', () => {
            startButton.setStyle({ backgroundColor: '#1a1a1a', color: '#ffffff' });
        });

        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
};

//Juego
const GameScene = {
    key: 'GameScene',
    
    //imagenes
    preload: function () {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.spritesheet('moneda', 'assets/moneda.png', { frameWidth: 16, frameHeight: 16 });
        this.load.image('bomb', 'assets/bomb.png');
        this.load.image('heart', 'assets/lifes.png');
        this.load.spritesheet('enemy', 'assets/enemyIdle.png', { frameWidth: 48, frameHeight: 32 });
        this.load.spritesheet('enemyR', 'assets/enemyRunRight.png', { frameWidth: 48, frameHeight: 32 });
        this.load.spritesheet('enemyL', 'assets/enemyRunLeft.png', { frameWidth: 48, frameHeight: 32 });
        this.load.spritesheet('dudehurt', 'assets/hurt.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('dude', 'assets/idle.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('dudeleft', 'assets/runLeft.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('duderight', 'assets/runRight.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('dudejumpRight', 'assets/salto.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('dudejumpLeft', 'assets/salto_left.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('death', 'assets/death.png', { frameWidth: 32, frameHeight: 32 });
    },

    //Animaciones, plataformas, colliders, etc
    create: function () {
        //vidas
        lives = 3;
        hearts = [];

        for (let i = 0; i < lives; i++) {
            const heart = this.add.image(30 + i * 40, 30, 'heart').setScale(0.5).setScrollFactor(0).setDepth(1);
            hearts.push(heart);
        }

        this.bg = this.add.image(0, 0, 'sky')
        .setOrigin(0)
        .setDisplaySize(this.scale.width, this.scale.height);

        //Plataformas O bloques de tierra
        platforms = this.physics.add.staticGroup();
        platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        platforms.create(1150, 728, 'ground');
        platforms.create(1350, 568, 'ground');
        platforms.create(600, 400, 'ground');
        platforms.create(50, 250, 'ground');
        platforms.create(750, 220, 'ground');
        platforms.create(1550, 450, 'ground');

        this.player = this.physics.add.sprite(100, 450, 'dude');
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.2);
        this.isInvulnerable = false;

        //Animaciones
        this.anims.create({
            key: 'coin',
            frames: this.anims.generateFrameNumbers('moneda', { start: 0, end: 4 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'hurt',
            frames: this.anims.generateFrameNumbers('dudehurt', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dudeleft', { start: 0, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('duderight', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'jumpRight',
            frames: this.anims.generateFrameNumbers('dudejumpRight', { start: 0, end: 7 }), // Ajusta si es necesario
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'jumpLeft',
            frames: this.anims.generateFrameNumbers('dudejumpLeft', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'loss',
            frames: this.anims.generateFrameNumbers('death', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'enemyMove',
            frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 6 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'enemyRight',
            frames: this.anims.generateFrameNumbers('enemyR', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'enemyLeft',
            frames: this.anims.generateFrameNumbers('enemyL', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        this.physics.add.collider(this.player, platforms);

        cursors = this.input.keyboard.createCursorKeys();

        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            jump: Phaser.Input.Keyboard.KeyCodes.SPACE
        });

        stars = this.physics.add.group({
            key: 'moneda',
            repeat: 6,
            setXY: { x: 100, y: 0, stepX: 180 }
        });

        stars.children.iterate((star) => {
            star.play('coin');
        });

        stars.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });

        this.physics.add.collider(stars, platforms);
        this.physics.add.overlap(this.player, stars, collectStar, null, this);

        this.enemies = this.physics.add.group();

        const posiciones = [
            { x: 1000, y: 400 }, //Enemigo 1,
            { x: 500, y: 300 }, //Enemigo 2,
            { x: 700, y: 100 } // Enemigo 3
        ];

        posiciones.forEach(pos => {
            const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
            enemy.setCollideWorldBounds(true);
            enemy.setBounce(0.2);
            enemy.setVelocityX(100); 
            enemy.setOrigin(0.5, 1);
            enemy.startX = pos.x; 
            enemy.maxDistance = 250; 
            enemy.direction = 'right'; 
            enemy.anims.play('enemyMove', true);
    
        });

        this.physics.add.collider(this.enemies, platforms);

        scoreText = this.add.text(this.scale.width / 2, 20, 'Monedas: 0', { fontSize: '22px', fill: '#000' }).setOrigin(0.5, 0);

        this.gameOverText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 50, '¡Game Over!', {
            fontSize: '48px',
            fill: '#ff0000'
        }).setOrigin(0.5).setVisible(false);
        
        this.retryButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 20, 'Reintentar', {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive().setVisible(false);
        
        this.retryButton.on('pointerdown', () => {
            this.scene.restart();
        });

        this.retryButton.on('pointerover', () => {
            this.retryButton.setStyle({ fill: '#ff0' });
        });
    
        this.retryButton.on('pointerout', () => {
            this.retryButton.setStyle({ fill: '#fff' });
        });
    
        this.retryButton.on('pointerdown', () => {
            this.scene.restart();
            score = 0;
            gameOver = false;
        });

        bombs = this.physics.add.group();
        this.physics.add.collider(bombs, platforms);
        this.loseLife = () => {
            if (lives > 0) {
                lives--;
                hearts[lives].setVisible(false);
        
                if (lives === 0) {
                    this.player.anims.play('loss');
                    this.physics.pause();
                    gameOver = true;
        
                    this.gameOverText.setVisible(true);
                    this.retryButton.setVisible(true);
                }
            }
        };
        this.physics.add.overlap(this.player, bombs, () => {
            if (!gameOver && !this.isInvulnerable) {
                this.player.anims.play('hurt', true);
                this.loseLife();
        
                this.isInvulnerable = true;
                this.tweens.add({
                    targets: this.player,
                    alpha: 0.5,
                    ease: 'Linear',
                    duration: 100,
                    repeat: 5,
                    yoyo: true,
                    onComplete: () => {
                        this.player.setAlpha(1);
                        this.isInvulnerable = false;
                    }
                });
            }
        }, null, this);

        this.physics.add.overlap(this.player, this.enemies, () => {
            if (!this.isInvulnerable && !gameOver) {
                this.player.anims.play('hurt', true);
                this.loseLife();
                this.isInvulnerable = true;
        
                this.tweens.add({
                    targets: this.player,
                    alpha: 0.5,
                    ease: 'Linear',
                    duration: 100,
                    repeat: 5,
                    yoyo: true,
                    onComplete: () => {
                        this.player.setAlpha(1);
                        this.isInvulnerable = false;
                    }
                });
            }
        }, null, this);
        
        this.lastDirection = 'right';

        this.deathZone = this.add.zone(0, this.scale.height, this.scale.width * 2, 100);
        this.physics.world.enable(this.deathZone);
        this.deathZone.body.setAllowGravity(false);
        this.deathZone.body.moves = false;
        this.physics.add.overlap(this.player, this.deathZone, () => {
            if (!gameOver) {
                this.physics.pause();
                this.player.anims.play('loss');
                gameOver = true;

                this.gameOverText.setVisible(true);
                this.retryButton.setVisible(true);
            }
        });

        

    },

    //Movimientos
    update: function () {
        if (gameOver) return;
    
        //Definir teclas de movimiento
        const isOnGround = this.player.body.touching.down;
        const leftPressed = cursors.left.isDown || this.keys.left.isDown;
        const rightPressed = cursors.right.isDown || this.keys.right.isDown;
        const jumpJustPressed = (cursors.up.isDown || this.keys.up.isDown || this.keys.jump.isDown) && isOnGround;
    
        //Movimientos
        if (leftPressed) {
            this.player.setVelocityX(-200);
            this.lastDirection = 'left';
            if (isOnGround) this.player.anims.play('left', true);
        } else if (rightPressed) {
            this.player.setVelocityX(200);
            this.lastDirection = 'right';
            if (isOnGround) this.player.anims.play('right', true);
        } else {
            this.player.setVelocityX(0);
            if (isOnGround) this.player.anims.play('turn', true);
        }
        
        // Saltar
        if (jumpJustPressed) {
            this.player.setVelocityY(-330);
        }
        
        if (!isOnGround) {
            if (this.lastDirection === 'left') {
                this.player.anims.play('jumpLeft', true);
            } else {
                this.player.anims.play('jumpRight', true);
            }
        }

        this.enemies.children.iterate(function (enemy) {
            const distance = Math.abs(enemy.x - enemy.startX);
        
            if (distance >= enemy.maxDistance) {
                enemy.setVelocityX(enemy.body.velocity.x * -1);
                enemy.startX = enemy.x;
            }
        
            // Animaciones según dirección
            if (enemy.body.velocity.x < 0) {
                enemy.anims.play('enemyLeft', true);
            } else if (enemy.body.velocity.x > 0) {
                enemy.anims.play('enemyRight', true);
            }
        });
        
    }
    
};

// metodo para recolectar estrellas 
function collectStar(player, star) {
    star.disableBody(true, true);

    score += 1;
    scoreText.setText('Monedas: ' + score);

    if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });

        const x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        const bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
}

// Configuracion por defecto
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [MenuScene, GameScene]
};

const game = new Phaser.Game(config);