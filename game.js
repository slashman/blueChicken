const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#222",
  scene: {
    preload,
    create,
    update,
  },
};

const game = new Phaser.Game(config);

let playerHP = 10;

const rooms = [
  {
    enter: {
      x: 4,
      y: 7,
      facing: 0
    },
    map: [
      [1, 1, 1, 1, 2, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 1, 1],
      [1, 0, 1, 0, 1, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 0, 1, 1, 1],
    ],
    relics: [
      { x: 1, y: 1, name: "Ancient Coin" },
      { x: 4, y: 3, name: "Silver Ring" },
      { x: 5, y: 5, name: "Mystic Gem" },
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
        facing: 1
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
    relics: [
      { x: 1, y: 1, name: "Ancient Coin" }
    ],
    monsters: [
      { x: 4, y: 2, hp: 3 },
      { x: 5, y: 3, hp: 3 },
      { x: 6, y: 5, hp: 3 },
    ],
  },
];

window.currentRoom = null;

let monsterTimer = 0;
const monsterInterval = 1000; // milliseconds

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

function preload() {}

function create() {
  keys = this.input.keyboard.addKeys("W,A,S,D");
}

function update(time, delta) {
  handleInput();

  monsterTimer += delta;
  if (monsterTimer >= monsterInterval) {
    moveMonsters();
    monsterTimer = 0;
  }

  renderScene(this);
  renderInventory(this);
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
  }
  if (Phaser.Input.Keyboard.JustDown(keys.D)) {
    player.dir = (player.dir + 1) % 4;
  }
}

function movePlayer(directionIndex) {
  const map = currentRoom.map;
  const monsters = currentRoom.monsters;
  const relics = currentRoom.relics;
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

  if (map[ny] && map[ny][nx] === 0) {
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
  }
  // Check if the new tile is a "2" (door)
  if (map[ny] && map[ny][nx] === 2) {
    // Go to the next room
    loadNewRoom();
    return;
  }
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
          map[newY][newX] !== 1 &&
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

      if (map[newY][newX] !== 1) {
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
  });
}

function loadNewRoom() {
  // TODO: Select room type
  window.currentRoom = getRandomElement(rooms);
  player.x = currentRoom.enter.x;
  player.y = currentRoom.enter.y;
  player.dir = currentRoom.enter.facing;
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

loadNewRoom();