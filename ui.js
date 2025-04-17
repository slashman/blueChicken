function renderInventory(scene, container) {
    const offsetX = 16;
    var offsetY = 16;
    const lineHeight = 24;
  container.add(
    scene.add.text(offsetX, (offsetY += lineHeight), `HP: ${playerHP}`, {
      font: "16px Arial",
      color: "#fff",
    })
  );
  container.add(
    scene.add.text(offsetX, (offsetY += lineHeight), "Inventory:", {
      font: "16px Arial",
      color: "#fff",
    })
  );
  
    player.inventory.forEach((relic, index) => {
    container.add(
      scene.add.text(offsetX, offsetY + (index + 1) * lineHeight, relic.name, {
        font: "14px Arial",
        color: "#fff",
      })
    );
    });
  }
  
function drawMinimap(scene, container) {
    const map = window.currentRoom.map;
    const monsters = window.currentRoom.monsters;
    const minimapSize = 128;
    const tileSize = minimapSize / map.length;
    const offsetX = 16;
    const offsetY = config.height - minimapSize - 16;
  
    const g = scene.add.graphics();
  container.add(g);
    g.fillStyle(0x000000, 0.6);
    g.fillRect(offsetX - 4, offsetY - 4, minimapSize + 8, minimapSize + 8);
  
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        g.fillStyle(map[y][x] === 1 ? 0xffffff : 0x222222);
        g.fillRect(
          offsetX + x * tileSize,
          offsetY + y * tileSize,
          tileSize,
          tileSize
        );
      }
    }
  
    // Monsters
    for (const m of monsters) {
      g.fillStyle(0xff4444);
      g.fillCircle(
        offsetX + m.x * tileSize + tileSize / 2,
        offsetY + m.y * tileSize + tileSize / 2,
        tileSize / 4
      );
    }
  
    // Player
    g.fillStyle(0xff0000);
    g.fillCircle(
      offsetX + player.x * tileSize + tileSize / 2,
      offsetY + player.y * tileSize + tileSize / 2,
      tileSize / 3
    );
  
    // Direction
    const dx = DIRS[player.dir].x * tileSize * 0.5;
    const dy = DIRS[player.dir].y * tileSize * 0.5;
    g.lineStyle(2, 0xff0000);
    g.beginPath();
    g.moveTo(
      offsetX + player.x * tileSize + tileSize / 2,
      offsetY + player.y * tileSize + tileSize / 2
    );
    g.lineTo(
      offsetX + player.x * tileSize + tileSize / 2 + dx,
      offsetY + player.y * tileSize + tileSize / 2 + dy
    );
    g.strokePath();
  }
  