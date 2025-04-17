function renderScene(scene) {
    scene.children.removeAll();
  
    const baseX = 400;
    const baseY = 300;
    const depthSteps = 3;
  
    const map = window.currentRoom.map;
    const monsters = window.currentRoom.monsters;
    const relics = window.currentRoom.relics;
  
    const isWall = (x, y) => map[y]?.[x] === 1;
  
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
        g.fillStyle(0xaaaaaa, 0.4);
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
        const radius = 16 * scale;
        g.fillStyle(0xffdd00, 1);
        g.lineStyle(2, 0x000000, 1);
        g.strokeCircle(cx, cy + wallH * 0.5 - 20 * scale, radius);
        g.fillCircle(cx, cy + wallH * 0.5 - 20 * scale, radius);
      }
  
      const monsterHere = monsters.find((m) => m.x === fx && m.y === fy);
      if (monsterHere && !isWall(fx, fy)) {
        const g = scene.add.graphics();
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
        hpText.setOrigin(0.5);
      }
  
      // --- Front Wall ---
      if (isWall(fx, fy)) {
        const g = scene.add.graphics();
        g.fillStyle(0x8888ff, 1);
        g.lineStyle(2, 0x000000, 1);
        g.strokeRect(cx - wallW / 2, cy - wallH / 2, wallW, wallH);
        g.fillRect(cx - wallW / 2, cy - wallH / 2, wallW, wallH);
      }
  
      // --- Side Walls ---
      if (isWall(flx, fly)) {
        const g = scene.add.graphics();
        g.fillStyle(0x6666cc, 1);
        g.lineStyle(2, 0x000000, 1);
        g.strokeRect(cx - 1.5 * wallW, cy - wallH / 2, wallW, wallH);
        g.fillRect(cx - 1.5 * wallW, cy - wallH / 2, wallW, wallH);
      }
  
      if (isWall(frx, fry)) {
        const g = scene.add.graphics();
        g.fillStyle(0x6666cc, 1);
        g.lineStyle(2, 0x000000, 1);
        g.strokeRect(cx + 0.5 * wallW, cy - wallH / 2, wallW, wallH);
        g.fillRect(cx + 0.5 * wallW, cy - wallH / 2, wallW, wallH);
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
        g.fillStyle(0x4444aa, 1);
        g.lineStyle(2, 0x000000, 1);
        g.strokePoints(poly.points, true);
        g.fillPoints(poly.points, true);
      }
    }
  
    drawMinimap(scene);
  }
  