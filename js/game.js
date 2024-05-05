const configurations = {
    type: Phaser.AUTO,
    width: 288,
    height: 512,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

const assets = {
    character: {
        hoa: 'hoa',
        dikbutt: 'dikbutt',
        nanana: 'nanana'
    },
    obstacle: {
        pipe: {
            green: {
                top: 'pipe-green-top',
                bottom: 'pipe-green-bottom'
            },
            red: {
                top: 'pipe-red-top',
                bottom: 'pipe-red-bottom'
            }
        }
    },
    scene: {
        width: 144,
        background: {
            day: 'day',
            night: 'night',
            final: 'final'
        },
        ground: 'ground',
        gameOver: 'game-over',
        introMessage: 'intro-message',
        muteButton: 'mute-button'
    },
    scoreboard: {
        width: 25,
        base: 'number',
        number0: 'number0',
        number1: 'number1',
        number2: 'number2',
        number3: 'number3',
        number4: 'number4',
        number5: 'number5',
        number6: 'number6',
        number7: 'number7',
        number8: 'number8',
        number9: 'number9'
    },
    animation: {
        character: {
            hoa: {
                go: 'hoa-go',
                stop: 'hoa-stop'
            },
            dikbutt: {
                go: 'dikbutt-go',
                stop: 'dikbutt-stop'
            }, 
            nanana: {
                go: 'nanana-go',
                stop: 'nanana-stop'
            }
        }
    }
}

const game = new Phaser.Game(configurations);

let gameOver;
let gameStarted;
let spaceBar;
let gameOverBanner;
let introMessage; 
let player; 
let character;
let framesMoveUp; 
let backgroundDay;
let backgroundNight;
let backgroundFinal;
let ground;
let pipesGroup;
let gapsGroup;
let nextPipes; 
let currentPipe;
let scoreboardGroup; 
let score;
let muteButton;

function preload() {
    this.load.image(assets.scene.background.day, 'assets/background/day.png');
    this.load.image(assets.scene.background.night, 'assets/background/night.png');
    this.load.image(assets.scene.background.final, 'assets/background/final.png');
    this.load.image(assets.scene.ground, 'assets/background/ground.png');
    this.load.image(assets.obstacle.pipe.green.top, 'assets/background/pipe-green-top.png');
    this.load.image(assets.obstacle.pipe.green.bottom, 'assets/background/pipe-green-bottom.png');
    this.load.image(assets.obstacle.pipe.red.top, 'assets/background/pipe-red-top.png');
    this.load.image(assets.obstacle.pipe.red.bottom, 'assets/background/pipe-red-bottom.png');
    this.load.image(assets.scene.introMessage, 'assets/background/intro-message.png');
    this.load.image(assets.scene.gameOver, 'assets/background/gameover.png');

    this.load.image(assets.scoreboard.number0, 'assets/numbers/number0.png');
    this.load.image(assets.scoreboard.number1, 'assets/numbers/number1.png');
    this.load.image(assets.scoreboard.number2, 'assets/numbers/number2.png');
    this.load.image(assets.scoreboard.number3, 'assets/numbers/number3.png');
    this.load.image(assets.scoreboard.number4, 'assets/numbers/number4.png');
    this.load.image(assets.scoreboard.number5, 'assets/numbers/number5.png');
    this.load.image(assets.scoreboard.number6, 'assets/numbers/number6.png');
    this.load.image(assets.scoreboard.number7, 'assets/numbers/number7.png');
    this.load.image(assets.scoreboard.number8, 'assets/numbers/number8.png');
    this.load.image(assets.scoreboard.number9, 'assets/numbers/number9.png');

    this.load.audio('flap', 'assets/audio/flap.mp3');
    this.load.audio('die', 'assets/audio/die.mp3');
    this.load.audio('ding', 'assets/audio/ding.mp3');
    this.load.audio('dikbutt', 'assets/audio/dikbutt.mp3');
    this.load.audio('techno1', 'assets/audio/techno1.mp3');
    this.load.audio('techno2', 'assets/audio/techno2.mp3');
    this.load.audio('techno3', 'assets/audio/techno3.mp3');
    this.load.audio('techno4', 'assets/audio/techno4.mp3');
    this.load.audio('techno5', 'assets/audio/techno5.mp3');

    this.load.image(assets.scene.muteButton, 'assets/background/mute-button.png');

    this.load.spritesheet(assets.character.hoa, 'assets/characters/hoa.png', {frameWidth: 30, frameHeight: 29});
    this.load.spritesheet(assets.character.dikbutt, 'assets/characters/dikbutt.png', {frameWidth: 25, frameHeight: 31});
    this.load.spritesheet(assets.character.nanana, 'assets/characters/nanana.png', {frameWidth: 23, frameHeight: 29});
}

function create() {
    backgroundDay = this.add.image(assets.scene.width, 256, assets.scene.background.day).setInteractive();
    backgroundNight = this.add.image(assets.scene.width, 256, assets.scene.background.night).setInteractive();
    backgroundFinal = this.add.image(assets.scene.width, 256, assets.scene.background.final).setInteractive();
    backgroundDay.on('pointerdown', () => flapCharacter(this));
    backgroundNight.on('pointerdown', () => flapCharacter(this));
    backgroundFinal.on('pointerdown', () => flapCharacter(this));
    backgroundNight.visible = false
    backgroundFinal.visible = false

    spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    spaceBar.on('down', () => flapCharacter(this));

    gapsGroup = this.physics.add.group();
    pipesGroup = this.physics.add.group();
    scoreboardGroup = this.physics.add.staticGroup();

    ground = this.physics.add.sprite(assets.scene.width, 458, assets.scene.ground)
    ground.setCollideWorldBounds(true)
    ground.setDepth(10)

    introMessage = this.add.image(assets.scene.width, 165, assets.scene.introMessage)
    introMessage.setDepth(30)
    introMessage.visible = false

    this.muteButton = this.add.sprite(3, 490, 'mute-button').setOrigin(0, 0).setDepth(100).setInteractive();
    this.muteButton.on('pointerup', function() {
        this.sound.mute = !this.sound.mute;
    }, this);
    this.muteButton.visible = false;

    // HOA Animations
    this.anims.create({
        key: assets.animation.character.hoa.go,
        frames: this.anims.generateFrameNumbers(assets.character.hoa, {
            start: 0,
            end: 7
        }),
        frameRate: 10,
        repeat: -1
    })
    this.anims.create({
        key: assets.animation.character.hoa.stop,
        frames: [{
            key: assets.character.hoa,
            frame: 0
        }],
        frameRate: 20
    })

    // Dikbutt Animations
    this.anims.create({
        key: assets.animation.character.dikbutt.go,
        frames: this.anims.generateFrameNumbers(assets.character.dikbutt, {
            start: 0,
            end: 11
        }),
        frameRate: 10,
        repeat: -1
    })
    this.anims.create({
        key: assets.animation.character.dikbutt.stop,
        frames: [{
            key: assets.character.dikbutt,
            frame: 1
        }],
        frameRate: 20
    })

    // nanana Animations
    this.anims.create({
        key: assets.animation.character.nanana.go,
        frames: this.anims.generateFrameNumbers(assets.character.nanana, {
            start: 0,
            end: 5
        }),
        frameRate: 6,
        repeat: -1
    })
    this.anims.create({
        key: assets.animation.character.nanana.stop,
        frames: [{
            key: assets.character.nanana,
            frame: 1
        }],
        frameRate: 20
    })

    this.dingSound = this.sound.add('ding', {volume: 0.05});
    this.dieSound = this.sound.add('die', {volume: 0.2});
    this.flapSound = this.sound.add('flap', {volume: 0.1});
    this.dikbuttSound = this.sound.add('dikbutt', {volume: 0.1, loop: true});
    this.techno1Sound = this.sound.add('techno1', {volume: 1, loop: true});
    this.techno2Sound = this.sound.add('techno2', {volume: 0.5, loop: true});
    this.techno3Sound = this.sound.add('techno3', {volume: 1, loop: true});
    this.techno4Sound = this.sound.add('techno4', {volume: 0.5, loop: true});
    this.techno5Sound = this.sound.add('techno5', {volume: 1, loop: true});

    prepareGame(this);

    gameOverBanner = this.add.image(assets.scene.width, 206, assets.scene.gameOver)
    gameOverBanner.setDepth(20)
    gameOverBanner.visible = false
}

// Update the scene frame by frame, move/rotate character and move pipes/gaps
function update() {
    if (gameOver || !gameStarted) return

    if (framesMoveUp > 0) {
        framesMoveUp--
    } else {
        player.setVelocityY(150) 
        if (player.angle < 90) player.angle += 2
    }

    pipesGroup.children.iterate(function (child) {
        if (child == undefined) return
        if (child.x < -50) child.destroy()
        else child.setVelocityX(-100)
    })

    gapsGroup.children.iterate(function (child) {
        child.body.setVelocityX(-100)
    })

    nextPipes++
    if (nextPipes === 130) {
        makePipesAndGaps(game.scene.scenes[0])
        nextPipes = 0
    }
}

// Player collision event. Game object that collided, in this case the character. 
function playerDied(player) {
    this.physics.pause()
    player.anims.play(getCharacterAnimation(character).stop)
    this.dieSound.play();
    this.techno4Sound.stop();
    gameOver = true
    gameStarted = false
    gameOverBanner.visible = true
}

function updatePipes() {
    if (score % 2 == 0) {
        currentPipe = assets.obstacle.pipe.green;
    } else {
        currentPipe = assets.obstacle.pipe.red;
    }
}

function updateBackground() {
    if (score < 10) {
        backgroundDay.visible = true
        backgroundNight.visible = false
        backgroundFinal.visible = false
    } else if (score < 20) {
        backgroundDay.visible = false
        backgroundNight.visible = true
        backgroundFinal.visible = false  
    } else if (score < 30) {
        backgroundDay.visible = true
        backgroundNight.visible = false
        backgroundFinal.visible = false  
    } else if (score < 40) {
        backgroundDay.visible = false
        backgroundNight.visible = true
        backgroundFinal.visible = false  
    } else if (score < 50) {
        backgroundDay.visible = true
        backgroundNight.visible = false
        backgroundFinal.visible = false 
    } else {
        backgroundDay.visible = false
        backgroundNight.visible = false
        backgroundFinal.visible = true
    }
}

function updateScore(_, gap) {
    score++
    this.dingSound.play();
    gap.destroy();

    updatePipes();
    updateBackground();
    updateScoreboard();
}

function makePipesAndGaps(scene) {
    if (!gameStarted || gameOver) return

    const pipeTopY = Phaser.Math.Between(-120, 120);
    pipesGroup.create(288, pipeTopY, currentPipe.top);
    pipesGroup.create(288, pipeTopY + 420, currentPipe.bottom);

    const gap = scene.add.line(288, pipeTopY + 210, 0, 0, 0, 98);
    gapsGroup.add(gap);
    gap.visible = false;
}

function flapCharacter(scene) {
    if (gameOver) {
        restartGame();
        return;
    }
    if (!gameStarted) {
        startGame(game.scene.scenes[0]);
        scene.techno4Sound.play();
    }
    //scene.flapSound.play(); // Removed for now, kinda annoying.
    player.setVelocityY(-380);
    player.angle = -20;
    framesMoveUp = 6;
}


function getRandomCharacter() {
    rng = Phaser.Math.Between(0, 2)
    if (rng == 0) {
        return assets.character.hoa;
    } else if (rng == 1) {
        return assets.character.dikbutt;
    } else {
        return assets.character.nanana;
    }
}

function getCharacterAnimation(character) {
    if (character === assets.character.hoa) {
        return assets.animation.character.hoa;
    } else if (character === assets.character.dikbutt) {
        return assets.animation.character.dikbutt;
    } else {
        return assets.animation.character.nanana;
    }
}

function updateScoreboard() {
    scoreboardGroup.clear(true, true)

    const scoreAsString = score.toString()
    // single digit vs multi-digit score on scoreboard
    if (scoreAsString.length == 1)
        scoreboardGroup.create(assets.scene.width, 30, assets.scoreboard.base + score).setDepth(10)
    else {
        let initialPosition = assets.scene.width - ((score.toString().length * assets.scoreboard.width) / 2)

        for (let i = 0; i < scoreAsString.length; i++) {
            scoreboardGroup.create(initialPosition, 30, assets.scoreboard.base + scoreAsString[i]).setDepth(10)
            initialPosition += assets.scoreboard.width
        }
    }
}

// Restart the game, clear groups, hide game over objects and stop game physics.  
function restartGame() {
    pipesGroup.clear(true, true);
    gapsGroup.clear(true, true);
    scoreboardGroup.clear(true, true);
    player.destroy();
    gameOverBanner.visible = false;

    const gameScene = game.scene.scenes[0];
    prepareGame(gameScene);

    gameScene.physics.resume();
}

// Prepare game to be played
function prepareGame(scene) {
    framesMoveUp = 0
    nextPipes = 0
    currentPipe = assets.obstacle.pipe.green
    score = 0
    gameOver = false
    backgroundDay.visible = true
    backgroundNight.visible = false
    backgroundFinal.visible = false
    introMessage.visible = true
    scene.muteButton.visible = true
    character = getRandomCharacter()
    player = scene.physics.add.sprite(55, 245, character)
    player.setScale(1.1);
    player.setCollideWorldBounds(true)
    player.anims.play(getCharacterAnimation(character).go, true)

    scene.physics.add.collider(player, ground, playerDied, null, scene) // player can hit ground
    scene.physics.add.collider(player, pipesGroup, playerDied, null, scene) // player can hit pipes
    scene.physics.add.overlap(player, gapsGroup, updateScore, null, scene) // player gains point on pipe gap overlap
}

function startGame(scene) {
    gameStarted = true
    introMessage.visible = false
    scene.muteButton.visible = false
    const score0 = scoreboardGroup.create(assets.scene.width, 30, assets.scoreboard.number0)
    score0.setDepth(20)

    makePipesAndGaps(scene)
}