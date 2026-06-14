import Phaser from 'phaser';
import type { GameLocation, OdysseyNearestEventDetail } from './types';
import { GAME_WORLD } from './locationMapper';
import {
  ODYSSEY_EVENT_CLOSE,
  ODYSSEY_EVENT_NEAREST,
  ODYSSEY_EVENT_OPEN,
  ODYSSEY_EVENT_READY,
} from './types';
import { generateAllTextures } from './spriteDefs';

type BootConfig = {
  locations: GameLocation[];
};

type KeyboardBundle = {
  E?: Phaser.Input.Keyboard.Key;
  ESC?: Phaser.Input.Keyboard.Key;
};

type LocationNode = {
  location: GameLocation;
  halo: Phaser.GameObjects.Ellipse;
  zone: Phaser.GameObjects.Zone;
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
  private nodes = new Map<string, LocationNode>();
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private keys!: KeyboardBundle;
  private nearestLocationId: string | null = null;
  private nearestInteractable = false;
  private currentTarget: Phaser.Math.Vector2 | null = null;
  private heroSpeed = 210;

  constructor(config: BootConfig) {
    super('BackendOdysseyScene');
    this.bootConfig = config;
  }

  preload() {
    generateAllTextures(this);
  }

  create() {
    this.locations = this.bootConfig.locations;

    this.cameras.main.setBackgroundColor('#08110a');
    this.cameras.main.setBounds(0, 0, GAME_WORLD.width, GAME_WORLD.height);
    this.physics.world.setBounds(0, 0, GAME_WORLD.width, GAME_WORLD.height);

    this.add.tileSprite(0, 0, GAME_WORLD.width, GAME_WORLD.height, 'odyssey-ground').setOrigin(0).setDepth(-30);
    this.add.tileSprite(0, 0, GAME_WORLD.width, GAME_WORLD.height, 'odyssey-noise').setOrigin(0).setAlpha(0.16).setDepth(-29);
    this.add.rectangle(GAME_WORLD.width / 2, GAME_WORLD.height / 2, GAME_WORLD.width, GAME_WORLD.height, 0x0b170d, 0.16).setDepth(-28);

    this.drawFogs();
    this.drawTownSquare();
    this.drawRoads();
    this.drawLocations();
    this.drawLanterns();

    const spawn = this.locations.find((location) => location.id === 'spawn-point') ?? this.locations[0];
    this.player = this.physics.add.sprite(spawn?.worldX ?? GAME_WORLD.width / 2, spawn?.worldY ?? GAME_WORLD.height / 2, 'odyssey-hero');
    this.player.setDepth(1000);
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(0, 0);
    this.player.body.setSize(14, 10, true);
    this.player.body.setOffset(0, 30);
    this.playerShadow = this.add.ellipse(this.player.x, this.player.y + 20, 24, 8, 0x000000, 0.34).setDepth(999);

    this.currentTarget = new Phaser.Math.Vector2(this.player.x, this.player.y);

    this.keys = this.input.keyboard?.addKeys('E,ESC') as KeyboardBundle;
    this.cameras.main.centerOn(this.player.x, this.player.y);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(0.98);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
      if (currentlyOver.length > 0) {
        return;
      }

      this.setMoveTarget(pointer.worldX, pointer.worldY);
    });

    this.time.delayedCall(60, () => emitEvent(ODYSSEY_EVENT_READY));

    this.emitNearestState();
  }

  update(_time: number, delta: number) {
    if (!this.player) {
      return;
    }

    const target = this.currentTarget;
    if (target) {
      const dx = target.x - this.player.x;
      const dy = target.y - this.player.y;
      const distance = Math.hypot(dx, dy);

      if (distance <= 6) {
        this.player.setVelocity(0, 0);
        this.currentTarget = null;
      } else {
        const step = (this.heroSpeed * delta) / 1000;
        const speedX = (dx / distance) * this.heroSpeed;
        const speedY = (dy / distance) * this.heroSpeed;
        this.player.setVelocity(speedX, speedY);
        this.player.setFlipX(speedX < 0);

        if (distance < step) {
          this.player.setPosition(target.x, target.y);
          this.player.setVelocity(0, 0);
          this.currentTarget = null;
        }
      }
    } else {
      this.player.setVelocity(0, 0);
    }

    this.playerShadow.setPosition(this.player.x, this.player.y + 20);

    const nearest = this.findNearestLocation(this.player.x, this.player.y);
    const interactable = Boolean(nearest && nearest.distance <= nearest.location.promptRadius);
    if (nearest && (nearest.location.id !== this.nearestLocationId || interactable !== this.nearestInteractable)) {
      this.nearestLocationId = nearest.location.id;
      this.nearestInteractable = interactable;
      this.emitNearestState(nearest);
    } else if (!nearest && this.nearestLocationId !== null) {
      this.nearestLocationId = null;
      this.nearestInteractable = false;
      this.emitNearestState(null);
    }

    const interactKey = this.keys.E;
    if (interactKey && Phaser.Input.Keyboard.JustDown(interactKey)) {
      if (nearest && nearest.distance <= nearest.location.promptRadius) {
        this.openCheckpoint(nearest.location);
      }
    }

    const closeKey = this.keys.ESC;
    if (closeKey && Phaser.Input.Keyboard.JustDown(closeKey)) {
      emitEvent(ODYSSEY_EVENT_CLOSE);
    }
  }

  private setMoveTarget(worldX: number, worldY: number) {
    this.currentTarget = new Phaser.Math.Vector2(
      Phaser.Math.Clamp(worldX, 0, GAME_WORLD.width),
      Phaser.Math.Clamp(worldY, 0, GAME_WORLD.height),
    );
  }

  private openCheckpoint(location: GameLocation) {
    emitEvent(ODYSSEY_EVENT_OPEN, { checkpointId: location.id });
  }

  private emitNearestState(nearest?: { location: GameLocation; distance: number } | null) {
    const selected = nearest ?? this.findNearestLocation(this.player.x, this.player.y);
    const interactable = Boolean(selected && selected.distance <= selected.location.promptRadius);

    if (selected && interactable) {
      emitEvent<OdysseyNearestEventDetail>(ODYSSEY_EVENT_NEAREST, {
        location: selected.location,
        prompt: `Press E or click to inspect ${selected.location.displayName}`,
        interactable: true,
      });
      return;
    }

    emitEvent<OdysseyNearestEventDetail>(ODYSSEY_EVENT_NEAREST, {
      location: selected?.location ?? null,
      prompt: null,
      interactable: false,
    });
  }

  private findNearestLocation(x: number, y: number) {
    let nearest: { location: GameLocation; distance: number } | null = null;

    for (const location of this.locations) {
      const distance = Phaser.Math.Distance.Between(x, y, location.worldX, location.worldY);
      if (!nearest || distance < nearest.distance) {
        nearest = { location, distance };
      }
    }

    return nearest;
  }

  private drawRoads() {
    const road = this.add.graphics().setDepth(2);
    const pathLocations = [...this.locations].filter((location) => !location.branchOf).sort(
      (left, right) => (left.pathOrder ?? left.order) - (right.pathOrder ?? right.order),
    );

    for (let index = 0; index < pathLocations.length - 1; index += 1) {
      this.drawRoadSegment(road, pathLocations[index], pathLocations[index + 1], true);
    }

    for (const location of this.locations) {
      if (!location.branchOf) {
        continue;
      }

      const parent = this.locations.find((candidate) => candidate.id === location.branchOf);
      if (parent) {
        this.drawRoadSegment(road, parent, location, false);
      }
    }
  }

  private drawRoadSegment(graphics: Phaser.GameObjects.Graphics, from: GameLocation, to: GameLocation, main: boolean) {
    const shadowWidth = main ? 20 : 12;
    const roadWidth = main ? 10 : 6;
    const shadowColor = main ? 0x2a2117 : 0x1d1a16;
    const roadColor = main ? 0x7a6244 : 0x5a4d37;
    const highlightColor = main ? 0xb8a179 : 0x897256;

    graphics.lineStyle(shadowWidth, shadowColor, 0.94);
    graphics.lineBetween(from.worldX, from.worldY, to.worldX, to.worldY);
    graphics.lineStyle(roadWidth, roadColor, 1);
    graphics.lineBetween(from.worldX, from.worldY, to.worldX, to.worldY);
    graphics.lineStyle(main ? 6 : 4, highlightColor, 0.45);
    graphics.lineBetween(from.worldX, from.worldY, to.worldX, to.worldY);
  }

  private drawTownSquare() {
    const square = this.locations.find((location) => location.id === 'spawn-point');
    if (!square) {
      return;
    }

    const plaza = this.add.graphics().setDepth(1);
    plaza.fillStyle(0x3d4a36, 1);
    plaza.fillRoundedRect(square.worldX - 122, square.worldY - 118, 244, 236, 30);
    plaza.lineStyle(3, 0xc0b497, 0.32);
    plaza.strokeRoundedRect(square.worldX - 122, square.worldY - 118, 244, 236, 30);
    plaza.fillStyle(0x95a5b7, 0.86);
    plaza.fillCircle(square.worldX, square.worldY + 2, 22);
    plaza.fillStyle(0xd8c48d, 0.76);
    plaza.fillRect(square.worldX - 58, square.worldY - 6, 116, 12);
    plaza.fillRect(square.worldX - 6, square.worldY - 58, 12, 116);
    plaza.fillStyle(0x7b6748, 0.72);
    plaza.fillCircle(square.worldX - 58, square.worldY - 58, 8);
    plaza.fillCircle(square.worldX + 58, square.worldY - 58, 8);
    plaza.fillCircle(square.worldX - 58, square.worldY + 58, 8);
    plaza.fillCircle(square.worldX + 58, square.worldY + 58, 8);
  }

  private drawFogs() {
    this.add.ellipse(560, 420, 520, 220, 0x69a7ff, 0.045).setDepth(-8);
    this.add.ellipse(1720, 460, 620, 240, 0x7cf7d4, 0.035).setDepth(-8);
    this.add.ellipse(1520, 1120, 520, 220, 0xf6b74c, 0.032).setDepth(-8);
    this.add.ellipse(1080, 860, 420, 180, 0x9a7cff, 0.03).setDepth(-8);
  }

  private drawLanterns() {
    const lanternPositions = [
      [1130, 820],
      [1370, 820],
      [1120, 960],
      [1380, 960],
      [900, 620],
      [1660, 620],
      [860, 1260],
      [2050, 1260],
    ] as const;

    lanternPositions.forEach(([x, y], index) => {
      const lantern = this.add.container(x, y).setDepth(12 + index);
      lantern.add(this.add.rectangle(0, 8, 6, 18, 0x2e2419, 1));
      lantern.add(this.add.circle(0, -2, 7, index % 2 === 0 ? 0xf6b74c : 0x7cf7d4, 0.34));
      lantern.add(this.add.circle(0, -2, 3, 0xfff2cf, 0.82));
    });
  }

  private drawLocations() {
    for (const location of this.locations) {
      const container = this.add.container(location.worldX, location.worldY).setDepth(location.worldY);
      const visualScale = location.displayScale;
      const visuals = this.add.container(0, 0).setScale(visualScale);

      const halo = this.add.ellipse(
        0,
        18,
        location.footprintWidth * 1.12,
        location.footprintHeight * 0.42,
        location.accentColor,
        location.branchOf ? 0.08 : 0.12,
      );

      const body = this.createLocationBody(location);
      visuals.add([halo, body]);

      const label = this.add
        .text(location.labelOffsetX, location.labelOffsetY, location.displayName, {
          fontFamily: '"IBM Plex Sans", sans-serif',
          fontSize: location.branchOf ? '12px' : '14px',
          color: '#f2f6ff',
          align: 'center',
        })
        .setOrigin(0.5, 0)
        .setStroke('#08110a', 8)
        .setShadow(0, 0, '#08110a', 12, true, true);

      const subtitle = this.add
        .text(location.labelOffsetX, location.labelOffsetY + 20, location.subtitle, {
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '9px',
          color: '#9ab0c7',
          align: 'center',
        })
        .setOrigin(0.5, 0);

      container.add([visuals, label, subtitle]);

      const zone = this.add.zone(0, 0, location.footprintWidth, location.footprintHeight).setInteractive({
        useHandCursor: true,
      });
      zone.on('pointerdown', (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        this.openCheckpoint(location);
      });
      zone.on('pointerover', () => {
        this.tweens.add({
          targets: halo,
          alpha: location.branchOf ? 0.2 : 0.28,
          duration: 120,
        });
      });
      zone.on('pointerout', () => {
        this.tweens.add({
          targets: halo,
          alpha: location.branchOf ? 0.08 : 0.12,
          duration: 120,
        });
      });

      this.add.existing(zone);
      this.nodes.set(location.id, { location, halo, zone });

      this.tweens.add({
        targets: halo,
        scaleX: 1.04,
        scaleY: 1.04,
        alpha: location.branchOf ? 0.05 : 0.08,
        duration: 3000 + location.order * 30,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private createLocationBody(location: GameLocation) {
    const textureKey = `building-${location.kind}`;
    if (this.textures.exists(textureKey)) {
      return this.add.image(0, 0, textureKey).setDisplaySize(location.footprintWidth, location.footprintHeight);
    }

    const fallback = this.add.graphics();
    const w = location.footprintWidth;
    const h = location.footprintHeight;
    const light = location.baseColor;
    const roof = location.roofColor;
    const accent = location.accentColor;

    fallback.fillStyle(light, 1);
    fallback.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    fallback.lineStyle(3, roof, 0.8);
    fallback.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    fallback.fillStyle(accent, 0.6);
    fallback.fillCircle(0, 0, 14);

    return fallback;
  }
}
