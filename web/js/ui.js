const COL_PEN_CSS = "#4d5bbe";
const COL_WALL_CSS = "#eeeeee";

let cooldownBar;
let hpBar;
let inventoryTxt;
function initUI(scene) {
  const container = window.uiGroup;

  eggSprite = scene.add.sprite(700, 580, "egg2");
  eggSprite.setScale(1);
  eggSprite.setOrigin(0.5, 1);
  container.add(eggSprite);

  eggText = scene.add.text(670, 450, ``, {
    font: "16px Scribble",
    color: COL_PEN_CSS,
  })
  container.add(eggText);

  container.add(
    scene.add.text(20, 20, `Attack`, {
      font: "16px Scribble",
      color: COL_PEN_CSS,
    })
  );
  container.add(
    scene.add.text(20, 45, `Life`, {
      font: "16px Scribble",
      color: COL_PEN_CSS,
    })
  );
  cooldownBar = scene.add.graphics();
  container.add(cooldownBar);
  hpBar = scene.add.graphics();
  container.add(hpBar);
  updateHpBar(1);

  inventoryTxt = scene.add.text(20, 70, "", {
    font: "16px Scribble",
    color: COL_PEN_CSS,
  });
  container.add(inventoryTxt);
  updateInventory();

  if (scene.sys.game.device.input.touch) {
    const w = scene.scale.width;
    const h = scene.scale.height;
    const indicatorHeight = 60; // Height of the indicator area
    const color = 0x000000; // White, you can tweak
    const alpha = 0.4; // Very transparent

    // Left area
    container.add(
      scene.add.rectangle(
        w * 0.17,
        h - indicatorHeight / 2,
        w * 0.33,
        indicatorHeight,
        color,
        alpha
      )
    );

    // Right area
    container.add(
      scene.add.rectangle(
        w * (1 - 0.17),
        h - indicatorHeight / 2,
        w * 0.33,
        indicatorHeight,
        color,
        alpha
      )
    );

    // Optional: add little arrows
    const leftArrow = scene.add
      .text(w * 0.17, h - indicatorHeight / 2, "<", {
        fontSize: "48px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setAlpha(0.5);
    container.add(leftArrow);

    const rightArrow = scene.add
      .text(w * (1 - 0.17), h - indicatorHeight / 2, ">", {
        fontSize: "48px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setAlpha(0.5);
    container.add(rightArrow);
  }
}

function updateAttackCooldown(percent) {
  // Clear previous bar
  cooldownBar.clear();

  // Calculate how full the bar should be
  const cooldownPercent = Phaser.Math.Clamp(percent, 0, 1);

  // Draw the background (gray)
  cooldownBar.lineStyle(WIDTH_PEN, COL_PEN, 1);
  cooldownBar.fillStyle(COL_WALL);
  cooldownBar.strokeRect(100, 25, 100, 10); // (x, y, width, height)

  // Draw the foreground (green)
  cooldownBar.fillStyle(COL_PEN);
  cooldownBar.fillRect(100, 25, 100 * cooldownPercent, 10);
}

function updateHpBar(percent) {
  hpBar.clear();
  percent = Phaser.Math.Clamp(percent, 0, 1);
  hpBar.lineStyle(WIDTH_PEN, COL_PEN, 1);
  hpBar.fillStyle(COL_WALL);
  hpBar.strokeRect(100, 50, 100, 10); // (x, y, width, height)
  hpBar.fillStyle(COL_PEN);
  hpBar.fillRect(100, 50, 100 * percent, 10);
}

function updateInventory() {
  if (player.inventory.length === 0) {
    inventoryTxt.text = "";
    return;
  }
  let inventoryText = "Inventory:\n";
  player.inventory.forEach((relic, index) => {
    inventoryText += " - " + relic.name + "\n";
  });
  inventoryTxt.text = inventoryText;
}

function drawMinimap(scene, container) {
  const map = window.currentRoom.map;
  const monsters = window.currentRoom.monsters;
  const minimapSize = 128;
  const tileSize = minimapSize / map.length;
  const offsetX = 16;
  const offsetY = 600 - minimapSize - 16;

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

let activeSignMessage = null;

function hideMessage() {
  if (activeSignMessage) {
    activeSignMessage.bg.destroy();
    activeSignMessage.text.destroy();
    activeSignMessage.sprite?.destroy();
    activeSignMessage.titleSprite?.destroy();
    activeSignMessage = null;
  }
}

function showMessage(scene, text, sprite, titleSpriteKey) {
  if (activeSignMessage) {
    activeSignMessage.bg.destroy();
    activeSignMessage.text.destroy();
    activeSignMessage.sprite?.destroy();
    activeSignMessage.titleSprite?.destroy();
    activeSignMessage = null;
  }

  const width = 600;
  const height = 100;
  const x = scene.cameras.main.centerX - width / 2;
  const y = scene.cameras.main.height - height - 20;

  let titleSprite;
  if (titleSpriteKey) {
    titleSprite = scene.add.sprite(
      scene.cameras.main.centerX,
      0,
      titleSpriteKey
    );
    titleSprite.setScale(1);
    titleSprite.setOrigin(0.5, 0);
    window.uiGroup.add(titleSprite);
  }

  let messageSprite;
  if (sprite) {
    messageSprite = scene.add.sprite(
      scene.cameras.main.centerX,
      y + 40,
      sprite
    );
    messageSprite.setScale(1);
    messageSprite.setOrigin(0.5, 1);
    window.uiGroup.add(messageSprite);
  }

  // Background box
  const bg = scene.add.graphics();
  window.uiGroup.add(bg);
  bg.fillStyle(COL_WALL, 1);
  bg.fillRoundedRect(x, y, width, height, 20);
  bg.lineStyle(WIDTH_PEN, COL_PEN, 1);
  smoothStrokeRect(bg, x, y, width, height, 3);

  // Text
  const msgText = scene.add.text(
    scene.cameras.main.centerX,
    y + height / 2,
    text,
    {
      font: "24px Scribble",
      fontStyle: "bold",
      color: COL_PEN_CSS,
      align: "center",
      wordWrap: { width: width - 40 },
    }
  );
  window.uiGroup.add(msgText);
  msgText.setOrigin(0.5);

  activeSignMessage = {
    bg,
    text: msgText,
    sprite: messageSprite,
    titleSprite: titleSprite,
  };
}

function drawStar(scene, x, y, size, color = 0xffff00) {
  const hitStar = scene.add.graphics({ x: x, y: y });

  hitStar.fillStyle(color, 1);
  hitStar.beginPath();

  const points = 10; // Number of spikes
  const baseOuter = size;
  const baseInner = size * 0.4;
  const step = Math.PI / points;

  // Calculate and store the first point
  const firstRadius = baseOuter * Phaser.Math.FloatBetween(0.8, 1.2);
  const firstAngle = -Math.PI / 2; // Start pointing up
  const firstX = Math.cos(firstAngle) * firstRadius;
  const firstY = Math.sin(firstAngle) * firstRadius;

  hitStar.moveTo(firstX, firstY);

  const coords = [];
  coords.push({ x: firstX, y: firstY });

  for (let i = 1; i <= points * 2; i++) {
    const isOuter = i % 2 === 0;
    const baseRadius = isOuter ? baseOuter : baseInner;
    const radius = baseRadius * Phaser.Math.FloatBetween(0.8, 1.2);
    const angle = step * i - Math.PI / 2;
    const cx = Math.cos(angle) * radius;
    const cy = Math.sin(angle) * radius;
    hitStar.lineTo(cx, cy);
    coords.push({ x: cx, y: cy });
  }

  // Explicitly line back to the very first point
  hitStar.lineTo(firstX, firstY);

  hitStar.closePath();
  hitStar.fillPath();

  scene.time.delayedCall(300, () => {
    hitStar.destroy();
  });
}

// Function to trigger the screen shake effect
function shakeScreenOnHit(scene, intensity = 0.03, duration = 200) {
  // intensity controls the strength of the shake
  // duration controls how long the shake lasts (in milliseconds)

  scene.cameras.main.shake(duration, intensity); // Main camera shake
}

let eggSprite;
let eggText;
let eggTimer = 0;
let eggTextTimer = 0;
let eggSpeed = 0.9; // oscillations per second
const sweetSpotThreshold = 5; // degrees

function uiUpdate(delta) {
  if (eggTextTimer > 0) {
    eggTextTimer -= delta;
    if (eggTextTimer <= 0) {
      eggText.text = '';
    }
  }
  eggTimer += delta / 1000; // convert to seconds
  window.eggAngle =
    Math.sin(eggTimer * eggSpeed * Math.PI * 2) * window.maxEggAngle;
  eggSprite.setRotation(Phaser.Math.DegToRad(eggAngle));
  let isInSweetSpot = Math.abs(eggAngle) < sweetSpotThreshold;

  if (isInSweetSpot && !eggSprite.isPulsing) {
    eggSprite.isPulsing = true;
    sceneRef.tweens.add({
      targets: eggSprite,
      scale: 1.2,
      yoyo: true,
      duration: 80,
      onComplete: () => {
        eggSprite.isPulsing = false;
        eggSprite.setScale(1); // reset scale just in case
      },
    });
  }
}

function showEggText(message) {
  eggText.text = message;
  eggTextTimer = 1000;
}