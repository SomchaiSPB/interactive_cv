import Phaser from 'phaser';
import type { GameLocation, OdysseyNearestEventDetail } from './types';
import { GAME_WORLD } from './locationMapper';
import {
  BUSH_POSITIONS,
  FENCES,
  NPC_MARKERS,
  PLAYER_SPAWN,
  TILE_SIZE,
  TOWN_DISTRICTS,
  TOWN_PATHS,
  TREE_POSITIONS,
  type MapPoint,
} from './townMap';
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

const PROXIMITY_EXIT_BUFFER = 36;

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
  private activeProximityLocationId: string | null = null;
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

    this.drawTileGround();
    this.drawDistricts();
    this.drawTownSquare();
    this.drawPaths();
    this.drawFences();
    this.drawFoliage();
    this.drawLocations();
    this.drawNpcMarkers();
    this.drawLanterns();

    this.player = this.physics.add.sprite(PLAYER_SPAWN.x, PLAYER_SPAWN.y, 'odyssey-hero');
    this.player.setDepth(PLAYER_SPAWN.y + 20);
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(0, 0);
    this.player.body.setSize(14, 10, true);
    this.player.body.setOffset(4, 30);
    this.playerShadow = this.add.ellipse(this.player.x, this.player.y + 20, 24, 8, 0x000000, 0.34).setDepth(999);

    this.currentTarget = new Phaser.Math.Vector2(this.player.x, this.player.y);

    this.keys = (this.input.keyboard?.addKeys('E,ESC') as KeyboardBundle | undefined) ?? {};
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
    this.player.setDepth(this.player.y + 20);
    this.playerShadow.setDepth(this.player.y + 19);

    const nearest = this.findNearestLocation(this.player.x, this.player.y);
    const interactable = Boolean(nearest && nearest.distance <= nearest.location.interactionRadius);
    if (nearest && (nearest.location.id !== this.nearestLocationId || interactable !== this.nearestInteractable)) {
      this.nearestLocationId = nearest.location.id;
      this.nearestInteractable = interactable;
      this.emitNearestState(nearest);
    } else if (!nearest && this.nearestLocationId !== null) {
      this.nearestLocationId = null;
      this.nearestInteractable = false;
      this.emitNearestState(null);
    }

    this.updateProximityInteraction(nearest);

    const interactKey = this.keys.E;
    if (interactKey && Phaser.Input.Keyboard.JustDown(interactKey)) {
      if (nearest && nearest.distance <= nearest.location.interactionRadius) {
        this.activeProximityLocationId = nearest.location.id;
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

  private updateProximityInteraction(nearest: { location: GameLocation; distance: number } | null) {
    if (this.activeProximityLocationId) {
      const activeLocation = this.locations.find((location) => location.id === this.activeProximityLocationId);
      if (!activeLocation) {
        this.activeProximityLocationId = null;
      } else {
        const activeDistance = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          activeLocation.worldX,
          activeLocation.worldY,
        );
        if (activeDistance > activeLocation.interactionRadius + PROXIMITY_EXIT_BUFFER) {
          this.activeProximityLocationId = null;
        }
      }
    }

    if (
      !this.activeProximityLocationId &&
      nearest &&
      nearest.distance <= nearest.location.interactionRadius
    ) {
      this.activeProximityLocationId = nearest.location.id;
      this.player.setVelocity(0, 0);
      this.currentTarget = null;
      this.openCheckpoint(nearest.location);
    }
  }

  private emitNearestState(nearest?: { location: GameLocation; distance: number } | null) {
    const selected = nearest ?? this.findNearestLocation(this.player.x, this.player.y);
    const interactable = Boolean(selected && selected.distance <= selected.location.interactionRadius);

    if (selected && interactable) {
      emitEvent<OdysseyNearestEventDetail>(ODYSSEY_EVENT_NEAREST, {
        location: selected.location,
        prompt: `${selected.location.displayName} reached. Checkpoint opened automatically.`,
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

  private drawTileGround() {
    const ground = this.add.graphics().setDepth(-30);
    for (let y = 0; y < GAME_WORLD.height; y += TILE_SIZE) {
      for (let x = 0; x < GAME_WORLD.width; x += TILE_SIZE) {
        const alternate = (x / TILE_SIZE + y / TILE_SIZE) % 2 === 0;
        ground.fillStyle(alternate ? 0x244a2a : 0x284f2e, 1);
        ground.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ground.fillStyle(0x42653c, 0.12);
        ground.fillRect(x + 5, y + 7, 3, 2);
        ground.fillRect(x + 22, y + 19, 2, 3);
      }
    }

    this.add.tileSprite(0, 0, GAME_WORLD.width, GAME_WORLD.height, 'odyssey-noise').setOrigin(0).setAlpha(0.08).setDepth(-29);
  }

  private drawDistricts() {
    const districts = this.add.graphics().setDepth(-20);
    for (const district of TOWN_DISTRICTS) {
      for (let y = district.y; y < district.y + district.height; y += TILE_SIZE) {
        for (let x = district.x; x < district.x + district.width; x += TILE_SIZE) {
          const alternate = (x / TILE_SIZE + y / TILE_SIZE) % 2 === 0;
          districts.fillStyle(alternate ? district.baseColor : district.alternateColor, 0.92);
          districts.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        }
      }
      districts.lineStyle(3, district.borderColor, 0.5);
      districts.strokeRect(district.x, district.y, district.width, district.height);
    }
  }

  private drawPaths() {
    const paths = this.add.graphics().setDepth(1);
    for (const route of TOWN_PATHS) {
      const from = this.locations.find((location) => location.id === route.from);
      const to = this.locations.find((location) => location.id === route.to);
      if (!from || !to) {
        continue;
      }

      const points: MapPoint[] = [
        { x: from.worldX, y: from.worldY },
        ...(route.via ?? []),
        { x: to.worldX, y: to.worldY },
      ];
      const width = route.width ?? 42;
      for (let index = 0; index < points.length - 1; index += 1) {
        this.drawOrthogonalPath(paths, points[index], points[index + 1], width);
      }
    }
  }

  private drawOrthogonalPath(graphics: Phaser.GameObjects.Graphics, from: MapPoint, to: MapPoint, width: number) {
    const corner = { x: to.x, y: from.y };
    this.drawPathSegment(graphics, from, corner, width);
    this.drawPathSegment(graphics, corner, to, width);
  }

  private drawPathSegment(graphics: Phaser.GameObjects.Graphics, from: MapPoint, to: MapPoint, width: number) {
    if (from.x === to.x && from.y === to.y) {
      return;
    }

    graphics.lineStyle(width + 10, 0x33271a, 0.72);
    graphics.lineBetween(from.x, from.y, to.x, to.y);
    graphics.lineStyle(width, 0x8b7047, 1);
    graphics.lineBetween(from.x, from.y, to.x, to.y);
    graphics.lineStyle(4, 0xc2a878, 0.32);
    graphics.lineBetween(from.x, from.y, to.x, to.y);
  }

  private drawTownSquare() {
    const square = this.locations.find((location) => location.id === 'spawn-point');
    if (!square) {
      return;
    }

    const plaza = this.add.graphics().setDepth(2);
    const plazaSize = 256;
    const startX = square.worldX - plazaSize / 2;
    const startY = square.worldY - plazaSize / 2;
    for (let y = 0; y < plazaSize; y += TILE_SIZE) {
      for (let x = 0; x < plazaSize; x += TILE_SIZE) {
        const alternate = (x / TILE_SIZE + y / TILE_SIZE) % 2 === 0;
        plaza.fillStyle(alternate ? 0x827d70 : 0x746f64, 1);
        plaza.fillRect(startX + x, startY + y, TILE_SIZE, TILE_SIZE);
        plaza.lineStyle(1, 0x9c9686, 0.2);
        plaza.strokeRect(startX + x, startY + y, TILE_SIZE, TILE_SIZE);
      }
    }
    plaza.lineStyle(6, 0x514b41, 0.9);
    plaza.strokeRect(startX, startY, plazaSize, plazaSize);
    plaza.fillStyle(0x5f6f78, 1);
    plaza.fillCircle(square.worldX, square.worldY, 30);
    plaza.fillStyle(0xb9c7cb, 0.9);
    plaza.fillCircle(square.worldX, square.worldY - 5, 18);
    plaza.fillStyle(0x6b7f88, 1);
    plaza.fillRect(square.worldX - 5, square.worldY - 44, 10, 34);
  }

  private drawFoliage() {
    for (const position of TREE_POSITIONS) {
      const tree = this.add.container(position.x, position.y).setDepth(position.y);
      tree.add(this.add.rectangle(0, 12, 10, 26, 0x4a321f, 1));
      tree.add(this.add.circle(-10, -8, 18, 0x214f2a, 1));
      tree.add(this.add.circle(10, -10, 20, 0x285d31, 1));
      tree.add(this.add.circle(0, -24, 21, 0x32703a, 1));
      tree.add(this.add.circle(-5, -28, 8, 0x4b874b, 0.78));
    }

    for (const position of BUSH_POSITIONS) {
      const bush = this.add.container(position.x, position.y).setDepth(position.y);
      bush.add(this.add.circle(-8, 0, 11, 0x285b31, 1));
      bush.add(this.add.circle(7, -2, 13, 0x34703b, 1));
      bush.add(this.add.circle(0, -8, 10, 0x438449, 1));
    }
  }

  private drawFences() {
    const fences = this.add.graphics().setDepth(4);
    for (const fence of FENCES) {
      const horizontal = fence.orientation === 'horizontal';
      const endX = fence.x + (horizontal ? fence.length : 0);
      const endY = fence.y + (horizontal ? 0 : fence.length);
      fences.lineStyle(6, 0x493522, 1);
      fences.lineBetween(fence.x, fence.y, endX, endY);
      fences.lineStyle(3, 0x8b6840, 1);
      fences.lineBetween(fence.x, fence.y - 7, endX, endY - 7);

      for (let offset = 0; offset <= fence.length; offset += 28) {
        const x = fence.x + (horizontal ? offset : 0);
        const y = fence.y + (horizontal ? 0 : offset);
        fences.fillStyle(0x5c4328, 1);
        fences.fillRect(x - 3, y - 13, 7, 26);
      }
    }
  }

  private drawNpcMarkers() {
    for (const marker of NPC_MARKERS) {
      const npc = this.add.container(marker.x, marker.y).setDepth(marker.y);
      npc.add(this.add.ellipse(0, 16, 22, 8, 0x000000, 0.3));
      npc.add(this.add.circle(0, -11, 8, 0xd5b48a, 1));
      npc.add(this.add.rectangle(0, 4, 16, 24, 0x6b4d7a, 1));
      npc.add(this.add.rectangle(-5, 18, 5, 12, 0x2b2634, 1));
      npc.add(this.add.rectangle(5, 18, 5, 12, 0x2b2634, 1));
      const label = this.add
        .text(0, 34, `${marker.name}\n${marker.role}`, {
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '9px',
          color: '#d7c8e3',
          align: 'center',
          backgroundColor: '#101016cc',
          padding: { x: 5, y: 3 },
        })
        .setOrigin(0.5, 0);
      npc.add(label);
    }
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
        (location.footprintWidth * 1.12) / visualScale,
        (location.footprintHeight * 0.42) / visualScale,
        location.accentColor,
        location.branchOf ? 0.08 : 0.12,
      );

      const body = location.kind === 'town_square'
        ? this.add.rectangle(0, 0, 1, 1, 0xffffff, 0)
        : this.createLocationBody(location);
      visuals.add([halo, body]);

      const labelY = Math.max(location.labelOffsetY, location.footprintHeight / 2 + 18);
      const label = this.add
        .text(location.labelOffsetX, labelY, location.displayName, {
          fontFamily: '"IBM Plex Sans", sans-serif',
          fontSize: location.branchOf ? '12px' : '14px',
          color: '#f2f6ff',
          align: 'center',
          backgroundColor: '#08110acc',
          padding: { x: 6, y: 3 },
        })
        .setOrigin(0.5, 0)
        .setStroke('#08110a', 8)
        .setShadow(0, 0, '#08110a', 12, true, true);

      const subtitle = this.add
        .text(location.labelOffsetX, labelY + 24, location.subtitle, {
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '9px',
          color: '#9ab0c7',
          align: 'center',
        })
        .setOrigin(0.5, 0);

      container.add([visuals, label, subtitle]);

      const zone = this.add.zone(location.worldX, location.worldY, location.footprintWidth, location.footprintHeight).setInteractive({
        useHandCursor: true,
      });
      zone.on('pointerdown', (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, location.worldX, location.worldY);
        if (distance <= location.interactionRadius) {
          this.activeProximityLocationId = location.id;
          this.openCheckpoint(location);
          return;
        }

        this.setMoveTarget(location.worldX, location.worldY);
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
      return this.add
        .image(0, 0, textureKey)
        .setDisplaySize(location.footprintWidth / location.displayScale, location.footprintHeight / location.displayScale);
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
