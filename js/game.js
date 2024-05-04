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
        dikbutt: 'dikbutt'
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
            night: 'night'
        },
        ground: 'ground',
        gameOver: 'game-over',
        introMessage: 'intro-message'
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
            }
        }
    }
}

const game = new Phaser.Game(configurations)

let gameOver
let gameStarted
let upButton
let gameOverBanner 
let introMessage 
let player 
let character
let framesMoveUp 
let backgroundDay
let backgroundNight
let ground
let pipesGroup
let gapsGroup
let nextPipes 
let currentPipe
let scoreboardGroup 
let score
let inputDisabled

function preload() {
    this.load.image(assets.scene.background.day, 'assets/background/day.png')
    this.load.image(assets.scene.background.night, 'assets/background/night.png')
    this.load.image(assets.scene.ground, 'assets/background/ground.png')
    this.load.image(assets.obstacle.pipe.green.top, 'assets/background/pipe-green-top.png')
    this.load.image(assets.obstacle.pipe.green.bottom, 'assets/background/pipe-green-bottom.png')
    this.load.image(assets.obstacle.pipe.red.top, 'assets/background/pipe-red-top.png')
    this.load.image(assets.obstacle.pipe.red.bottom, 'assets/background/pipe-red-bottom.png')
    this.load.image(assets.scene.introMessage, 'assets/background/intro-message.png')
    this.load.image(assets.scene.gameOver, 'assets/background/gameover.png')

    this.load.image(assets.scoreboard.number0, 'assets/numbers/number0.png')
    this.load.image(assets.scoreboard.number1, 'assets/numbers/number1.png')
    this.load.image(assets.scoreboard.number2, 'assets/numbers/number2.png')
    this.load.image(assets.scoreboard.number3, 'assets/numbers/number3.png')
    this.load.image(assets.scoreboard.number4, 'assets/numbers/number4.png')
    this.load.image(assets.scoreboard.number5, 'assets/numbers/number5.png')
    this.load.image(assets.scoreboard.number6, 'assets/numbers/number6.png')
    this.load.image(assets.scoreboard.number7, 'assets/numbers/number7.png')
    this.load.image(assets.scoreboard.number8, 'assets/numbers/number8.png')
    this.load.image(assets.scoreboard.number9, 'assets/numbers/number9.png')

    this.load.audio('ding', 'assets/audio/ding.mp3');

    this.load.spritesheet(assets.character.hoa, 'assets/characters/hoa.png', {frameWidth: 30, frameHeight: 29})
    this.load.spritesheet(assets.character.dikbutt, 'assets/characters/dikbutt.png', {frameWidth: 25, frameHeight: 31})
}

function create() {
    backgroundDay = this.add.image(assets.scene.width, 256, assets.scene.background.day).setInteractive()
    backgroundNight = this.add.image(assets.scene.width, 256, assets.scene.background.night).setInteractive()
    backgroundDay.on('pointerdown', flapCharacter)
    backgroundNight.on('pointerdown', flapCharacter)
    backgroundNight.visible = false

    gapsGroup = this.physics.add.group()
    pipesGroup = this.physics.add.group()
    scoreboardGroup = this.physics.add.staticGroup()

    ground = this.physics.add.sprite(assets.scene.width, 458, assets.scene.ground)
    ground.setCollideWorldBounds(true)
    ground.setDepth(10)

    introMessage = this.add.image(assets.scene.width, 165, assets.scene.introMessage)
    introMessage.setDepth(30)
    introMessage.visible = false

    upButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)

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
            frame: 1
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

    this.dingSound = this.sound.add('ding', {volume: 0.2});

    prepareGame(this)

    gameOverBanner = this.add.image(assets.scene.width, 206, assets.scene.gameOver)
    gameOverBanner.setDepth(20)
    gameOverBanner.visible = false
}

// Update the scene frame by frame, move/rotate character and move pipes/gaps
function update() {
    if (gameOver || !gameStarted) return

    if (framesMoveUp > 0) {
        framesMoveUp--
    } else if (Phaser.Input.Keyboard.JustDown(upButton)) {
        flapCharacter()
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
    player.anims.play(getCharacterAnimation(character).stop)
    this.physics.pause()
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
    if (score % 10 == 0) {
        backgroundDay.visible = !backgroundDay.visible
        backgroundNight.visible = !backgroundNight.visible
    } 
    /*
    // For future final background, after level 50
    // Make it golden or something
    else if (score > 49) {
        backgroundDay.visible = false
        backgroundNight.visible = false
        backgroundFinal.visible = true
    }   
    */
}

function updateScore(_, gap) {
    score++
    this.dingSound.play();
    gap.destroy()

    updatePipes()
    updateBackground()
    updateScoreboard()
}

function makePipesAndGaps(scene) {
    if (!gameStarted || gameOver) return

    const pipeTopY = Phaser.Math.Between(-120, 120)
    pipesGroup.create(288, pipeTopY, currentPipe.top)
    pipesGroup.create(288, pipeTopY + 420, currentPipe.bottom)

    const gap = scene.add.line(288, pipeTopY + 210, 0, 0, 0, 98)
    gapsGroup.add(gap)
    gap.visible = false
}

function flapCharacter() {
    if (gameOver) {
        restartGame();
        return;
    }
    if (!gameStarted) startGame(game.scene.scenes[0]);

    player.setVelocityY(-380)
    player.angle = -20
    framesMoveUp = 6
}

function getRandomCharacter() {
    rng = Phaser.Math.Between(0, 1)
    if (rng == 0) {
        return assets.character.hoa;
    } else {
        return assets.character.dikbutt;
    }
}

function getCharacterAnimation(character) {
    if (character === assets.character.hoa) {
        return assets.animation.character.hoa;
    } else {
        return assets.animation.character.dikbutt;
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
    pipesGroup.clear(true, true)
    gapsGroup.clear(true, true)
    scoreboardGroup.clear(true, true)
    player.destroy()
    gameOverBanner.visible = false

    const gameScene = game.scene.scenes[0]
    prepareGame(gameScene)

    gameScene.physics.resume()
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
    introMessage.visible = true

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

    const score0 = scoreboardGroup.create(assets.scene.width, 30, assets.scoreboard.number0)
    score0.setDepth(20)

    makePipesAndGaps(scene)
}