import Phaser from 'phaser';
import type { GameLocation, OdysseyNearestEventDetail } from './types';
import { ODYSSEY_EVENT_CLOSE, ODYSSEY_EVENT_NEAREST, ODYSSEY_EVENT_OPEN, ODYSSEY_EVENT_READY } from './types';
import { GAME_WORLD } from './locationMapper';

type BootConfig = {
  locations: GameLocation[];
};

type KeyboardBundle = {
  W?: Phaser.Input.Keyboard.Key;
  A?: Phaser.Input.Keyboard.Key;
  S?: Phaser.Input.Keyboard.Key;
  D?: Phaser.Input.Keyboard.Key;
  UP?: Phaser.Input.Keyboard.Key;
  DOWN?: Phaser.Input.Keyboard.Key;
  LEFT?: Phaser.Input.Keyboard.Key;
  RIGHT?: Phaser.Input.Keyboard.Key;
  E?: Phaser.Input.Keyboard.Key;
  ESC?: Phaser.Input.Keyboard.Key;
};

function emitEvent<T>(name: string, detail?: T) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export class BackendOdysseyScene extends Phaser.Scene {
  private readonly bootConfig: BootConfig;
  private locations: GameLocation[] = [];
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private keys!: KeyboardBundle;
  private nearestLocationId: string | null = null;
  private nearestInteractable = false;
  private loadingLabel?: Phaser.GameObjects.Text;

  constructor(config: BootConfig) {
    super('BackendOdysseyScene');
    this.bootConfig = config;
  }

  preload() {
    this.createTextures();
  }

  create() {
    this.locations = this.bootConfig.locations;

    this.cameras.main.setBackgroundColor('#050811');
    this.cameras.main.setBounds(0, 0, GAME_WORLD.width, GAME_WORLD.height);
    this.physics.world.setBounds(0, 0, GAME_WORLD.width, GAME_WORLD.height);

    this.add.tileSprite(0, 0, GAME_WORLD.width, GAME_WORLD.height, 'odyssey-starfield').setOrigin(0).setDepth(-20);
    this.add.tileSprite(0, 0, GAME_WORLD.width, GAME_WORLD.height, 'odyssey-grid').setOrigin(0).setAlpha(0.12).setDepth(-19);

    this.add
      .ellipse(GAME_WORLD.width * 0.26, GAME_WORLD.height * 0.26, 820, 520, 0x69a7ff, 0.08)
      .setDepth(-18);
    this.add
      .ellipse(GAME_WORLD.width * 0.72, GAME_WORLD.height * 0.2, 700, 400, 0x7cf7d4, 0.07)
      .setDepth(-18);
    this.add
      .ellipse(GAME_WORLD.width * 0.58, GAME_WORLD.height * 0.76, 640, 420, 0xf6b74c, 0.05)
      .setDepth(-18);

    this.drawLocations();
    this.player = this.physics.add.sprite(this.locations[0]?.worldX ?? 300, this.locations[0]?.worldY ?? 300, 'odyssey-ship');
    this.player.setDepth(20);
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(360, 360);
    this.player.setDrag(520, 520);
    this.player.setDamping(true);
    this.player.setSize(36, 36);
    this.player.setOffset(14, 14);

    this.keys = this.input.keyboard?.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ESC') as KeyboardBundle;

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(0.92);

    this.loadingLabel = this.add
      .text(GAME_WORLD.width / 2, GAME_WORLD.height / 2, 'Initializing Backend Odyssey...', {
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: '28px',
        color: '#7cf7d4',
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(50);

    this.time.delayedCall(120, () => {
      this.loadingLabel?.destroy();
      this.loadingLabel = undefined;
      emitEvent(ODYSSEY_EVENT_READY);
    });
  }

  update() {
    if (!this.player || !this.keys) {
      return;
    }

    const acceleration = 760;
    const velocity = this.player.body.velocity;
    let ax = 0;
    let ay = 0;

    if (this.keys.W?.isDown || this.keys.UP?.isDown) {
      ay -= acceleration;
    }
    if (this.keys.S?.isDown || this.keys.DOWN?.isDown) {
      ay += acceleration;
    }
    if (this.keys.A?.isDown || this.keys.LEFT?.isDown) {
      ax -= acceleration;
    }
    if (this.keys.D?.isDown || this.keys.RIGHT?.isDown) {
      ax += acceleration;
    }

    this.player.setAcceleration(ax, ay);

    const speed = Math.hypot(velocity.x, velocity.y);
    if (speed > 24) {
      this.player.rotation = Phaser.Math.Angle.Between(0, 0, velocity.x, velocity.y) + Math.PI / 2;
    }

    const nearest = this.getNearestLocation(this.player.x, this.player.y);
    if (nearest) {
      const interactable = nearest.distance <= nearest.location.promptRadius;
      if (this.nearestLocationId !== nearest.location.id || this.nearestInteractable !== interactable) {
        this.nearestLocationId = nearest.location.id;
        this.nearestInteractable = interactable;
        const prompt = interactable ? `Press E to enter ${nearest.location.title}` : null;
        const detail: OdysseyNearestEventDetail = {
          location: nearest.location,
          prompt,
          interactable,
        };
        emitEvent(ODYSSEY_EVENT_NEAREST, detail);
      }
    }

    const interactKey = this.keys.E;
    if (interactKey && Phaser.Input.Keyboard.JustDown(interactKey)) {
      if (nearest && nearest.distance <= nearest.location.promptRadius) {
        emitEvent(ODYSSEY_EVENT_OPEN, { checkpointId: nearest.location.id });
      }
    }

    const closeKey = this.keys.ESC;
    if (closeKey && Phaser.Input.Keyboard.JustDown(closeKey)) {
      emitEvent(ODYSSEY_EVENT_CLOSE);
    }
  }

  private getNearestLocation(x: number, y: number) {
    let nearest: { location: GameLocation; distance: number } | null = null;

    for (const location of this.locations) {
      const distance = Phaser.Math.Distance.Between(x, y, location.worldX, location.worldY);

      if (!nearest || distance < nearest.distance) {
        nearest = { location, distance };
      }
    }

    return nearest;
  }

  private drawLocations() {
    for (const location of this.locations) {
      const container = this.add.container(location.worldX, location.worldY);
      container.setDepth(location.branchOf ? 8 : 12);

      const glow = this.add.circle(0, 0, location.radius * 2.4, location.glowColor, location.branchOf ? 0.08 : 0.12);
      const outer = this.add.circle(0, 0, location.radius, location.coreColor, 0.98);
      outer.setStrokeStyle(location.branchOf ? 2 : 4, location.ringColor, location.branchOf ? 0.55 : 0.75);
      const core = this.add.circle(0, 0, Math.max(10, location.radius * 0.5), location.ringColor, 0.72);
      core.setStrokeStyle(2, 0xdbe7ff, 0.12);
      const inner = this.add.circle(0, 0, Math.max(5, location.radius * 0.28), 0x050811, 1);
      const label = this.add
        .text(location.labelOffsetX, location.labelOffsetY, location.title, {
          fontFamily: '"IBM Plex Sans", sans-serif',
          fontSize: location.branchOf ? '15px' : '19px',
          color: location.branchOf ? '#c8d3ec' : '#f4f8ff',
          align: 'center',
        })
        .setOrigin(0.5, 0)
        .setShadow(0, 0, '#050811', 10, true, true);
      const subtitle = this.add
        .text(location.labelOffsetX, location.labelOffsetY + 24, location.subtitle, {
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '11px',
          color: location.branchOf ? '#8ea1c7' : '#7cf7d4',
          align: 'center',
        })
        .setOrigin(0.5, 0)
        .setAlpha(0.92);

      container.add([glow, outer, core, inner, label, subtitle]);
    }
  }

  private createTextures() {
    const ship = this.add.graphics();
    ship.fillStyle(0x7cf7d4, 1);
    ship.fillTriangle(32, 4, 60, 30, 32, 56);
    ship.fillStyle(0x0d1423, 1);
    ship.fillTriangle(18, 18, 48, 32, 18, 46);
    ship.lineStyle(2, 0xdbe7ff, 0.4);
    ship.strokeTriangle(32, 4, 60, 30, 32, 56);
    ship.fillStyle(0xf6b74c, 1);
    ship.fillCircle(24, 30, 4);
    ship.generateTexture('odyssey-ship', 64, 64);
    ship.destroy();

    const starfield = this.add.graphics();
    starfield.fillStyle(0xffffff, 1);
    for (let index = 0; index < 420; index += 1) {
      const x = Phaser.Math.Between(0, 512);
      const y = Phaser.Math.Between(0, 512);
      const size = Phaser.Math.Between(1, 3);
      const alpha = Phaser.Math.FloatBetween(0.35, 1);
      starfield.fillStyle(index % 7 === 0 ? 0x69a7ff : index % 11 === 0 ? 0xf6b74c : 0xffffff, alpha);
      starfield.fillCircle(x, y, size);
    }
    starfield.generateTexture('odyssey-starfield', 512, 512);
    starfield.destroy();

    const grid = this.add.graphics();
    grid.lineStyle(1, 0x7cf7d4, 0.14);
    for (let x = 0; x <= 512; x += 48) {
      grid.lineBetween(x, 0, x, 512);
    }
    for (let y = 0; y <= 512; y += 48) {
      grid.lineBetween(0, y, 512, y);
    }
    grid.generateTexture('odyssey-grid', 512, 512);
    grid.destroy();
  }
}
