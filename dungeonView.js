function renderScene(scene) {
  const container = window.dungeonGroup;
  container.removeAll(true);
  
  const baseX = 400;
  const baseY = 300;
  const depthSteps = 3;

  const map = window.currentRoom.map;
  const monsters = window.currentRoom.monsters;
  const relics = window.currentRoom.relics;

  if (map[player.y]?.[player.x] === 7 && window.levelStatus.darkPulse) {
    // Darkness
    return;
  }

  const isWall = (x, y) => map[y]?.[x] === 1;
  const isDoor = (x, y) => map[y]?.[x] === 3 || map[y]?.[x] === 4;
  const isLockedDoor = (x, y) => map[y]?.[x] === 4;

  const forward = DIRS[player.dir];
  const left = DIRS[(player.dir + 3) % 4];
  const right = DIRS[(player.dir + 1) % 4];

  for (let d = depthSteps; d >= 0; d--) {
    const scale = 1 / (d === 0 ? 0.5 : d); // depth 0 is very close
    const wallW = 800 * scale * 0.5;
    const wallH = 600 * scale * 0.5;

    const prevScale = 1 / (d <= 1 ? 0.5 : d - 1);
    const prevWallW = 800 * prevScale * 0.5;
    const prevWallH = 600 * prevScale * 0.5;

    const cx = baseX;
    const cy = baseY;

    const floorTiles = [{ dx: -1 }, { dx: 0 }, { dx: 1 }];

    for (const tile of floorTiles) {
      const x0 = cx + tile.dx * wallW;
      const y0 = cy + wallH * 0.5;
      const x1 = cx + tile.dx * prevWallW;
      const y1 = cy + prevWallH * 0.5;

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
        g.fillStyle(0xaaaaaa, 0.4);
      }
      g.lineStyle(2, 0x000000, 0.8);
      g.strokePoints(floorPoly.points, true);
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
      const g = scene.add.graphics();
      container.add(g);
      const radius = 16 * scale;
      g.fillStyle(0xffdd00, 1);
      g.lineStyle(2, 0x000000, 1);
      g.strokeCircle(cx, cy + wallH * 0.5 - 20 * scale, radius);
      g.fillCircle(cx, cy + wallH * 0.5 - 20 * scale, radius);
    }

    const monsterHere = monsters.find((m) => m.x === fx && m.y === fy);
    if (monsterHere && !isWall(fx, fy)) {
      const g = scene.add.graphics();
      container.add(g);
      const radius = 18 * scale;
      g.fillStyle(0xff4444, 1);
      g.lineStyle(2, 0x000000, 1);
      g.strokeCircle(cx, cy + wallH * 0.5 - 60 * scale, radius);
      g.fillCircle(cx, cy + wallH * 0.5 - 60 * scale, radius);
      const fontSize = Math.floor(20 * scale);
      const hpText = scene.add.text(
        cx,
        cy + wallH * 0.5 - 90 * scale,
        `HP: ${monsterHere.hp}`,
        {
          font: `${fontSize}px Arial`,
          color: "#ffaaaa",
          stroke: "#000000",
          strokeThickness: 2,
        }
      );
      container.add(hpText);
      hpText.setOrigin(0.5);
    }

    // --- Front Wall ---
    if (isWall(fx, fy) || isDoor(fx, fy)) {
      const g = scene.add.graphics();
      container.add(g);
      g.fillStyle(0x8888ff, 1);
      g.lineStyle(2, 0x000000, 1);

      // --- Draw door panel if it's a door ---
      if (isDoor(fx, fy) && !isWall(fx + forward.x, fy + forward.y)) {
        // Wall dimensions
        const wallLeft = cx - wallW / 2;
        const wallRight = cx + wallW / 2;
        const wallTop = cy - wallH / 2;
        const wallBottom = cy + wallH / 2;
        
        // Door dimensions
        const doorWidth = wallW * 0.4;
        const doorHeight = wallH * 0.8;
        const doorLeft = cx - doorWidth / 2;
        const doorRight = cx + doorWidth / 2;
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
        
        g.beginPath();
        g.moveTo(points[0], points[1]);
        
        for (let i = 2; i < points.length; i += 2) {
          g.lineTo(points[i], points[i + 1]);
        }
        
        g.closePath();
        g.fillPath();
        g.strokePath();
        if (isLockedDoor(fx, fy)) {
          const doorG = scene.add.graphics();
          container.add(doorG);
          doorG.fillStyle(isLockedDoor(fx, fy) ? 0xbb8844 : 0x88bb44, 1); // Locked or unlocked color
          doorG.fillRect(
            cx - doorWidth / 2,
            cy - doorHeight / 2 + (wallH - doorHeight) / 2,
            doorWidth,
            doorHeight
          );
        }
      } else {
        // Draw the full wall
        g.strokeRect(cx - wallW / 2, cy - wallH / 2, wallW, wallH);
        g.fillRect(cx - wallW / 2, cy - wallH / 2, wallW, wallH);
      }
    }

    // --- Side Walls ---
    if (isWall(flx, fly) || isDoor(flx, fly)) {
      const g = scene.add.graphics();
      container.add(g);
      g.fillStyle(0x6666cc, 1);
      g.lineStyle(2, 0x000000, 1);
      g.strokeRect(cx - 1.5 * wallW, cy - wallH / 2, wallW, wallH);
      g.fillRect(cx - 1.5 * wallW, cy - wallH / 2, wallW, wallH);
      // TODO: Draw door
    }

    if (isWall(frx, fry) || isDoor(frx, fry)) {
      const g = scene.add.graphics();
      container.add(g);
      g.fillStyle(0x6666cc, 1);
      g.lineStyle(2, 0x000000, 1);
      g.strokeRect(cx + 0.5 * wallW, cy - wallH / 2, wallW, wallH);
      g.fillRect(cx + 0.5 * wallW, cy - wallH / 2, wallW, wallH);
      // TODO: Draw door
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
      g.fillStyle(0x44aa44, 1);
      g.lineStyle(2, 0x000000, 1);
      g.strokePoints(poly.points, true);
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
      g.fillStyle(0x4444aa, 1);
      g.lineStyle(2, 0x000000, 1);
      g.strokePoints(poly.points, true);
      g.fillPoints(poly.points, true);
    }
  }
}
