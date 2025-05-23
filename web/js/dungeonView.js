const COL_PEN = 0x4d5bbe;
const WIDTH_PEN = 4;
const COL_FLOOR = 0xeeeeee;
const COL_WALL = 0xeeeeee;
const COL_LOCKED_DOOR = 0x4b4b75;
const COL_SIDE_WALL = 0xeeeeee;
const COL_LATERAL_WALL = 0xeeeeee;
const perspectiveWarp = 0.5;
const baseX = 400;
const baseY = 320;
const depthSteps = 4;

const baseHeight = 900;
const baseWidth = 800;

function drawFrontalWall(scene, container, wallColor, fx, fy, wallW, wallH, xOffset) {
  const cx = baseX;
  const cy = baseY;
  const forward = DIRS[player.dir];
  const map = window.currentRoom.map;
  const isWall = (x, y) => map[y]?.[x] === 1;
  const isDoor = (x, y) => map[y]?.[x] === 3 || map[y]?.[x] === 4;
  const isLockedDoor = (x, y) => map[y]?.[x] === 4;

  const g = scene.add.graphics();
  container.add(g);
  g.fillStyle(wallColor, 1);
  g.lineStyle(WIDTH_PEN, COL_PEN, 1);
  let wallLeft = cx - wallW / 2;
  switch (xOffset) {
    case 0:
      break;
    case 1:
      wallLeft = cx + wallW * 0.5;
      break;
    case -1:
      wallLeft = cx - wallW * 1.5;
      break;
  }
  // --- Draw door panel if it's a door ---
  if (isDoor(fx, fy) && !isWall(fx + forward.x, fy + forward.y)) {
    // Wall dimensions
    const wallRight = wallLeft + wallW;
    const wallTop = cy - wallH / 2;
    const wallBottom = cy + wallH / 2;
    
    // Door dimensions
    const doorWidth = wallW * 0.4;
    const doorHeight = wallH * 0.8;
    const doorLeft = wallLeft + wallW / 2 - doorWidth / 2;
    const doorRight = doorLeft + doorWidth;
    const doorTop = wallBottom - doorHeight;
    const doorBottom = wallBottom;
    
    // Define wall polygon with a hole
    const points = [
      wallLeft, wallTop,
      wallRight, wallTop,
      wallRight, wallBottom,
      doorRight, doorBottom,
      doorRight, doorTop,
      doorLeft, doorTop,
      doorLeft, doorBottom,
      wallLeft, wallBottom,
    ];
    smoothFillPath(g, points);
    if (isLockedDoor(fx, fy)) {
      const doorG = scene.add.graphics();
      container.add(doorG);
      doorG.fillStyle(COL_LOCKED_DOOR, 1); // Locked or unlocked color
      doorG.fillRect(
        doorLeft,
        doorTop,
        doorWidth,
        doorHeight
      );
    }
  } else {
    // Draw the full wall
    smoothStrokeRect(g, wallLeft, cy - wallH / 2, wallW, wallH);
    g.fillRect(wallLeft, cy - wallH / 2, wallW, wallH);
  }
}

function renderScene(scene) {
  const container = window.dungeonGroup;
  container.removeAll(true);

  const map = window.currentRoom.map;
  const relics = window.currentRoom.relics;
  const signs = window.currentRoom.signs;
  const monsters = window.currentRoom.monsters;

  if (map[player.y]?.[player.x] === 7 && window.levelStatus.darkPulse) {
    // Darkness
    const darkG = scene.add.graphics();
    container.add(darkG);
    darkG.fillStyle(0x000000, 1);
    darkG.fillRect(
      0,
      0,
      800,
      600
    );
    return;
  }

  const isWall = (x, y) => map[y]?.[x] === 1;
  const isDoor = (x, y) => map[y]?.[x] === 3 || map[y]?.[x] === 4;
  const isLockedDoor = (x, y) => map[y]?.[x] === 4;

  const forward = DIRS[player.dir];
  const left = DIRS[(player.dir + 3) % 4];
  const right = DIRS[(player.dir + 1) % 4];

  for (let d = depthSteps; d >= 0; d--) {
    const scale = 1 / (d === 0 ? perspectiveWarp : d); // depth 0 is very close
    const wallW = baseWidth * scale * perspectiveWarp;
    const wallH = baseHeight * scale * perspectiveWarp;

    const prevScale = 1 / (d <= 1 ? perspectiveWarp : d - 1);
    const prevWallW = baseWidth * prevScale * perspectiveWarp;
    const prevWallH = baseHeight * prevScale * perspectiveWarp;

    const cx = baseX;
    const cy = baseY;

    const floorTiles = [{ dx: -1 }, { dx: 0 }, { dx: 1 }];

    for (const tile of floorTiles) {
      const x0 = cx + tile.dx * wallW;
      const y0 = cy + wallH * perspectiveWarp;
      const x1 = cx + tile.dx * prevWallW;
      const y1 = cy + prevWallH * perspectiveWarp;

      const floorPoly = new Phaser.Geom.Polygon([
        x0 - wallW / 2,
        y0,
        x0 + wallW / 2,
        y0,
        x1 + prevWallW / 2,
        y1,
        x1 - prevWallW / 2,
        y1,
      ]);

      const g = scene.add.graphics();
      container.add(g);
      const sfx = player.x + forward.x * (d - 1);
      const sfy = player.y + forward.y * (d - 1);
      if (map[sfy]?.[sfx] === 7 && window.levelStatus.darkPulse) {
        g.fillStyle(0x000000, 1);
      } else {
        g.fillStyle(COL_FLOOR, 0.4);
      }
      g.lineStyle(WIDTH_PEN / 2, COL_PEN, 1);
      //g.strokePoints(floorPoly.points, true);
      smoothStrokePoints(g, floorPoly.points, true);
      g.fillPoints(floorPoly.points, true);
    }

    const fx = player.x + forward.x * d;
    const fy = player.y + forward.y * d;

    const flx = fx + left.x;
    const fly = fy + left.y;
    const frx = fx + right.x;
    const fry = fy + right.y;

    const relicHere = relics.find((r) => r.x === fx && r.y === fy);
    if (relicHere && !isWall(fx, fy)) {
      const relicSprite = scene.add.sprite(
        cx,
        cy + wallH * perspectiveWarp,
        relicHere.sprite
      );
      relicSprite.setScale(scale); // Scale down based on depth
      relicSprite.setOrigin(0.5, 1);
      container.add(relicSprite);
    }

    const signHere = signs.find((s) => s.x === fx && s.y === fy);
    if (signHere && !isWall(fx, fy) && signHere.sprite && (signHere.facing === undefined || player.dir === signHere.facing)) {
      const signSprite = scene.add.sprite(
        cx,
        cy + wallH * perspectiveWarp,
        signHere.sprite
      );
      signSprite.setScale(scale * 0.6); // Scale down based on depth
      signSprite.setOrigin(0.5, 1);
      container.add(signSprite);
    }

    drawMonster(fx, fy, wallW, wallH, scale, scene, container, 0);
    drawMonster(flx, fly, wallW, wallH, scale, scene, container, -1);
    drawMonster(frx, fry, wallW, wallH, scale, scene, container, 1);

    // Blue chicken mirage
    const monsterHere = monsters.find((m) => m.x === fx && m.y === fy);
    if (!monsterHere && !isWall(fx, fy) && !isLockedDoor(fx, fy) && d === depthSteps && Math.random() > 0.99) {
      let hitWall = false;
      for (dray = d-1; dray > 0; dray--) {
        const rayFx = player.x + forward.x * dray;
        const rayFy = player.y + forward.y * dray;
        if (isWall(rayFx, rayFy) || isLockedDoor(rayFx, rayFy)) {
          hitWall = true;
          break;
        }
      }
      if (!hitWall) {
        const monsterSprite = scene.add.sprite(
          cx,
          cy + wallH * perspectiveWarp,
          "blueChicken"
        );
        monsterSprite.setScale(scale); // Scale down based on depth
        monsterSprite.setOrigin(0.5, 1);
        container.add(monsterSprite);
        setTimeout(() => {
          monsterSprite.destroy();
        }, 500);
      }
    }

    // --- Frontal Walls ---
    const skipDoor = d === 0 && fx === currentRoom.enter.x && fy === currentRoom.enter.y;
    if (isWall(fx, fy) || (isDoor(fx, fy) && !skipDoor)) {
      drawFrontalWall(scene, container, COL_WALL, fx, fy, wallW, wallH, 0)
    }
    if (isWall(flx, fly) || isDoor(flx, fly)) {
      drawFrontalWall(scene, container, COL_WALL, flx, fly, wallW, wallH, -1)
    }
    if (isWall(frx, fry) || isDoor(frx, fry)) {
      drawFrontalWall(scene, container, COL_WALL, frx, fry, wallW, wallH, 1)
    }

    const prevFx = player.x + forward.x * (d - 1);
    const prevFy = player.y + forward.y * (d - 1);

    const sideLeftX = prevFx + left.x;
    const sideLeftY = prevFy + left.y;
    const sideRightX = prevFx + right.x;
    const sideRightY = prevFy + right.y;

    if (isWall(sideLeftX, sideLeftY)) {
      const poly = new Phaser.Geom.Polygon([
        cx - prevWallW / 2,
        cy - prevWallH / 2,
        cx - prevWallW / 2,
        cy + prevWallH / 2,
        cx - wallW / 2,
        cy + wallH / 2,
        cx - wallW / 2,
        cy - wallH / 2,
      ]);
      const g = scene.add.graphics();
      container.add(g);
      g.fillStyle(COL_LATERAL_WALL, 1);
      g.lineStyle(WIDTH_PEN, COL_PEN, 1);
      //g.strokePoints(poly.points, true);
      smoothStrokePoints(g, poly.points, true);
      g.fillPoints(poly.points, true);
    }

    if (isWall(sideRightX, sideRightY)) {
      const poly = new Phaser.Geom.Polygon([
        cx + prevWallW / 2,
        cy - prevWallH / 2,
        cx + prevWallW / 2,
        cy + prevWallH / 2,
        cx + wallW / 2,
        cy + wallH / 2,
        cx + wallW / 2,
        cy - wallH / 2,
      ]);
      const g = scene.add.graphics();
      container.add(g);
      g.fillStyle(COL_LATERAL_WALL, 1);
      g.lineStyle(WIDTH_PEN, COL_PEN, 1);
      //g.strokePoints(poly.points, true);
      smoothStrokePoints(g, poly.points, true);
      g.fillPoints(poly.points, true);
    }
  }
}

function drawMonster(x, y, tileW, wallH, scale, scene, container, xOffset) {
  const monsters = window.currentRoom.monsters;
  const cx = baseX;
  const cy = baseY;
  let xPosition = cx;
  switch (xOffset) {
    case 0:
      break;
    case 1:
      xPosition = cx + tileW;
      break;
    case -1:
      xPosition = cx - tileW;
      break;
  }

  const monsterHere = monsters.find((m) => m.x === x && m.y === y);
  if (monsterHere) {
    const monsterSprite = scene.add.sprite(
      xPosition,
      cy + wallH * perspectiveWarp,
      monsterHere.type
    );
    monsterSprite.setScale(scale); // Scale down based on depth
    monsterSprite.setOrigin(0.5, 1);
    container.add(monsterSprite);

    const hpBar = scene.add.graphics();
    container.add(hpBar);
    hpBar.lineStyle(WIDTH_PEN, COL_PEN, 1);
    hpBar.fillStyle(COL_WALL);
    hpBar.strokeRect(xPosition - 50 * scale, cy + 210 * scale, 100 * scale, 10 * scale); // (x, y, width, height)
    hpBar.fillStyle(COL_PEN);
    hpBar.fillRect(xPosition - 50 * scale, cy + 210 * scale, 100 * (monsterHere.hp / 8) * scale, 10 * scale);
  }
}

function jitterPoint(p, amount) {
  return {
    x: p.x + Phaser.Math.Between(-amount, amount),
    y: p.y + Phaser.Math.Between(-amount, amount)
  };
}

function smoothStrokePoints(g, points, closePath = true, jitterAmount = 3, segments = 3) {
  if (points.length < 2) return;

  g.beginPath();

  const first = jitterPoint(points[0], jitterAmount);
  g.moveTo(first.x, first.y);

  for (let i = 1; i < points.length; i++) {
    const start = points[i - 1];
    const end = points[i];

    for (let j = 1; j <= segments; j++) {
      const t = j / segments;
      const interpX = Phaser.Math.Linear(start.x, end.x, t);
      const interpY = Phaser.Math.Linear(start.y, end.y, t);
      const jittered = jitterPoint({ x: interpX, y: interpY }, jitterAmount);
      g.lineTo(jittered.x, jittered.y);
    }
  }

  if (closePath) {
    const start = points[points.length - 1];
    const end = points[0];
    for (let j = 1; j <= segments; j++) {
      const t = j / segments;
      const interpX = Phaser.Math.Linear(start.x, end.x, t);
      const interpY = Phaser.Math.Linear(start.y, end.y, t);
      const jittered = jitterPoint({ x: interpX, y: interpY }, jitterAmount);
      g.lineTo(jittered.x, jittered.y);
    }
    g.closePath();
  }

  g.strokePath();
}

function smoothStrokeRect(g, x, y, width, height, jitterAmount = 3, segments = 3) {
  const points = [
    { x: x, y: y },
    { x: x + width, y: y },
    { x: x + width, y: y + height },
    { x: x, y: y + height }
  ];
  smoothStrokePoints(g, points, true, jitterAmount, segments);
}

function smoothStrokePath(g, path, jitterAmount = 3, segments = 3) {
  if (path.length < 2) return;

  const points = [];
  for (let i = 0; i < path.length; i += 2) {
    points.push({ x: path[i], y: path[i + 1] });
  }

  smoothStrokePoints(g, points, true, jitterAmount, segments);
}

function smoothFillPath(g, path, jitterAmount = 3, segments = 3) {
  if (path.length < 2) return;

  const points = [];
  for (let i = 0; i < path.length; i += 2) {
    points.push({ x: path[i], y: path[i + 1] });
  }

  // Draw filled shape first
  g.beginPath();
  const start = points[0];
  g.moveTo(start.x, start.y);

  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];

    const dx = (p1.x - p0.x) / segments;
    const dy = (p1.y - p0.y) / segments;

    for (let j = 1; j <= segments; j++) {
      const x = p0.x + dx * j + Phaser.Math.Between(-jitterAmount, jitterAmount);
      const y = p0.y + dy * j + Phaser.Math.Between(-jitterAmount, jitterAmount);
      g.lineTo(x, y);
    }
  }

  g.closePath();
  g.fillPath();

  // Now stroke it with squiggly lines
  smoothStrokePoints(g, points, true, jitterAmount, segments);
}