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

const game = new Phaser.Game(config);

let playerHP = 10;
let currentRoomIndex = -1;
const levelStatus = {
  darkPulse: false
}

window.levelStatus = levelStatus;

const endRoom = {
  enter: {
    x: 4,
    y: 7,
    facing: 0,
  },
  map: [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 0, 1],
    [1, 0, 1, 0, 6, 4, 1, 1],
    [1, 0, 1, 3, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1],
  ],
  relics: [],
  monsters: [],
  signs: [{ message: "I am the blue chicken." }],
};

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
    relics: [{ x: 11, y: 10, name: "Ancient Coin" }],
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
      facing: 1,
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
    relics: [{ x: 11, y: 9, name: "Ancient Coin" }],
    signs: [
      {
        message:
          "There is a mirror here\nYou see an inverted version of yourself",
      },
      { message: "There is a mirror here\nYou see yourself walking backwards" },
      { message: "There is a mirror here\nIt's just you." },
      {
        message:
          "There is a mirror here\nYou see the blue chicken pecking at the ground",
      },
      { message: "There is a sign here, it reads:\nGoodbye." },
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
    relics: [{ x: 7, y: 1, name: "Ancient Coin" }],
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
    enter: {
      x: 4,
      y: 7,
      facing: 0,
    },
    map: [
      [1, 1, 1, 1, 2, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 0, 1],
      [1, 0, 1, 0, 0, 4, 1, 1],
      [1, 0, 1, 3, 1, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 0, 1, 1, 1],
    ],
    relics: [
      { x: 1, y: 1, name: "Ancient Coin" },
      { x: 4, y: 3, name: "Silver Ring" },
      { x: 5, y: 5, name: "Mystic Gem" },
      { x: 2, y: 1, name: "Key", isKey: true },
    ],
    monsters: [
      { x: 4, y: 2, hp: 3 },
      { x: 5, y: 3, hp: 3 },
      { x: 6, y: 5, hp: 3 },
    ],
  },
  {
    enter: {
      x: 0,
      y: 3,
      facing: 1,
    },
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 0, 1],
      [0, 0, 0, 0, 1, 0, 1, 1],
      [1, 1, 1, 0, 1, 0, 0, 2],
      [1, 0, 0, 0, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
    relics: [{ x: 1, y: 1, name: "Ancient Coin" }],
    monsters: [
      { x: 4, y: 2, hp: 3 },
      { x: 5, y: 3, hp: 3 },
      { x: 6, y: 5, hp: 3 },
    ],
  },
];

function processRoom(r) {
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
const monsterInterval = 1000; // milliseconds
let rotateSignsTimer = 0;
const rotateSignsInterval = 4000; // milliseconds
let effectsTimer = 0;
const effectsInterval = 2000; // milliseconds

let sceneRef;

const DIRS = [
  { x: 0, y: -1 }, // North
  { x: 1, y: 0 }, // East
  { x: 0, y: 1 }, // South
  { x: -1, y: 0 }, // West
];

let player = {
  x: 1,
  y: 1,
  dir: 0,
  inventory: [], // Player's inventory
};

let keys;

function preload() {
  this.load.image('monster', 'chickenKnight.png');
}

function create() {
  keys = this.input.keyboard.addKeys("W,A,S,D");
  sceneRef = this;
  window.dungeonGroup = this.add.container();
  window.monstersGroup = this.add.container();
  window.uiGroup = this.add.container();
  updateScene();
}

function update(time, delta) {
  handleInput();

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

  renderMonsters(this);
  drawMinimap(this, window.dungeonGroup);
  renderInventory(this, window.dungeonGroup);
}

function updateScene() {
  renderScene(sceneRef);
}

function handleInput() {
  if (Phaser.Input.Keyboard.JustDown(keys.W)) {
    movePlayer(0);
  }
  if (Phaser.Input.Keyboard.JustDown(keys.S)) {
    movePlayer(2);
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

function movePlayer(directionIndex) {
  const map = currentRoom.map;
  const monsters = currentRoom.monsters;
  const relics = currentRoom.relics;
  const signs = currentRoom.signs;
  const dx = DIRS[player.dir].x;
  const dy = DIRS[player.dir].y;
  const nx = player.x + dx;
  const ny = player.y + dy;

  const mi = monsters.findIndex((m) => m.x === nx && m.y === ny);
  if (mi !== -1) {
    const monster = monsters[mi];
    monster.hp -= 1;
    console.log("You hit the monster! HP left:", monster.hp);
    if (monster.hp <= 0) {
      monsters.splice(mi, 1);
      console.log("You defeated the monster!");
    }
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
    const keyIndex = player.inventory.findIndex((i) => i.isKey);
    if (keyIndex > -1) {
      player.inventory.splice(keyIndex, 1);
      map[ny][nx] = 3; // Turn locked door into door
    } else {
      console.log("You need a key to open this door!");
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

  // Check for relic pickup
  const relicIndex = relics.findIndex(
    (r) => r.x === player.x && r.y === player.y
  );
  if (relicIndex !== -1) {
    const relic = relics.splice(relicIndex, 1)[0]; // Remove the relic from the map
    player.inventory.push(relic); // Add to inventory
  }
  const si = signs.findIndex((s) => s.x === player.x && s.y === player.y);
  if (si !== -1) {
    showMessage(sceneRef, signs[si].message);
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

      if (map[newY][newX] === 0) {
        if (newX === player.x && newY === player.y) {
          // Attack player
          playerHP--;
          console.log(`The ${monster.name} hits you! HP: ${playerHP}`);
          if (playerHP <= 0) {
            console.log("You died!");
            // TODO: Handle game over
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
    const playerSeeingMonster = false;
    if (playerSeeingMonster) {
      updateScene();
    }
  });
}

function loadNewRoom() {
  // TODO: Select room type
  currentRoomIndex++;
  if (currentRoomIndex >= rooms.length) {
    window.currentRoom = endRoom;
  } else {
    //window.currentRoom = getRandomElement(rooms);
    window.currentRoom = rooms[currentRoomIndex];
  }
  player.x = currentRoom.enter.x;
  player.y = currentRoom.enter.y;
  player.dir = currentRoom.enter.facing;
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

loadNewRoom();
