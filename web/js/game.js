let game = null;

const F_NORTH = 0;
const F_EAST = 1;
const F_SOUTH = 2;
const F_WEST = 3;

async function loadFonts() {
  if (document.fonts) {
    // Here you could trigger font loading if necessary
    await loadCustomFont('Scribble', 'fonts/ScribbleChild.ttf');
    await document.fonts.ready;
  } else {
    console.warn("Fonts API not available; skipping font preload.");
  }
}

// Bootstrap with font loading
(async () => {
  await loadFonts(); // Wait until fonts are ready

  const config = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,  // or Phaser.Scale.FIT if you want aspect ratio
      width: 800,
      height: 600
    },
    width: 800,
    height: 600,
    backgroundColor: "#EEE",
    scene: {
      preload,
      create,
      update,
    },
  };

  game = new Phaser.Game(config);
})();

let playerMaxHP = 70;
let playerHP = playerMaxHP;
let playerAttack = 1;
let currentRoomIndex = -1;
const levelStatus = {
  darkPulse: false
}

window.levelStatus = levelStatus;

const endRoom = {
  enter: {
    x: 2,
    y: 5,
    facing: 0,
  },
  map: [
    [1, 1, 1, 1, 1],
    [1, 0, 6, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 0, 1, 1]
  ],
  relics: [],
  monsters: [],
  signs: [{
    message: "I am the blue chicken.",
    sprite: 'blueChicken',
    onInteract() {
      timeSeconds = timeSeconds / 1000;
      let remainingSeconds = timeSeconds % 60;
      if (remainingSeconds < 10) {
        remainingSeconds = '0' + (timeSeconds%60).toFixed(2);
      } else {
        remainingSeconds = (timeSeconds%60).toFixed(2);
      }
      const relicCount = player.inventory.reduce((acum, item) => acum + (item.relic ? 1 : 0), 0);
      const scoreString = '\nTIME: ' + Math.floor(timeSeconds/60) + ":" + remainingSeconds + " Eggs: " + relicCount + "/3";
      gameOver = true;
      switch (relicCount) {
        case 0:
          showMessage(sceneRef, "You rushed through life, but left empty." + scoreString);
          return;
        case 1:
          showMessage(sceneRef, "You were quick, maybe too quick..." + scoreString);
          return;
        case 2:
          showMessage(sceneRef, "You lived a little bit, but forgot some." + scoreString);
          return;
        case 3:
          showMessage(sceneRef, "A fulfilling life, but at what cost?" + scoreString);
          return;
      }
    }
   }],
};

let timeSeconds = 0;
let gameOver = false;

const rooms = [
  {
    name: "The Chamber of Flickering Paths",
    pulses: true,
    enter: {
      x: 0,
      y: 5,
      facing: 1,
    },
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 1, 1, 1, 1, 7, 7, 7, 7, 1, 1],
      [1, 0, 0, 3, 6, 0, 1, 1, 7, 1, 7, 1, 1],
      [1, 0, 0, 1, 1, 0, 0, 7, 7, 1, 7, 1, 1],
      [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 7, 7, 2],
      [0, 0, 0, 1, 0, 6, 0, 0, 0, 1, 1, 1, 1],
      [1, 0, 0, 3, 0, 1, 1, 1, 0, 0, 0, 0, 1],
      [1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 3, 0, 1, 0, 7, 7, 7, 0, 1, 1],
      [1, 0, 0, 1, 0, 0, 6, 1, 1, 1, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    relics: [{ x: 11, y: 9, name: "Odd Egg", relic: true, sprite: 'egg1', effect: 'quickCombat' }],
    signs: [
      {
        message:
          "A voice says: He who walks in darkness will live",
      },
      { message: "A voice says: This is the way." },
      { message: "A voice yells: GO AWAY!" },
    ],
    monsters: [],
  },
  {
    name: "The Hall of Reflections",
    enter: {
      x: 6,
      y: 0,
      facing: 2,
    },
    map: [
      [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 6, 1],
      [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 3, 1, 1],
      [1, 0, 6, 0, 0, 6, 0, 0, 0, 1, 0, 0, 1],
      [1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1],
    ],
    relics: [{ x: 11, y: 9, name: "Ambitious Egg", relic: true, sprite: 'egg2', effect: 'extendHP' }],
    signs: [
      {
        sprite: 'mirror',
        message:
          "There is a mirror here\nYou see an inverted version of yourself",
          facing: F_NORTH
      },
      { sprite: 'mirror', message: "There is a mirror here\nYou see yourself walking backwards",
        facing: F_WEST },
      { sprite: 'mirror', message: "There is a mirror here\nIt's just you.",
        facing: F_EAST },
      {
        sprite: 'mirror',
        message:
          "There is a mirror here\nYou see the blue chicken pecking at the ground",
          facing: F_SOUTH
      },
      { message: "There is a sign here, it reads:\nFarewell.",
        facing: F_SOUTH},
    ],
    monsters: [],
  },
  {
    name: "The Shifting Hall",
    enter: {
      x: 4,
      y: 11,
      facing: 0,
    },
    map: [
      [1, 0, 1, 0, 1, 0, 1, 5, 1],
      [1, 0, 1, 0, 1, 2, 1, 0, 1],
      [1, 5, 1, 5, 1, 0, 1, 0, 1],
      [1, 3, 1, 3, 1, 3, 1, 0, 1],
      [1, 6, 1, 6, 1, 6, 1, 3, 1],
      [1, 0, 0, 0, 0, 0, 1, 6, 1],
      [1, 0, 1, 0, 1, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 1, 1],
      [1, 0, 0, 0, 1, 1, 0, 1, 1],
      [1, 0, 0, 0, 6, 0, 0, 1, 1],
      [1, 1, 1, 1, 0, 1, 1, 1, 1],
    ],
    relics: [{ x: 7, y: 1, name: "Vibrating Egg", relic: true, sprite: 'egg3', effect: 'extendPower' }],
    signs: [
      {
        rotatingMessages: [
          "There is a sign here, it reads:\nLeave now",
          "There is a sign here, it reads:\nThis is the way",
          "There is a sign here, it reads:\nUse the door to the left",
        ],
      },
      {
        rotatingMessages: [
          "There is a sign here, it reads:\nLeave now",
          "There is a sign here, it reads:\nThis is the way",
          "There is a sign here, it reads:\nUse the door to the right",
        ],
      },
      { message: "There is a sign here, it reads:\nLeave now" },
      { message: "There is a sign here, it reads:\nThis is the way" },
      { message: "There is a sign here, it reads:\nThe true sign stays true" },
    ],
    monsters: [],
  },
  {
    charMap: [
      "11112111",
      "1F1000B1",
      "101C0001",
      "1E100001",
      "13111411",
      "10001001",
      "10D01001",
      "11100001",
      "10000001",
      "111111A1",
    ],
    charkeys: {
      A: {type: 'enter', facing: 0},
      B: {type: 'monster', monsterType: 'chickenRogue'},
      C: {type: 'monster', monsterType: 'chickenKnight'},
      D: {type: 'monster', monsterType: 'chickenMage'},
      E: {type: 'monster', monsterType: 'chickenRogue'},
      F: {type: 'key'},
    }
  },
  {
    charMap: [
      "12111111",
      "101000B1",
      "14101111",
      "10000001",
      "1000D101",
      "11131111",
      "103001F1",
      "10100131",
      "1010C001",
      "1A111111",
    ],
    charkeys: {
      A: {type: 'enter', facing: 0},
      B: {type: 'monster', monsterType: 'chickenRogue'},
      C: {type: 'monster', monsterType: 'chickenKnight'},
      D: {type: 'monster', monsterType: 'chickenMage'},
      E: {type: 'monster', monsterType: 'chickenRogue'},
      F: {type: 'key'},
    }
  },
  {
    charMap: [
      "11111111",
      "100000F1",
      "1100D001",
      "24000001",
      "11111311",
      "10030001",
      "10011101",
      "1BC10301",
      "10010111",
      "1111A111",
    ],
    charkeys: {
      A: {type: 'enter', facing: 0},
      B: {type: 'monster', monsterType: 'chickenRogue'},
      C: {type: 'monster', monsterType: 'chickenKnight'},
      D: {type: 'monster', monsterType: 'chickenMage'},
      E: {type: 'monster', monsterType: 'chickenRogue'},
      F: {type: 'key'},
    }
  },
  {
    charMap: [
      "11111111",
      "200000B1",
      "100000C1",
      "11141111",
      "10000001",
      "10101001",
      "101010D1",
      "101010E1",
      "1F101001",
      "111A1111",
    ],
    charkeys: {
      A: {type: 'enter', facing: 0},
      B: {type: 'monster', monsterType: 'chickenRogue'},
      C: {type: 'monster', monsterType: 'chickenKnight'},
      D: {type: 'monster', monsterType: 'chickenMage'},
      E: {type: 'monster', monsterType: 'chickenRogue'},
      F: {type: 'key'},
    }
  }
];

function processRoom(r) {
  if (r.charMap) {
    r.map = [];
    r.monsters = r.monsters ?? [];
    r.relics = r.relics ?? [];
    for (let y = 0; y < r.charMap.length; y++) {
      r.map[y] = [];
      for (let x = 0; x < r.charMap[y].length; x++) {
        const theChar = r.charMap[y].charAt(x);
        if (isNaN(theChar)) {
          r.map[y][x] = 0;
          const tileDef = r.charkeys[theChar];
          if (tileDef) {
            switch (tileDef.type) {
              case 'enter':
                r.enter = {
                  x, y, facing: tileDef.facing
                };
                break;
              case 'monster':
                r.monsters.push({
                  x, y, hp: 3, type: tileDef.monsterType
                });
                break;
              case 'key':
                r.relics.push({
                  x, y, name: 'Key', isKey: true, sprite: 'key'
                });
                break;
            }
          }
        } else {
          r.map[y][x] = parseInt(theChar);
        }
      }
    }
  }

  if (r.monsters) {
    r.monsters.forEach(m => {
      switch (m.type) {
        case 'chickenRogue':
          m.attack = 1;
          m.speed = 1; // 3
          m.hp = 5;
          break;
        case 'chickenKnight':
          m.attack = 3;
          m.speed = 3; // 1
          m.hp = 10;
          break;
        case 'chickenMage':
          m.attack = 2;
          m.speed = 2;
          m.hp = 5;
          break;
      }
    })
  }

  if (!r.signs) {
    r.signs = [];
  }
  let sign = 0;
  for (let y = 0; y < r.map.length; y++)
    for (let x = 0; x < r.map[y].length; x++) {
      if (r.map[y][x] === 6) {
        r.map[y][x] = 0;
        r.signs[sign].x = x;
        r.signs[sign].y = y;
        if (!r.signs[sign].message) {
          r.signs[sign].message = getRandomElement(
            r.signs[sign].rotatingMessages
          );
        }
        sign++;
      }
    }
}

processRoom(endRoom);

rooms.forEach((r) => {
  processRoom(r);
});

Phaser.Utils.Array.Shuffle(rooms);

window.currentRoom = null;

let monsterTimer = 0;
const monsterInterval = 400; // milliseconds
let rotateSignsTimer = 0;
const rotateSignsInterval = 4000; // milliseconds
let effectsTimer = 0;
const effectsInterval = 2000; // milliseconds
let attackTimer = 0;
let attackInterval = 1000; // milliseconds

let sceneRef;

const DIRS = [
  { x: 0, y: -1 }, // North
  { x: 1, y: 0 }, // East
  { x: 0, y: 1 }, // South
  { x: -1, y: 0 }, // West
];

const OPPOSITE_DIRECTIONS = [
  2,3,0,1
];

let player = {
  x: 1,
  y: 1,
  dir: 0,
  inventory: [], // Player's inventory
};

let keys;

async function loadCustomFont(name, url) {
  const font = new FontFace(name, `url(${url})`);
  await font.load();
  document.fonts.add(font);
  console.log(`Font ${name} loaded!`);
}

async function preload() {
  this.load.image('chickenKnight', 'gfx/chickenKnight.png');
  this.load.image('chickenMage', 'gfx/chickenMage.png');
  this.load.image('chickenRogue', 'gfx/chickenRogue.png');
  this.load.image('blueChicken', 'gfx/blueChicken.png');
  this.load.image('egg1', 'gfx/egg1.png');
  this.load.image('egg2', 'gfx/egg2.png');
  this.load.image('egg3', 'gfx/egg3.png');
  this.load.image('egg4', 'gfx/egg4.png');
  this.load.image('key', 'gfx/key.png');
  this.load.image('mirror', 'gfx/mirror.png');

  this.load.audio('chickenSound', ['audio/chicken.mp3', 'audio/chicken.ogg']);
  this.load.audio('sword1', 'audio/sword-unsheathe.wav');
  this.load.audio('magic1', 'audio/magic1.wav');
  this.load.audio('swing1', 'audio/swing.wav');
  this.load.audio('swing2', 'audio/swing2.wav');
  this.load.audio('swing3', 'audio/swing3.wav');
  this.load.audio('walk1', 'audio/fs_rock_04.ogg');
  this.load.audio('walk2', 'audio/fs_rock_01.ogg');
  this.load.audio('walk3', 'audio/fs_rock_02.ogg');
  this.load.audio('walk4', 'audio/fs_rock_03.ogg');

}

function create() {
  keys = this.input.keyboard.addKeys("W,A,S,D");
  sceneRef = this;
  window.dungeonGroup = this.add.container();
  window.monstersGroup = this.add.container();
  window.uiGroup = this.add.container();
  initUI(sceneRef);
  this.input.on('pointerdown', (pointer) => {
    handleTouchInput(pointer);
  });
  updateScene();
  this.sound.play('chickenSound'); 
  showMessage(sceneRef, "I am the blue chicken... ka-KAAAW!\nSeek my eggs and meet me at the end.", "blueChicken");
}

function update(time, delta) {
  if (gameOver) {
    return;
  }
  handleInput();
  timeSeconds += delta;

  if (attackTimer < attackInterval) {
    attackTimer += delta;
  }

  updateAttackCooldown(attackTimer / attackInterval);

  monsterTimer += delta;
  if (monsterTimer >= monsterInterval) {
    moveMonsters();
    monsterTimer = 0;
  }

  rotateSignsTimer += delta;
  if (rotateSignsTimer >= rotateSignsInterval) {
    rotateSigns();
    rotateSignsTimer = 0;
  }

  effectsTimer += delta;
  if (effectsTimer >= effectsInterval) {
    dungeonEffects();
    effectsTimer = 0;
  }

  //drawMinimap(this, window.dungeonGroup);
}

function updateScene() {
  renderScene(sceneRef);
}

function handleTouchInput(pointer) {
  if (gameOver) {
    return;
  }
  if (window.movementLocked) {
    return;
  }
  const x = pointer.x;
  const y = pointer.y;
  const w = sceneRef.scale.width;
  const h = sceneRef.scale.height;

  if (y > h / 2) {
    if (x < w / 3) {
      player.dir = (player.dir + 3) % 4;
      updateScene();
    } else if (x > (2*w) / 3) {
      player.dir = (player.dir + 1) % 4;
      updateScene();
    } else {
      movePlayer(true);
    }
  } else {
    movePlayer(false);
  }
}

function handleInput() {
  if (gameOver) {
    return;
  }
  if (window.movementLocked) {
    return;
  }
  if (Phaser.Input.Keyboard.JustDown(keys.W)) {
    movePlayer(false);
  }
  if (Phaser.Input.Keyboard.JustDown(keys.S)) {
    movePlayer(true);
  }
  if (Phaser.Input.Keyboard.JustDown(keys.A)) {
    player.dir = (player.dir + 3) % 4;
    updateScene();
  }
  if (Phaser.Input.Keyboard.JustDown(keys.D)) {
    player.dir = (player.dir + 1) % 4;
    updateScene();
  }
}

window.movementLocked = false;
function movePlayer(backwards) {
  const map = currentRoom.map;
  const monsters = currentRoom.monsters;
  const relics = currentRoom.relics;
  const signs = currentRoom.signs;
  let dx = DIRS[player.dir].x;
  let dy = DIRS[player.dir].y;
  if (backwards) {
    dx = DIRS[OPPOSITE_DIRECTIONS[player.dir]].x;
    dy = DIRS[OPPOSITE_DIRECTIONS[player.dir]].y;
  }
  const nx = player.x + dx;
  const ny = player.y + dy;

  const mi = monsters.findIndex((m) => m.x === nx && m.y === ny);
  if (mi !== -1) {
    if (attackTimer < attackInterval) {
      // On cooldown
      return;
    }
    attackTimer = 0;
    const monster = monsters[mi];
    monster.hp -= playerAttack;
    if (monster.hp <= 0) {
      monsters.splice(mi, 1);
    }
    window.movementLocked = true;
    sceneRef.sound.play('swing'+getRandomElement(['1', '2', '3']));
    drawStar(sceneRef, 400, 300, 80, COL_PEN);
    sceneRef.time.delayedCall(300, () => {
      window.movementLocked = false;
      updateScene();
    });
    return; // skip moving into monster tile
  }

  const tile = map[ny]?.[nx];

  if (tile === undefined || tile === 1) {
    // Wall, can't move
    return;
  } else if (tile === 2) {
    // Go to the next room
    loadNewRoom();
    updateScene();
    sceneRef.sound.play('walk'+getRandomElement(['1', '2', '3', '4']));
    return;
  } else if (tile === 3) {
    // Door, just walk through
  } else if (tile === 4) {
    // Locked door, check for key
    if (nx === currentRoom.enter.x && ny === currentRoom.enter.y) {
      // It's the room magic door, cannot be opened
      showMessage(sceneRef, "The door is magically locked");
      return;
    }
    const keyIndex = player.inventory.findIndex((i) => i.isKey);
    if (keyIndex > -1) {
      player.inventory.splice(keyIndex, 1);
      updateInventory();
      map[ny][nx] = 3; // Turn locked door into door
    } else {
      showMessage(sceneRef, "You need a key to open this door!");
      return;
    }
  } else if (tile === 5) {
    // back to start
    player.x = currentRoom.enter.x;
    player.y = currentRoom.enter.y;
    player.dir = currentRoom.enter.facing;
    updateScene();
    sceneRef.sound.play('walk'+getRandomElement(['1', '2', '3', '4']));
    return;
  } else if (tile === 7) {
    if (!levelStatus.darkPulse) {
      // back to start
      player.x = currentRoom.enter.x;
      player.y = currentRoom.enter.y;
      player.dir = currentRoom.enter.facing;
      updateScene();
      sceneRef.sound.play('walk'+getRandomElement(['1', '2', '3', '4']));
      return;
    }
  }
  // Moved thru
  player.x = nx;
  player.y = ny;
  hideMessage();

  // Check for relic pickup
  const relicIndex = relics.findIndex(
    (r) => r.x === player.x && r.y === player.y
  );
  if (relicIndex !== -1) {
    const relic = relics.splice(relicIndex, 1)[0]; // Remove the relic from the map
    player.inventory.push(relic); // Add to inventory
    if (relic.effect) {
      switch (relic.effect) {
        case 'quickCombat':
          attackInterval = 800;
          showMessage(sceneRef, 'You feel swift like a chicken!\n(Speed+2)');
          break;
        case 'extendHP':
          playerMaxHP = 130;
          playerHP += 30;
          showMessage(sceneRef, 'You feel resilient like a chicken!\n(Life+30)');
          break;
        case 'extendPower':
          playerAttack++;
          showMessage(sceneRef, 'You feel strong like a chicken!\n(Attack+1)');
          break;
      }
    }
    updateInventory();
  }
  const si = signs.findIndex((s) => s.x === player.x && s.y === player.y);
  if (si !== -1) {
    if (signs[si].onInteract) {
      signs[si].onInteract();
    } else {
      showMessage(sceneRef, signs[si].message);
    }
  }
  updateScene();
  sceneRef.sound.play('walk'+getRandomElement(['1', '2', '3', '4']));
}

function dungeonEffects() {
  levelStatus.darkPulse = !levelStatus.darkPulse;
  if (currentRoom.pulses) {
    updateScene();
  }
}

function rotateSigns() {
  const signs = currentRoom.signs;
  signs?.forEach((s) => {
    if (s.rotatingMessages) {
      let newMessage;
      do {
        newMessage = getRandomElement(s.rotatingMessages);
      } while (newMessage === s.message);
      s.message = newMessage;
      if (s.x === player.x && s.y === player.y) {
        showMessage(sceneRef, "The words in the sign warp!:\n" + s.message);
      }
    }
  });
}

function moveMonsters() {
  const map = currentRoom.map;
  const monsters = currentRoom.monsters;
  monsters.forEach((monster) => {
    if (monster.moveCount > 0) {
      monster.moveCount--;
      return;
    }
    monster.moveCount = monster.speed;
    const dx = player.x - monster.x;
    const dy = player.y - monster.y;
    const distance = Math.abs(dx) + Math.abs(dy);

    let stepX = 0;
    let stepY = 0;

    const isOccupied = (x, y) => {
      return monsters.some((m) => m !== monster && m.x === x && m.y === y);
    };

    const tryRandomMove = () => {
      const dirs = Phaser.Utils.Array.Shuffle([
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0],
      ]);
      for (const [dx, dy] of dirs) {
        const newX = monster.x + dx;
        const newY = monster.y + dy;
        if (
          map[newY] &&
          map[newY][newX] === 0 &&
          !(newX === player.x && newY === player.y) &&
          !isOccupied(newX, newY)
        ) {
          monster.x = newX;
          monster.y = newY;
          break;
        }
      }
    };

    if (distance <= 4) {
      // Move toward player or attack if adjacent
      if (Math.abs(dx) > Math.abs(dy)) {
        stepX = Math.sign(dx);
      } else {
        stepY = Math.sign(dy);
      }

      const newX = monster.x + stepX;
      const newY = monster.y + stepY;

      if (map[newY][newX] === 0 || map[newY][newX] === 3) {
        if (newX === player.x && newY === player.y) {
          // Attack player
          playerHP -= monster.attack;
          switch (monster.type) {
            case 'chickenRogue':
              sceneRef.sound.play('swing'+getRandomElement(['1', '2', '3']));
              break;
            case 'chickenKnight':
              sceneRef.sound.play('sword1');
              break;
            case 'chickenMage':
              sceneRef.sound.play('magic1');
              break;
          }

          shakeScreenOnHit(sceneRef);
          updateHpBar(playerHP / playerMaxHP);
          if (playerHP <= 0) {
            showMessage(sceneRef, "It's the end.\nRefresh to retry.");
            gameOver = true;
          }
        } else if (!isOccupied(newX, newY)) {
          monster.x = newX;
          monster.y = newY;
        } else {
          tryRandomMove();
        }
      } else {
        tryRandomMove();
      }
    } else {
      // Random walk
      tryRandomMove();
    }
    const isVisible = isEnemyInFOV(monster) && hasLineOfSight(monster);
    if (isVisible || monster.wasVisible) {
      monster.wasVisible = isVisible;
      updateScene();
    }
  });
}

function getFOVTiles(playerX, playerY, facing, range = 4) {
  const tiles = [];
  const sideDirLeft = DIRS[(facing + 3) % 4];
  const sideDirRight = DIRS[(facing + 1) % 4];
  const forwardDir = DIRS[facing];

  for (let i = 1; i <= range; i++) {
    tiles.push({ x: playerX + forwardDir.x * i, y: playerY + forwardDir.y * i})
    tiles.push({ x: playerX + forwardDir.x * i + sideDirLeft.x, y: playerY + forwardDir.y * i + sideDirLeft.y})
    tiles.push({ x: playerX + forwardDir.x * i + sideDirRight.x, y: playerY + forwardDir.y * i + sideDirRight.y})
  }
  return tiles;
}

function isEnemyInFOV(enemy, range = 3) {
  const fovTiles = getFOVTiles(player.x, player.y, player.dir, range);
  return fovTiles.some(tile => tile.x === enemy.x && tile.y === enemy.y);
}

function hasLineOfSight(enemy) {
  const map = window.currentRoom.map;
  let x0 = player.x;
  let y0 = player.y;
  let x1 = enemy.x;
  let y1 = enemy.y;

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (!(x0 === x1 && y0 === y1)) {
      if (!(x0 === player.x && y0 === player.y)) {
          if (map[y0]?.[x0] === 1) return false; // Wall blocks view
      }
      const e2 = 2 * err;
      if (e2 > -dy) {
          err -= dy;
          x0 += sx;
      }
      if (e2 < dx) {
          err += dx;
          y0 += sy;
      }
  }

  return true; // No wall found in the way
}

function loadNewRoom() {
  currentRoomIndex++;
  if (currentRoomIndex >= rooms.length) {
    window.currentRoom = endRoom;
  } else {
    window.currentRoom = rooms[currentRoomIndex];
  }
  player.x = currentRoom.enter.x;
  player.y = currentRoom.enter.y;
  player.dir = currentRoom.enter.facing;
  currentRoom.map[player.y][player.x] = 4;
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

loadNewRoom();
