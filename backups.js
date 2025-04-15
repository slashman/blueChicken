function renderScene3(scene) { // working except for depth 0
    scene.children.removeAll();
  
    const camX = 400;
    const camY = 300;
    const depthSteps = 3;
  
    const isWall = (x, y) => map[y]?.[x] === 1;
  
    const forward = DIRS[player.dir];
    const left = DIRS[(player.dir + 3) % 4];
    const right = DIRS[(player.dir + 1) % 4];
  
    for (let d = depthSteps; d >= 1; d--) {
      const scale = 1 / d;
      const wallW = 800 * scale * 0.5;
      const wallH = 600 * scale * 0.5;
  
      // Correct scale for the previous depth level (d - 1)
      const prevScale = 1 / (d - 1 || 1); // prevent divide-by-zero
      const prevWallW = 800 * prevScale * 0.5;
      const prevWallH = 600 * prevScale * 0.5;
  
      const cx = camX;
      const cy = camY;
  
      // Floor tiles with labels
      const floorTiles = [
        { dx: -1, label: `${d}-L` },
        { dx: 0, label: `${d}` },
        { dx: 1, label: `${d}-R` },
      ];
  
      for (const tile of floorTiles) {
        const x0 = cx + tile.dx * wallW;
        const y0 = cy + wallH * 0.5;
        const x1 = cx + tile.dx * prevWallW;
        const y1 = cy + prevWallH * 0.5;
  
        const floorPoly = new Phaser.Geom.Polygon([
          x0 - wallW / 2, y0,
          x0 + wallW / 2, y0,
          x1 + prevWallW / 2, y1,
          x1 - prevWallW / 2, y1
        ]);
  
        const g = scene.add.graphics();
        g.fillStyle(0xaaaaaa, 0.4);
        g.lineStyle(2, 0x000000, 0.8);
        g.strokePoints(floorPoly.points, true);
        g.fillPoints(floorPoly.points, true);
  
        scene.add.text(x0, y0 - 12, tile.label, {
          font: `${14 * scale}px Arial`,
          color: "#000",
        }).setOrigin(0.5, 1);
      }
  
      // Forward-facing walls
      const fx = player.x + forward.x * d;
      const fy = player.y + forward.y * d;
      const flx = fx + left.x;
      const fly = fy + left.y;
      const frx = fx + right.x;
      const fry = fy + right.y;
  
      if (isWall(fx, fy)) {
        const g = scene.add.graphics();
        g.fillStyle(0x8888ff, 1);
        g.lineStyle(2, 0x000000, 1);
        g.strokeRect(cx - wallW / 2, cy - wallH / 2, wallW, wallH);
        g.fillRect(cx - wallW / 2, cy - wallH / 2, wallW, wallH);
      }
  
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
  
      // Side-facing walls
      const prevFx = player.x + forward.x * (d - 1);
      const prevFy = player.y + forward.y * (d - 1);
  
      const sideLeftX = prevFx + left.x;
      const sideLeftY = prevFy + left.y;
      const sideRightX = prevFx + right.x;
      const sideRightY = prevFy + right.y;
  
      const wallLeft = isWall(sideLeftX, sideLeftY);
      const wallRight = isWall(sideRightX, sideRightY);
  
      // Adjusted side wall calculation (using correct scaling)
      if (wallLeft) {
        const poly = new Phaser.Geom.Polygon([
          cx - prevWallW / 2,     cy - prevWallH / 2,
          cx - prevWallW / 2,     cy + prevWallH / 2,
          cx - wallW / 2,         cy + wallH / 2,
          cx - wallW / 2,         cy - wallH / 2
        ]);
        const g = scene.add.graphics();
        g.fillStyle(0x44aa44, 1);
        g.lineStyle(2, 0x000000, 1);
        g.strokePoints(poly.points, true);
        g.fillPoints(poly.points, true);
      }
  
      if (wallRight) {
        const poly = new Phaser.Geom.Polygon([
          cx + prevWallW / 2,     cy - prevWallH / 2,
          cx + prevWallW / 2,     cy + prevWallH / 2,
          cx + wallW / 2,         cy + wallH / 2,
          cx + wallW / 2,         cy - wallH / 2
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
  
  
  
  
  function renderScene2(scene) { // Working but with an artifact in the sides
    scene.children.removeAll();
  
    const camX = 400;
    const camY = 300;
    const depthSteps = 3;
  
    const isWall = (x, y) => map[y]?.[x] === 1;
  
    const forward = DIRS[player.dir];
    const left = DIRS[(player.dir + 3) % 4];
    const right = DIRS[(player.dir + 1) % 4];
  
    for (let d = depthSteps; d >= 1; d--) {
      const scale = 1 / d;
      const wallW = 800 * scale * 0.5;
      const wallH = 600 * scale * 0.5;
  
      const cx = camX;
      const cy = camY;
  
      // Front-facing tiles
      const fx = player.x + forward.x * d;
      const fy = player.y + forward.y * d;
      const flx = fx + left.x;
      const fly = fy + left.y;
      const frx = fx + right.x;
      const fry = fy + right.y;
  
      // Draw front-facing walls as rectangles
      if (isWall(fx, fy)) {
        scene.add.rectangle(cx, cy, wallW, wallH, 0x8888ff).setOrigin(0.5);
      }
  
      if (isWall(flx, fly)) {
        scene.add.rectangle(cx - wallW, cy, wallW, wallH, 0x6666cc).setOrigin(0.5);
      }
  
      if (isWall(frx, fry)) {
        scene.add.rectangle(cx + wallW, cy, wallW, wallH, 0x6666cc).setOrigin(0.5);
      }
  
      // Side-facing walls (angled)
      const prevFx = player.x + forward.x * (d - 1);
      const prevFy = player.y + forward.y * (d - 1);
  
      const sideLeftX = prevFx + left.x;
      const sideLeftY = prevFy + left.y;
      const sideRightX = prevFx + right.x;
      const sideRightY = prevFy + right.y;
  
      const wallLeft = isWall(sideLeftX, sideLeftY);
      const wallRight = isWall(sideRightX, sideRightY);
  
      if (wallLeft) {
        const poly = new Phaser.Geom.Polygon([
          cx - wallW / 2, cy - wallH / 2,
          cx - wallW / 2, cy + wallH / 2,
          cx - wallW,     cy + wallH,
          cx - wallW,     cy - wallH
        ]);
        const g = scene.add.graphics({ fillStyle: { color: 0x44aa44 } });
        g.fillPoints(poly.points, true);
      }
  
      if (wallRight) {
        const poly = new Phaser.Geom.Polygon([
          cx + wallW / 2, cy - wallH / 2,
          cx + wallW / 2, cy + wallH / 2,
          cx + wallW,     cy + wallH,
          cx + wallW,     cy - wallH
        ]);
        const g = scene.add.graphics({ fillStyle: { color: 0x4444aa } });
        g.fillPoints(poly.points, true);
      }
    }
  
    drawMinimap(scene);
  }
  
  
  function renderScene1(scene) {
    scene.children.removeAll();
  
    const camX = 400;
    const camY = 300;
    const depthSteps = 3;
  
    const isWall = (x, y) => map[y]?.[x] === 1;
  
    const forward = DIRS[player.dir];
    const left = DIRS[(player.dir + 3) % 4];
    const right = DIRS[(player.dir + 1) % 4];
  
    for (let d = depthSteps; d >= 1; d--) {
      const scale = 1 / d;
      const wallW = 800 * scale * 0.5;
      const wallH = 600 * scale * 0.5;
  
      const cx = camX;
      const cy = camY;
  
      // Tile directly ahead at depth d
      const fx = player.x + forward.x * d;
      const fy = player.y + forward.y * d;
  
      const wallFront = isWall(fx, fy);
  
      const ffx = player.x + forward.x * (d - 1);
      const ffy = player.y + forward.y * (d - 1);
  
      // Side tiles at same depth
      const lx = ffx + left.x;
      const ly = ffy + left.y;
      const rx = ffx + right.x;
      const ry = ffy + right.y;
  
      const wallLeft = isWall(lx, ly);
      const wallRight = isWall(rx, ry);
  
      // Draw FRONT wall
      if (wallFront) {
        scene.add.rectangle(cx, cy, wallW, wallH, 0x8888ff).setOrigin(0.5);
      }
  
      // LEFT wall
      if (wallLeft) {
        const poly = new Phaser.Geom.Polygon([
          cx - wallW / 2, cy - wallH / 2,
          cx - wallW / 2, cy + wallH / 2,
          cx - wallW,     cy + wallH,
          cx - wallW,     cy - wallH
        ]);
        const g = scene.add.graphics({ fillStyle: { color: 0x4444aa } });
        g.fillPoints(poly.points, true);
      }
  
      // RIGHT wall
      if (wallRight) {
        const poly = new Phaser.Geom.Polygon([
          cx + wallW / 2, cy - wallH / 2,
          cx + wallW / 2, cy + wallH / 2,
          cx + wallW,     cy + wallH,
          cx + wallW,     cy - wallH
        ]);
        const g = scene.add.graphics({ fillStyle: { color: 0x4444aa } });
        g.fillPoints(poly.points, true);
      }
    }
  
    drawMinimap(scene);
  }