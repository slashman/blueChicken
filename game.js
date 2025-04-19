let game = null;

async function loadFonts() {
  if (document.fonts) {
    // Here you could trigger font loading if necessary
    await loadCustomFont('Scribble', 'ScribbleChild.ttf');
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

const playerMaxHP = 60;
let playerHP = playerMaxHP;
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
      const relicCount = player.inventory.reduce((acum, item) => acum + (item.relic ? 1 : 0), 0);
      const scoreString = '\nSCORE: ' + (timeSeconds/10).toFixed(0) + " x" + relicCount;
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
    relics: [{ x: 11, y: 9, name: "Odd Egg", relic: true, sprite: 'egg1' }],
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
      [1, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 6, 1],
      [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 3, 1, 1],
      [1, 0, 6, 0, 0, 6, 0, 0, 0, 1, 0, 0, 1],
      [1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1],
    ],
    relics: [{ x: 11, y: 9, name: "Ambitious Egg", relic: true, sprite: 'egg2' }],
    signs: [
      {
        sprite: 'mirror',
        message:
          "There is a mirror here\nYou see an inverted version of yourself",
      },
      { sprite: 'mirror', message: "There is a mirror here\nYou see yourself walking backwards" },
      { sprite: 'mirror', message: "There is a mirror here\nIt's just you." },
      {
        sprite: 'mirror',
        message:
          "There is a mirror here\nYou see the blue chicken pecking at the ground",
      },
      { message: "There is a sign here, it reads:\nFarewell." },
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
    relics: [{ x: 7, y: 1, name: "Vibrating Egg", relic: true, sprite: 'egg3' }],
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
const attackInterval = 1000; // milliseconds

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
  this.load.image('chickenKnight', 'chickenKnight.png');
  this.load.image('chickenMage', 'chickenMage.png');
  this.load.image('chickenRogue', 'chickenRogue.png');
  this.load.image('blueChicken', 'blueChicken.png');
  this.load.image('egg1', 'egg1.png');
  this.load.image('egg2', 'egg2.png');
  this.load.image('egg3', 'egg3.png');
  this.load.image('egg4', 'egg4.png');
  this.load.image('key', 'key.png');
  this.load.image('mirror', 'mirror.png');
}

function create() {
  keys = this.input.keyboard.addKeys("W,A,S,D");
  sceneRef = this;
  window.dungeonGroup = this.add.container();
  window.monstersGroup = this.add.container();
  window.uiGroup = this.add.container();
  initUI(sceneRef);
  updateScene();
  showMessage(sceneRef, "You hear a voice:\nI am the blue chicken... ka-kaaaw!\nSeek me at the end of your mortal life.");
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
  renderMonsters(sceneRef);
}

function handleInput() {
  if (gameOver) {
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
    monster.hp -= 1;
    if (monster.hp <= 0) {
      monsters.splice(mi, 1);
    }
    renderMonsters(sceneRef);
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
    return;
  } else if (tile === 7) {
    if (!levelStatus.darkPulse) {
      // back to start
      player.x = currentRoom.enter.x;
      player.y = currentRoom.enter.y;
      player.dir = currentRoom.enter.facing;
      updateScene();
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
    renderMonsters(sceneRef);
  });
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
