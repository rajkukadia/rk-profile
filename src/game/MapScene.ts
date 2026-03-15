import Phaser from "phaser";

interface LocationData {
  id: string;
  name: string;
  x: number;
  y: number;
  icon: string;
}

export default class MapScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private isMoving = false;
  private targetX = 0;
  private targetY = 0;
  private locations: LocationData[] = [];
  private locationMarkers: Phaser.GameObjects.Container[] = [];
  private infoPanel: Phaser.GameObjects.Container | null = null;
  private hasClicked = false;
  private instructionText: Phaser.GameObjects.Text | null = null;

  // Callbacks to React
  public onLocationSelect?: (id: string) => void;

  constructor() {
    super({ key: "MapScene" });
  }

  preload() {
    // We generate all assets programmatically - no external files needed
  }

  create() {
    const { width, height } = this.scale;

    // Define locations spread across the map
    this.locations = [
      { id: "home", name: "Home Base", x: width * 0.15, y: height * 0.65, icon: "🏠" },
      { id: "about", name: "About Town", x: width * 0.35, y: height * 0.55, icon: "👤" },
      { id: "skills", name: "Skills Forest", x: width * 0.55, y: height * 0.70, icon: "⚡" },
      { id: "projects", name: "Projects Peak", x: width * 0.75, y: height * 0.50, icon: "🏔️" },
      { id: "contact", name: "Contact Port", x: width * 0.90, y: height * 0.65, icon: "📧" },
    ];

    this.drawSky(width, height);
    this.drawTerrain(width, height);
    this.drawRiver(width, height);
    this.drawMountains(width, height);
    this.drawTrees(width, height);
    this.drawHouses(width, height);
    this.drawDecorations(width, height);
    this.createCharacterSprite();
    this.createLocations();
    this.createInstructionText(width);
    this.createPlayer();

    // Click to move
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (!this.isMoving) {
        this.targetX = pointer.worldX;
        this.targetY = Phaser.Math.Clamp(pointer.worldY, height * 0.42, height * 0.88);
        this.isMoving = true;
        this.player.play("walk");
        if (this.targetX < this.player.x) {
          this.player.setFlipX(true);
        } else {
          this.player.setFlipX(false);
        }
      }
    });
  }

  update() {
    if (this.isMoving) {
      const speed = 3;
      const dx = this.targetX - this.player.x;
      const dy = this.targetY - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 5) {
        this.isMoving = false;
        this.player.play("idle");
      } else {
        this.player.x += (dx / dist) * speed;
        this.player.y += (dy / dist) * speed;
      }

      // Check proximity to locations
      for (let i = 0; i < this.locations.length; i++) {
        const loc = this.locations[i];
        const locDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, loc.x, loc.y);
        if (locDist < 50) {
          this.showInfoPanel(loc);
        }
      }
    }
  }

  // ---- SKY ----
  private drawSky(w: number, h: number) {
    const sky = this.add.graphics();
    // Gradient sky
    for (let y = 0; y < h * 0.45; y++) {
      const t = y / (h * 0.45);
      const r = Phaser.Math.Linear(40, 60, t);
      const g = Phaser.Math.Linear(20, 80, t);
      const b = Phaser.Math.Linear(80, 40, t);
      sky.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
      sky.fillRect(0, y, w, 1);
    }

    // Stars
    for (let i = 0; i < 60; i++) {
      const sx = Phaser.Math.Between(0, w);
      const sy = Phaser.Math.Between(0, h * 0.35);
      const size = Phaser.Math.Between(1, 2);
      sky.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.3, 1.0));
      sky.fillRect(sx, sy, size, size);
    }
  }

  // ---- TERRAIN ----
  private drawTerrain(w: number, h: number) {
    const ground = this.add.graphics();
    const grassStart = h * 0.40;

    // Base grass gradient
    for (let y = grassStart; y < h; y++) {
      const t = (y - grassStart) / (h - grassStart);
      const r = Phaser.Math.Linear(26, 20, t);
      const g = Phaser.Math.Linear(92, 60, t);
      const b = Phaser.Math.Linear(26, 15, t);
      ground.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
      ground.fillRect(0, y, w, 1);
    }

    // Pixel grass texture - scattered lighter/darker pixels
    for (let i = 0; i < 3000; i++) {
      const gx = Phaser.Math.Between(0, w);
      const gy = Phaser.Math.Between(Math.floor(grassStart), h);
      const shade = Phaser.Math.Between(0, 3);
      const colors = [0x1a5c1a, 0x228b22, 0x2d5016, 0x3cb371];
      ground.fillStyle(colors[shade], Phaser.Math.FloatBetween(0.3, 0.7));
      ground.fillRect(gx, gy, 2, 2);
    }

    // Dirt patches
    this.drawDirtPatch(ground, w * 0.2, h * 0.60, 60, 30);
    this.drawDirtPatch(ground, w * 0.5, h * 0.65, 80, 25);
    this.drawDirtPatch(ground, w * 0.8, h * 0.70, 50, 20);
    this.drawDirtPatch(ground, w * 0.35, h * 0.75, 70, 30);
    this.drawDirtPatch(ground, w * 0.65, h * 0.58, 45, 20);

    // Small grass tufts
    for (let i = 0; i < 100; i++) {
      const tx = Phaser.Math.Between(0, w);
      const ty = Phaser.Math.Between(Math.floor(grassStart + 20), h);
      this.drawGrassTuft(ground, tx, ty);
    }
  }

  private drawDirtPatch(g: Phaser.GameObjects.Graphics, cx: number, cy: number, rx: number, ry: number) {
    for (let i = 0; i < 200; i++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const r = Phaser.Math.FloatBetween(0, 1);
      const px = cx + Math.cos(angle) * rx * r;
      const py = cy + Math.sin(angle) * ry * r;
      const colors = [0x654321, 0x8b6914, 0x5c3d2e, 0x4a2f1a];
      g.fillStyle(colors[Phaser.Math.Between(0, 3)], Phaser.Math.FloatBetween(0.3, 0.6));
      g.fillRect(px, py, 2, 2);
    }
  }

  private drawGrassTuft(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.fillStyle(0x32cd32, 0.6);
    g.fillRect(x, y, 2, 2);
    g.fillRect(x - 2, y + 2, 2, 2);
    g.fillRect(x + 2, y + 2, 2, 2);
    g.fillStyle(0x228b22, 0.6);
    g.fillRect(x, y + 2, 2, 2);
  }

  // ---- RIVER ----
  private drawRiver(w: number, h: number) {
    const river = this.add.graphics();

    // River path - winding curve
    const points: { x: number; y: number }[] = [];
    for (let x = 0; x <= w; x += 2) {
      const baseY = h * 0.48;
      const offset = Math.sin(x * 0.008) * 40 + Math.sin(x * 0.003) * 20;
      points.push({ x, y: baseY + offset });
    }

    // Draw river width
    const riverWidth = 20;
    for (const p of points) {
      // Dark blue edges
      river.fillStyle(0x003366, 0.8);
      river.fillRect(p.x, p.y - riverWidth / 2 - 2, 2, 2);
      river.fillRect(p.x, p.y + riverWidth / 2, 2, 2);

      // Main water
      for (let ry = -riverWidth / 2; ry < riverWidth / 2; ry += 2) {
        const t = (ry + riverWidth / 2) / riverWidth;
        const shade = t < 0.3 || t > 0.7 ? 0x1a6baa : t < 0.45 || t > 0.55 ? 0x2196f3 : 0x64b5f6;
        river.fillStyle(shade, 0.85);
        river.fillRect(p.x, p.y + ry, 2, 2);
      }
    }

    // Animated water sparkles
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        const sparkle = this.add.graphics();
        const idx = Phaser.Math.Between(0, points.length - 1);
        const p = points[idx];
        sparkle.fillStyle(0xffffff, 0.8);
        sparkle.fillRect(p.x, p.y + Phaser.Math.Between(-8, 8), 2, 2);
        this.tweens.add({
          targets: sparkle,
          alpha: 0,
          duration: 800,
          onComplete: () => sparkle.destroy(),
        });
      },
    });
  }

  // ---- MOUNTAINS ----
  private drawMountains(w: number, h: number) {
    const mtn = this.add.graphics();
    const peaks = [
      { x: w * 0.60, y: h * 0.30, size: 80 },
      { x: w * 0.72, y: h * 0.28, size: 100 },
      { x: w * 0.85, y: h * 0.32, size: 70 },
      { x: w * 0.50, y: h * 0.34, size: 60 },
    ];

    for (const peak of peaks) {
      // Mountain body - pixel by pixel for shading
      for (let row = 0; row < peak.size; row++) {
        const t = row / peak.size;
        const halfWidth = row * 0.8;
        const baseY = peak.y + row;

        for (let col = -halfWidth; col < halfWidth; col += 2) {
          const sideT = (col + halfWidth) / (halfWidth * 2);
          // Left side lighter (light source), right side darker
          const r = Phaser.Math.Linear(130, 80, sideT) - t * 20;
          const g = Phaser.Math.Linear(130, 80, sideT) - t * 20;
          const b = Phaser.Math.Linear(140, 90, sideT) - t * 15;
          mtn.fillStyle(Phaser.Display.Color.GetColor(
            Phaser.Math.Clamp(r, 40, 180),
            Phaser.Math.Clamp(g, 40, 180),
            Phaser.Math.Clamp(b, 50, 190)
          ));
          mtn.fillRect(peak.x + col, baseY, 2, 2);
        }
      }

      // Snow cap
      for (let row = 0; row < peak.size * 0.25; row++) {
        const halfWidth = row * 0.8;
        for (let col = -halfWidth; col < halfWidth; col += 2) {
          mtn.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.7, 1.0));
          mtn.fillRect(peak.x + col, peak.y + row, 2, 2);
        }
      }
    }
  }

  // ---- TREES ----
  private drawTrees(w: number, h: number) {
    const grassStart = h * 0.42;

    // Forest clusters
    const treeClusters = [
      { cx: w * 0.08, cy: h * 0.58, count: 6 },
      { cx: w * 0.25, cy: h * 0.50, count: 4 },
      { cx: w * 0.45, cy: h * 0.55, count: 5 },
      { cx: w * 0.60, cy: h * 0.60, count: 3 },
      { cx: w * 0.92, cy: h * 0.55, count: 4 },
      // Scattered individual trees
      { cx: w * 0.18, cy: h * 0.72, count: 2 },
      { cx: w * 0.70, cy: h * 0.75, count: 2 },
      { cx: w * 0.40, cy: h * 0.80, count: 1 },
    ];

    for (const cluster of treeClusters) {
      for (let i = 0; i < cluster.count; i++) {
        const tx = cluster.cx + Phaser.Math.Between(-40, 40);
        const ty = Phaser.Math.Clamp(
          cluster.cy + Phaser.Math.Between(-20, 20),
          grassStart + 10,
          h - 20
        );
        const size = Phaser.Math.Between(8, 14);
        this.drawPixelTree(tx, ty, size);
      }
    }
  }

  private drawPixelTree(x: number, y: number, size: number) {
    const tree = this.add.graphics();

    // Shadow on ground
    tree.fillStyle(0x000000, 0.2);
    tree.fillEllipse(x, y + size + 4, size * 1.5, 6);

    // Trunk
    const trunkW = Math.max(4, size * 0.3);
    const trunkH = size * 0.6;
    tree.fillStyle(0x5c3d2e);
    tree.fillRect(x - trunkW / 2, y, trunkW, trunkH);
    tree.fillStyle(0x3d2817);
    tree.fillRect(x - trunkW / 2, y, trunkW / 2, trunkH); // Dark side

    // Leaves - layered circles for depth
    const leafColors = [0x0d3d0d, 0x1a5c1a, 0x228b22, 0x2e8b2e, 0x3cb371];

    // Bottom leaves (darkest, widest)
    tree.fillStyle(leafColors[0]);
    tree.fillEllipse(x, y - size * 0.1, size * 1.4, size * 0.8);

    tree.fillStyle(leafColors[1]);
    tree.fillEllipse(x, y - size * 0.3, size * 1.2, size * 0.7);

    tree.fillStyle(leafColors[2]);
    tree.fillEllipse(x, y - size * 0.5, size * 1.0, size * 0.6);

    tree.fillStyle(leafColors[3]);
    tree.fillEllipse(x - size * 0.1, y - size * 0.65, size * 0.7, size * 0.5);

    // Highlight on top
    tree.fillStyle(leafColors[4], 0.6);
    tree.fillEllipse(x - size * 0.15, y - size * 0.7, size * 0.4, size * 0.3);

    tree.setDepth(y);
  }

  // ---- HOUSES ----
  private drawHouses(w: number, h: number) {
    // House near Home Base
    this.drawPixelHouse(w * 0.12, h * 0.60, 0.8);
    // House near About Town
    this.drawPixelHouse(w * 0.32, h * 0.52, 1.0);
    this.drawPixelHouse(w * 0.37, h * 0.54, 0.7);
  }

  private drawPixelHouse(x: number, y: number, scale: number) {
    const house = this.add.graphics();
    const s = scale;
    const bw = 24 * s;
    const bh = 16 * s;

    // Shadow
    house.fillStyle(0x000000, 0.2);
    house.fillEllipse(x, y + bh + 4, bw * 1.3, 8);

    // Walls - front face with shading
    house.fillStyle(0xa0522d);
    house.fillRect(x - bw / 2, y, bw, bh);
    // Darker right side
    house.fillStyle(0x8b4513);
    house.fillRect(x, y, bw / 2, bh);

    // Roof
    const roofH = 12 * s;
    house.fillStyle(0x8b0000);
    house.beginPath();
    house.moveTo(x - bw / 2 - 4, y);
    house.lineTo(x, y - roofH);
    house.lineTo(x + bw / 2 + 4, y);
    house.closePath();
    house.fillPath();

    // Roof highlight (left side)
    house.fillStyle(0xcd5c5c, 0.5);
    house.beginPath();
    house.moveTo(x - bw / 2 - 4, y);
    house.lineTo(x, y - roofH);
    house.lineTo(x, y);
    house.closePath();
    house.fillPath();

    // Door
    house.fillStyle(0x2d1810);
    house.fillRect(x - 3 * s, y + bh * 0.4, 6 * s, bh * 0.6);

    // Windows with glow
    house.fillStyle(0xffff00, 0.9);
    house.fillRect(x - bw / 2 + 3 * s, y + 3 * s, 5 * s, 5 * s);
    house.fillRect(x + bw / 2 - 8 * s, y + 3 * s, 5 * s, 5 * s);

    // Window glow effect
    house.fillStyle(0xffff00, 0.15);
    house.fillCircle(x - bw / 2 + 5.5 * s, y + 5.5 * s, 8 * s);
    house.fillCircle(x + bw / 2 - 5.5 * s, y + 5.5 * s, 8 * s);

    house.setDepth(y);
  }

  // ---- DECORATIONS ----
  private drawDecorations(w: number, h: number) {
    const deco = this.add.graphics();
    const grassStart = h * 0.42;

    // Small rocks
    for (let i = 0; i < 30; i++) {
      const rx = Phaser.Math.Between(0, w);
      const ry = Phaser.Math.Between(Math.floor(grassStart + 20), Math.floor(h - 10));
      this.drawPixelRock(deco, rx, ry);
    }

    // Small flowers
    for (let i = 0; i < 50; i++) {
      const fx = Phaser.Math.Between(0, w);
      const fy = Phaser.Math.Between(Math.floor(grassStart + 30), Math.floor(h - 10));
      this.drawPixelFlower(deco, fx, fy);
    }

    // Campfire near center
    this.createCampfire(w * 0.48, h * 0.62);
  }

  private drawPixelRock(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    const size = Phaser.Math.Between(3, 6);
    // Shadow
    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(x, y + size / 2 + 1, size * 1.5, 3);
    // Rock body - light to dark
    g.fillStyle(0xa9a9a9);
    g.fillEllipse(x - 1, y - 1, size, size * 0.7);
    g.fillStyle(0x808080);
    g.fillEllipse(x, y, size, size * 0.7);
    g.fillStyle(0x696969);
    g.fillEllipse(x + 1, y + 1, size * 0.8, size * 0.5);
  }

  private drawPixelFlower(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    const colors = [0xff69b4, 0xffff00, 0xff6347, 0xda70d6, 0xff8c00];
    const color = colors[Phaser.Math.Between(0, 4)];

    // Stem
    g.fillStyle(0x228b22);
    g.fillRect(x, y, 1, 4);

    // Petals
    g.fillStyle(color, 0.9);
    g.fillRect(x - 1, y - 1, 1, 1);
    g.fillRect(x + 1, y - 1, 1, 1);
    g.fillRect(x, y - 2, 1, 1);
    g.fillRect(x - 1, y, 1, 1);
    g.fillRect(x + 1, y, 1, 1);

    // Center
    g.fillStyle(0xffff00);
    g.fillRect(x, y - 1, 1, 1);
  }

  private createCampfire(x: number, y: number) {
    const fire = this.add.graphics();
    fire.setDepth(y);

    // Logs
    fire.fillStyle(0x4a2511);
    fire.fillRect(x - 8, y + 4, 16, 4);
    fire.fillStyle(0x3d2817);
    fire.fillRect(x - 6, y + 8, 12, 3);

    // Animated flames
    this.time.addEvent({
      delay: 150,
      loop: true,
      callback: () => {
        const flame = this.add.graphics();
        flame.setDepth(y + 1);

        const colors = [0xffff00, 0xffa500, 0xff4500, 0xff6347];
        for (let fy = 0; fy < 12; fy += 2) {
          const t = fy / 12;
          const colorIdx = Math.min(3, Math.floor(t * 4));
          const fw = (1 - t) * 8 + Phaser.Math.Between(-2, 2);
          flame.fillStyle(colors[colorIdx], 0.9 - t * 0.3);
          flame.fillRect(x - fw / 2, y - fy + Phaser.Math.Between(-2, 0), fw, 2);
        }

        // Glow
        flame.fillStyle(0xff6600, 0.1);
        flame.fillCircle(x, y - 4, 20);

        this.tweens.add({
          targets: flame,
          alpha: 0,
          duration: 300,
          onComplete: () => flame.destroy(),
        });
      },
    });

    // Smoke particles
    this.time.addEvent({
      delay: 600,
      loop: true,
      callback: () => {
        const smoke = this.add.graphics();
        smoke.fillStyle(0x888888, 0.4);
        smoke.fillCircle(x + Phaser.Math.Between(-3, 3), y - 14, Phaser.Math.Between(2, 4));
        smoke.setDepth(1000);

        this.tweens.add({
          targets: smoke,
          y: smoke.y - 30,
          alpha: 0,
          scaleX: 1.5,
          scaleY: 1.5,
          duration: 1500,
          onComplete: () => smoke.destroy(),
        });
      },
    });
  }

  // ---- CHARACTER SPRITE (generated) ----
  private createCharacterSprite() {
    // Generate sprite sheet texture programmatically
    const frameW = 16;
    const frameH = 24;

    // Idle frame 1
    this.generateCharFrame("char_idle_0", frameW, frameH, 0);
    // Idle frame 2 (slight bounce)
    this.generateCharFrame("char_idle_1", frameW, frameH, -1);
    // Walk frame 1
    this.generateCharFrame("char_walk_0", frameW, frameH, 0, true, false);
    // Walk frame 2
    this.generateCharFrame("char_walk_1", frameW, frameH, 0, false, true);
  }

  private generateCharFrame(
    key: string, w: number, h: number, yOffset: number,
    leftStep = false, rightStep = false
  ) {
    const canvas = this.textures.createCanvas(key, w, h);
    if (!canvas) return;
    const ctx = canvas.context;

    const px = (x: number, y: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y + yOffset, 2, 2);
    };

    // Head
    px(6, 0, "#ffcc99"); px(8, 0, "#ffcc99");
    px(4, 2, "#ffcc99"); px(6, 2, "#ffcc99"); px(8, 2, "#ffcc99"); px(10, 2, "#ffcc99");
    px(4, 4, "#ffcc99"); px(6, 4, "#333333"); px(8, 4, "#333333"); px(10, 4, "#ffcc99");
    px(4, 6, "#ffcc99"); px(6, 6, "#ffcc99"); px(8, 6, "#ffcc99"); px(10, 6, "#ffcc99");

    // Hair
    px(4, 0, "#4a2817"); px(10, 0, "#4a2817");
    px(2, 2, "#4a2817"); px(12, 2, "#4a2817");

    // Body (blue tunic)
    px(4, 8, "#2266cc"); px(6, 8, "#2266cc"); px(8, 8, "#2266cc"); px(10, 8, "#2266cc");
    px(2, 10, "#2266cc"); px(4, 10, "#2266cc"); px(6, 10, "#3388dd"); px(8, 10, "#3388dd"); px(10, 10, "#2266cc"); px(12, 10, "#2266cc");
    px(4, 12, "#2266cc"); px(6, 12, "#3388dd"); px(8, 12, "#3388dd"); px(10, 12, "#2266cc");

    // Arms (skin)
    px(0, 10, "#ffcc99"); px(14, 10, "#ffcc99");
    px(0, 12, "#ffcc99"); px(14, 12, "#ffcc99");

    // Belt
    px(4, 14, "#8b6914"); px(6, 14, "#8b6914"); px(8, 14, "#8b6914"); px(10, 14, "#8b6914");

    // Legs (brown pants)
    if (leftStep) {
      px(4, 16, "#654321"); px(6, 16, "#654321");
      px(8, 16, "#654321"); px(10, 16, "#654321");
      px(2, 18, "#654321"); px(4, 18, "#654321");
      px(8, 18, "#654321"); px(10, 18, "#654321");
      // Boots
      px(2, 20, "#3d2817"); px(4, 20, "#3d2817");
      px(8, 20, "#3d2817"); px(10, 20, "#3d2817");
    } else if (rightStep) {
      px(4, 16, "#654321"); px(6, 16, "#654321");
      px(8, 16, "#654321"); px(10, 16, "#654321");
      px(4, 18, "#654321"); px(6, 18, "#654321");
      px(10, 18, "#654321"); px(12, 18, "#654321");
      // Boots
      px(4, 20, "#3d2817"); px(6, 20, "#3d2817");
      px(10, 20, "#3d2817"); px(12, 20, "#3d2817");
    } else {
      px(4, 16, "#654321"); px(6, 16, "#654321");
      px(8, 16, "#654321"); px(10, 16, "#654321");
      px(4, 18, "#654321"); px(6, 18, "#654321");
      px(8, 18, "#654321"); px(10, 18, "#654321");
      // Boots
      px(4, 20, "#3d2817"); px(6, 20, "#3d2817");
      px(8, 20, "#3d2817"); px(10, 20, "#3d2817");
    }

    canvas.refresh();
  }

  // ---- PLAYER ----
  private createPlayer() {
    const { height } = this.scale;
    const startLoc = this.locations[0];

    // Create animations
    this.anims.create({
      key: "idle",
      frames: [
        { key: "char_idle_0" },
        { key: "char_idle_1" },
      ],
      frameRate: 2,
      repeat: -1,
    });

    this.anims.create({
      key: "walk",
      frames: [
        { key: "char_walk_0" },
        { key: "char_walk_1" },
      ],
      frameRate: 6,
      repeat: -1,
    });

    this.player = this.add.sprite(startLoc.x, startLoc.y, "char_idle_0");
    this.player.setScale(3);
    this.player.setDepth(10000);
    this.player.play("idle");

    // Shadow under player
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillEllipse(0, 0, 20, 6);
    shadow.setDepth(9999);

    // Update shadow position
    this.events.on("update", () => {
      shadow.setPosition(this.player.x, this.player.y + 36);
    });
  }

  // ---- LOCATIONS ----
  private createLocations() {
    for (const loc of this.locations) {
      const container = this.add.container(loc.x, loc.y - 40);
      container.setDepth(20000);

      // Marker pin
      const marker = this.add.graphics();
      // Pin shadow
      marker.fillStyle(0x000000, 0.2);
      marker.fillEllipse(0, 24, 16, 6);
      // Pin body
      marker.fillStyle(0xff4444);
      marker.fillCircle(0, 0, 10);
      // Pin highlight
      marker.fillStyle(0xff8888, 0.6);
      marker.fillCircle(-3, -3, 4);
      // Pin point
      marker.fillStyle(0xcc0000);
      marker.beginPath();
      marker.moveTo(-5, 6);
      marker.lineTo(0, 18);
      marker.lineTo(5, 6);
      marker.closePath();
      marker.fillPath();

      // Icon text
      const icon = this.add.text(0, 0, loc.icon, {
        fontSize: "14px",
      }).setOrigin(0.5);

      // Name label
      const label = this.add.text(0, -18, loc.name, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "7px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      }).setOrigin(0.5);

      container.add([marker, icon, label]);

      // Pulse animation
      this.tweens.add({
        targets: container,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      // Click interaction
      marker.setInteractive(new Phaser.Geom.Circle(0, 0, 16), Phaser.Geom.Circle.Contains);
      marker.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();

        if (!this.hasClicked) {
          this.hasClicked = true;
          if (this.instructionText) {
            this.tweens.add({
              targets: this.instructionText,
              alpha: 0,
              duration: 500,
              onComplete: () => this.instructionText?.destroy(),
            });
          }
        }

        // Move character to location
        this.targetX = loc.x;
        this.targetY = loc.y;
        this.isMoving = true;
        this.player.play("walk");
        this.player.setFlipX(loc.x < this.player.x);

        this.showInfoPanel(loc);

        if (this.onLocationSelect) {
          this.onLocationSelect(loc.id);
        }
      });

      this.locationMarkers.push(container);
    }
  }

  // ---- INFO PANEL ----
  private showInfoPanel(loc: LocationData) {
    if (this.infoPanel) {
      this.infoPanel.destroy();
    }

    const { width, height } = this.scale;
    const panelW = 280;
    const panelH = 80;
    const px = width / 2;
    const py = height - 60;

    const container = this.add.container(px, py);
    container.setDepth(30000);

    // Panel background
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.85);
    bg.fillRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 8);
    bg.lineStyle(2, 0x00ff00);
    bg.strokeRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 8);

    const descriptions: Record<string, string> = {
      home: "Welcome! I'm Raj Kukadia,\na Software Engineer.",
      about: "Learn about my journey\nand background.",
      skills: "Explore my technical skills\nand expertise.",
      projects: "Check out my projects\nand work portfolio.",
      contact: "Get in touch!\nLet's connect.",
    };

    const title = this.add.text(0, -20, `${loc.icon} ${loc.name}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "10px",
      color: "#00ff00",
    }).setOrigin(0.5);

    const desc = this.add.text(0, 10, descriptions[loc.id] || "", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "7px",
      color: "#ffffff",
      align: "center",
    }).setOrigin(0.5);

    container.add([bg, title, desc]);
    container.setAlpha(0);

    this.tweens.add({
      targets: container,
      alpha: 1,
      y: py - 10,
      duration: 300,
      ease: "Back.easeOut",
    });

    this.infoPanel = container;

    // Auto-hide after 4 seconds
    this.time.delayedCall(4000, () => {
      if (this.infoPanel === container) {
        this.tweens.add({
          targets: container,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            container.destroy();
            if (this.infoPanel === container) this.infoPanel = null;
          },
        });
      }
    });
  }

  // ---- INSTRUCTION TEXT ----
  private createInstructionText(w: number) {
    this.instructionText = this.add.text(w / 2, 30, "Click locations to explore", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "12px",
      color: "#ffff00",
      stroke: "#000000",
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(30000);

    this.tweens.add({
      targets: this.instructionText,
      alpha: 0.5,
      duration: 1500,
      yoyo: true,
      repeat: -1,
    });
  }
}
