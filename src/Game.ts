import { clamp, type Rect } from "./utils/utils"
import { onMounted, type Ref, onBeforeUnmount } from "vue"
import InvaderImg from '@/assets/sprites/Invader0.svg?url'
import PlayerImg from '@/assets/sprites/Player.svg?url'
import shootSoundFile from '@/assets/audio/shoot.wav?url'
const shootSound = new Audio(shootSoundFile)

interface Projectile {
  x: number
  y: number,
  timestamp: number
}

interface Invader {
  x: number,
  y: number
}

interface GameOptions {
  $canvas: Ref<HTMLCanvasElement | undefined>
}

const keys = {
  left: 37,
  right: 39,
  spacebar: 32
}

export function useGame({ $canvas }: GameOptions) {
  const config = {
    projectileInterval: 2000,
    invadersMoveInterval: 1200,
    playerMoveSpeed: 1 * 0.0002,
    invaderMoveSpeed: 1 * 0.03,
    playerSize: 40,
    invaderSize: 50
  }

  let gameWidth = window.innerWidth * 0.9
  let gameHeight = window.innerHeight * 0.9

  let score = 0

  let invaderRatio = 1;
  let invaderSpacing = 5
  let projectileWidth = 3
  let projectileHeight = 10
  let devicePixelRatio = 1
  let playerPosX = gameWidth / 2
  let leftPressed = false
  let rightPressed = false
  let spacebarPressed = false
  let invadersPerRowDesc: number[] = [10, 5, 7]
  let invaders: Invader[] = []
  let invadersLastTimestamp = Date.now()
  let invadersMoveRight = true

  let context: CanvasRenderingContext2D | undefined | null
  let renderLoop: number | undefined

  const playerProjectiles: Projectile[] = []

  let previousTimeStamp: number;

  function setupInvaders() {
    let y = gameHeight * 0.1;

    for (let row = 0; row < invadersPerRowDesc.length; row++) {
      const perRow = invadersPerRowDesc[row];

      let x = gameWidth;
      x -= (perRow * (config.invaderSize + invaderSpacing));
      x /= 2;
      x += (invaderSpacing + config.invaderSize) / 2;

      

      for (let invader = 0; invader < invadersPerRowDesc[row]; invader++) {
        invaders.push({x: x, y: y});

        x += config.invaderSize + invaderSpacing;
      }

      y += (config.invaderSize / invaderRatio) + invaderSpacing;
    }
  }

  function updateInvaders() {

    invadersSideWallHitCheck()

    if (Date.now() - invadersLastTimestamp < config.invadersMoveInterval) {
      return
    }

    if (invadersMoveRight) {
      for (let invader = 0; invader < invaders.length; invader++) {
        invaders[invader].x += gameWidth * config.invaderMoveSpeed
      } 
    }
    else {
      for (let invader = 0; invader < invaders.length; invader++) {
        invaders[invader].x -= config.invaderMoveSpeed
      } 
    }

    invadersLastTimestamp = Date.now()
  }

  function invadersSideWallHitCheck() {
    if (Date.now() - invadersLastTimestamp < config.invadersMoveInterval) {
      return
    }

    if (invadersMoveRight) {
      for (let i = 0; i < invaders.length; i++) {
        if (checkCollision(
          {x1: invaders[i].x - config.invaderSize / 2, y1: invaders[i].y - config.invaderSize / 2, x2: invaders[i].x + config.invaderSize / 2, y2: invaders[i].y + config.invaderSize / 2},
          {x1: gameWidth - config.invaderSize / 2, y1: 0, x2: gameWidth + 100, y2: gameHeight}
          )) {
            invadersMoveRight = false
            for (let i = 0; i < invaders.length; i++) {
              invaders[i].y += gameHeight / 15
              if (invaders[i].y >= gameHeight && renderLoop) {
                console.log('u lost')
                window.cancelAnimationFrame(renderLoop)
                return
              }
            }
            invadersLastTimestamp = Date.now()
            return
          }
      }
    }
    else {
      for (let i = 0; i < invaders.length; i++) {
        if (checkCollision(
          {x1: invaders[i].x - config.invaderSize / 2, y1: invaders[i].y - config.invaderSize / 2, x2: invaders[i].x + config.invaderSize / 2, y2: invaders[i].y + config.invaderSize / 2},
          {x1: 0, y1: 0, x2: config.invaderSize / 2, y2: gameHeight}
          )) {
            invadersMoveRight = true
            for (let i = 0; i < invaders.length; i++) {
              invaders[i].y += gameHeight / 15
              if (invaders[i].y >= gameHeight && renderLoop) {
                console.log('u lost')
                window.cancelAnimationFrame(renderLoop)
                return
              }
            }
            invadersLastTimestamp = Date.now()
            return
          }
      }
    }
  }

  function checkCollision(r1: Rect, r2: Rect) {
    return r1.x1 < r2.x2 && r1.x2 > r2.x1 && r1.y1 < r2.y2 && r1.y2 > r2.y1
  }

  function projectileHitCheck() {
    const proj = playerProjectiles.at(-1)

    if (!proj) {
      return
    }

    for (let i = 0; i < invaders.length; i++) {
      if (checkCollision(
        {x1: proj.x - projectileWidth / 2, y1: proj.y - projectileHeight / 2, x2: proj.x + projectileWidth / 2, y2: proj.y + projectileHeight / 2},
        {x1: invaders[i].x - (config.invaderSize / 2), y1: invaders[i].y - config.invaderSize / 2, x2: invaders[i].x + config.invaderSize / 2, y2: invaders[i].y + config.invaderSize / 2}
        )) {

        invaders.splice(i, 1)
        config.invadersMoveInterval = clamp(config.invadersMoveInterval - 1000 / invaders.length, 50, 10000)
        console.log(config.invadersMoveInterval)
        playerProjectiles.pop()
        score++
      }
    }
  }

  window.addEventListener('keydown', (e) => {
    switch (e.keyCode) {
      case keys.left:
        leftPressed = true
        break
      case keys.right:
        rightPressed = true
        break
      case keys.spacebar:
        spacebarPressed = true
        break
    }
  })

  window.addEventListener('keyup', (e) => {
    switch (e.keyCode) {
      case keys.left:
        leftPressed = false
        break
      case keys.right:
        rightPressed = false
        break
      case keys.spacebar:
        spacebarPressed = false
        break
    }
  })

  function shoot() {

    const lastTimestamp = playerProjectiles.at(-1)?.timestamp

    if (lastTimestamp && Date.now() - lastTimestamp < config.projectileInterval) {
      return
    }

    playerProjectiles.push({
      x: playerPosX,
      y: gameHeight - 30,
      timestamp: Date.now()
    })
  }
    
  function update(timeStamp: number) {
  
    const delta = timeStamp - previousTimeStamp
  
    if (leftPressed) {
      playerPosX = clamp(playerPosX - delta * gameWidth * config.playerMoveSpeed, config.playerSize / 2, gameWidth)
    }
    if (rightPressed) {
      playerPosX = clamp(playerPosX + delta * gameWidth * config.playerMoveSpeed, 0, gameWidth - config.playerSize / 2)
    }
    if (spacebarPressed) {
      shoot()
    }

    for (let i = 0; i < playerProjectiles.length; ++i) {
      playerProjectiles[i].y -= delta * gameHeight * 0.0007
    }

    projectileHitCheck()

    updateInvaders()
  
    previousTimeStamp = timeStamp;
  }

  const invaderImg = new Image()
  invaderImg.src = InvaderImg
  const playerImg = new Image()
  playerImg.src = PlayerImg

  function toRatioSize(value: number) {
    return value * devicePixelRatio
  }

  function render(timeStamp: number) {
    renderLoop = requestAnimationFrame(render)

    if (!context) {
      return
    }

    context.clearRect(0, 0, toRatioSize(gameWidth), toRatioSize(gameHeight))

    context.fillText(score.toString(), toRatioSize(15), toRatioSize(25), 100)

    //context.fillRect(toRatioSize(playerPosX - config.playerSize / 2), toRatioSize(gameHeight - 20), toRatioSize(config.playerSize), toRatioSize(10))
    context.drawImage(playerImg, toRatioSize(playerPosX - config.playerSize / 2), toRatioSize(gameHeight - config.playerSize), toRatioSize(config.playerSize), toRatioSize(config.playerSize))

    for (let i = 0; i < playerProjectiles.length; i++) {
      if (playerProjectiles[i].y < 0) {
        playerProjectiles.splice(i, 1)
        break
      }
      context.fillRect(toRatioSize(playerProjectiles[i].x - projectileWidth / 2), toRatioSize(playerProjectiles[i].y - projectileHeight / 2), toRatioSize(projectileWidth), toRatioSize(projectileHeight))
    }

    for (let i = 0; i < invaders.length; i++) {
      //context.fillRect(invaders[i].x - config.invaderSize / 2, invaders[i].y - config.invaderSize / 2, config.invaderSize, config.invaderSize)
      context.drawImage(invaderImg, toRatioSize(invaders[i].x - config.invaderSize / 2), toRatioSize(invaders[i].y - config.invaderSize / 2), toRatioSize(config.invaderSize), toRatioSize(config.invaderSize * 1.25))
    }
    
    update(timeStamp)
  }

  function updateSizes() {
    gameWidth = window.innerWidth * 0.9
    gameHeight = window.innerHeight * 0.9

    if (!$canvas.value) {
      return
    }

    devicePixelRatio = window.devicePixelRatio

    $canvas.value.width = gameWidth * devicePixelRatio
    $canvas.value.height = gameHeight * devicePixelRatio

    $canvas.value.style.width = gameWidth + 'px'
    $canvas.value.style.height = gameHeight + 'px'
  }

  function setup() {
    updateSizes();
    setupInvaders();
    context = $canvas.value!.getContext('2d')

    if (context) {
      context.fillStyle = '#ffffff'
      context.font = ' 70px Pixelify Sans'
    }

    renderLoop = requestAnimationFrame(render)
  }

  onMounted(() => {
    document.fonts.ready.then(setup);

    window.addEventListener('keydown', (e) => {
      switch (e.keyCode) {
        case keys.left:
          leftPressed = true
          break
        case keys.right:
          rightPressed = true
          break
        case keys.spacebar:
          spacebarPressed = true
          break
      }
    })
  
    window.addEventListener('keyup', (e) => {
      switch (e.keyCode) {
        case keys.left:
          leftPressed = false
          break
        case keys.right:
          rightPressed = false
          break
        case keys.spacebar:
          spacebarPressed = false
          break
      }
    })

    

    window.addEventListener('resize', updateSizes)
  })

  onBeforeUnmount(() => {
    renderLoop && cancelAnimationFrame(renderLoop)
  })

  return { playerProjectiles, gameWidth, gameHeight, playerPosX, leftPressed, rightPressed, spacebarPressed}
}