import Phaser from 'phaser';
import type { GameLocation, OdysseyNearestEventDetail } from './types';
import { GAME_WORLD } from './locationMapper';
import {
  BUSH_POSITIONS,
  FENCES,
  FLOWER_POSITIONS,
  NPC_MARKERS,
  PLAYER_SPAWN,
  ROCK_POSITIONS,
  SIGN_POSTS,
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
import { generateAllTextures, getBuildingTextureKey } from './spriteDefs';
import {
  createTileSurface,
  TILESET_GRASS_KEY,
  TILESET_GRASS_PATH,
  TILESET_GRASS_TERRAIN_SCALE,
  TILESET_GRASS_TILES,
  TILESET_GRASS_TILE_SIZE,
} from './tileAssets';

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
const LOCATION_LABEL_DEPTH = 100_000;

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
    this.load.image(TILESET_GRASS_KEY, TILESET_GRASS_PATH);
    generateAllTextures(this);
  }

  create() {
    this.locations = this.bootConfig.locations;

    this.cameras.main.setBackgroundColor('#4f8f49');
    this.cameras.main.setBounds(0, 0, GAME_WORLD.width, GAME_WORLD.height);
    this.physics.world.setBounds(0, 0, GAME_WORLD.width, GAME_WORLD.height);

    if (this.textures.exists(TILESET_GRASS_KEY)) {
      this.drawPrototypeTerrain();
    } else {
      console.error(`TilesetGrass texture "${TILESET_GRASS_KEY}" is missing. Falling back to generated terrain.`);
      this.drawFallbackTerrain();
    }

    this.drawPaths();

    this.drawFences();
    if (!this.textures.exists(TILESET_GRASS_KEY)) {
      this.drawFoliage();
      this.drawTownDetails();
    }
    this.drawTownSquare();
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
        emitEvent(ODYSSEY_EVENT_CLOSE);
      } else {
        const reachedDifferentLocation = Boolean(
          nearest &&
          nearest.location.id !== activeLocation.id &&
          nearest.distance <= nearest.location.interactionRadius,
        );
        if (reachedDifferentLocation && nearest) {
          this.activeProximityLocationId = nearest.location.id;
          this.player.setVelocity(0, 0);
          this.currentTarget = null;
          this.openCheckpoint(nearest.location);
          return;
        }

        const activeDistance = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          activeLocation.worldX,
          activeLocation.worldY,
        );
        if (activeDistance > activeLocation.interactionRadius + PROXIMITY_EXIT_BUFFER) {
          this.activeProximityLocationId = null;
          emitEvent(ODYSSEY_EVENT_CLOSE);
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

  private drawFallbackTerrain() {
    this.drawTileGround();
    this.drawDistricts();
  }

  private drawPrototypeTerrain() {
    const textureKey = 'tileset-grass-terrain';
    const painter = createTileSurface(this, textureKey, GAME_WORLD.width, GAME_WORLD.height);
    const tileStep = TILESET_GRASS_TILE_SIZE * TILESET_GRASS_TERRAIN_SCALE;
    const columns = Math.ceil(GAME_WORLD.width / tileStep);
    const rows = Math.ceil(GAME_WORLD.height / tileStep);

    painter.drawTileRect(
      TILESET_GRASS_TILES.grassBase,
      0,
      0,
      columns,
      rows,
      TILESET_GRASS_TERRAIN_SCALE,
    );

    for (let row = 0; row < rows; row += 5) {
      for (let column = 0; column < columns; column += 5) {
        const variantIndex = (column * 7 + row * 11) % TILESET_GRASS_TILES.grassVariants.length;
        const tileIndex = TILESET_GRASS_TILES.grassVariants[variantIndex];
        painter.drawTileCentered(
          tileIndex,
          column * tileStep + tileStep * 0.5 + (row % 2) * 4,
          row * tileStep + tileStep * 0.5 + (column % 2) * 4,
          TILESET_GRASS_TERRAIN_SCALE,
        );
      }
    }

    this.drawPrototypeFoliage(painter);
    this.drawPrototypeAccents(painter);

    painter.refresh();
    this.add.image(0, 0, textureKey).setOrigin(0).setDepth(-60);
  }

  private drawPrototypeFoliage(surface: ReturnType<typeof createTileSurface>) {
    const treeTiles = TILESET_GRASS_TILES.trees;
    const bushTiles = TILESET_GRASS_TILES.bushes;

    for (const [index, position] of TREE_POSITIONS.entries()) {
      if (!this.isDecorationClear(position, 48)) {
        continue;
      }

      const tileIndex = treeTiles[index % treeTiles.length];
      surface.drawTileCentered(
        tileIndex,
        position.x,
        position.y,
        TILESET_GRASS_TERRAIN_SCALE,
      );
    }

    for (const [index, position] of BUSH_POSITIONS.entries()) {
      if (!this.isDecorationClear(position, 24)) {
        continue;
      }

      const tileIndex = bushTiles[index % bushTiles.length];
      surface.drawTileCentered(
        tileIndex,
        position.x,
        position.y,
        TILESET_GRASS_TERRAIN_SCALE,
      );
    }
  }

  private drawPrototypeAccents(surface: ReturnType<typeof createTileSurface>) {
    for (const [index, position] of FLOWER_POSITIONS.entries()) {
      if (!this.isDecorationClear(position, 12)) {
        continue;
      }

      const tileIndex = TILESET_GRASS_TILES.flowers[index % TILESET_GRASS_TILES.flowers.length];
      surface.drawTileCentered(tileIndex, position.x, position.y, 1);
    }
  }

  private drawTileGround() {
    const ground = this.add.graphics().setDepth(-30);
    for (let y = 0; y < GAME_WORLD.height; y += TILE_SIZE) {
      for (let x = 0; x < GAME_WORLD.width; x += TILE_SIZE) {
        const variation = (x / TILE_SIZE + y / TILE_SIZE * 3) % 5;
        ground.fillStyle(variation === 0 ? 0x62a653 : 0x5a9b4e, 1);
        ground.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ground.fillStyle(0x8fc768, 0.28);
        ground.fillTriangle(x + 6, y + 13, x + 9, y + 6, x + 11, y + 13);
        ground.fillTriangle(x + 23, y + 26, x + 25, y + 20, x + 28, y + 26);
      }
    }

    this.add.tileSprite(0, 0, GAME_WORLD.width, GAME_WORLD.height, 'odyssey-noise').setOrigin(0).setAlpha(0.05).setDepth(-29);
  }

  private drawDistricts() {
    const districts = this.add.graphics().setDepth(-20);
    for (const district of TOWN_DISTRICTS) {
      districts.fillStyle(district.baseColor, 0.72);
      districts.fillRoundedRect(district.x, district.y, district.width, district.height, 36);
      districts.fillStyle(district.alternateColor, 0.2);
      districts.fillEllipse(
        district.x + district.width * 0.32,
        district.y + district.height * 0.38,
        district.width * 0.58,
        district.height * 0.46,
      );
      districts.lineStyle(2, district.borderColor, 0.24);
      districts.strokeRoundedRect(district.x, district.y, district.width, district.height, 36);
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
      this.drawPath(paths, points, route.width ?? 36);
    }
  }

  private drawPath(graphics: Phaser.GameObjects.Graphics, points: MapPoint[], width: number) {
    if (points.length < 2) {
      return;
    }

    this.strokePath(graphics, points, width + 8, 0x765332, 0.66);
    this.strokePath(graphics, points, width, 0xb58a50, 1);
    this.strokePath(graphics, points, 2, 0xe0bd7a, 0.34);
  }

  private strokePath(
    graphics: Phaser.GameObjects.Graphics,
    points: MapPoint[],
    width: number,
    color: number,
    alpha: number,
  ) {
    graphics.lineStyle(width, color, alpha);
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    for (const point of points.slice(1)) {
      graphics.lineTo(point.x, point.y);
    }
    graphics.strokePath();
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
        plaza.fillStyle(alternate ? 0xc8b98f : 0xb9aa82, 1);
        plaza.fillRect(startX + x, startY + y, TILE_SIZE, TILE_SIZE);
        plaza.lineStyle(1, 0xe1d5ae, 0.42);
        plaza.strokeRect(startX + x, startY + y, TILE_SIZE, TILE_SIZE);
      }
    }
    plaza.lineStyle(6, 0x806f51, 0.9);
    plaza.strokeRect(startX, startY, plazaSize, plazaSize);
    plaza.fillStyle(0x718985, 1);
    plaza.fillCircle(square.worldX, square.worldY, 30);
    plaza.fillStyle(0xcbd7c9, 0.9);
    plaza.fillCircle(square.worldX, square.worldY - 5, 18);
    plaza.fillStyle(0x607871, 1);
    plaza.fillRect(square.worldX - 5, square.worldY - 44, 10, 34);
  }

  private drawFoliage() {
    for (const position of TREE_POSITIONS) {
      if (!this.isDecorationClear(position, 44)) {
        continue;
      }

      const tree = this.add.container(position.x, position.y).setDepth(position.y);
      tree.add(this.add.ellipse(0, 22, 34, 10, 0x315b31, 0.3));
      tree.add(this.add.rectangle(0, 12, 10, 28, 0x704627, 1));
      tree.add(this.add.circle(-11, -8, 18, 0x2f753a, 1));
      tree.add(this.add.circle(11, -10, 20, 0x3c8943, 1));
      tree.add(this.add.circle(0, -25, 22, 0x4c9c4c, 1));
      tree.add(this.add.circle(-6, -30, 8, 0x77b85b, 0.9));
    }

    for (const position of BUSH_POSITIONS) {
      if (!this.isDecorationClear(position, 20)) {
        continue;
      }

      const bush = this.add.container(position.x, position.y).setDepth(position.y);
      bush.add(this.add.circle(-8, 0, 11, 0x377a3b, 1));
      bush.add(this.add.circle(7, -2, 13, 0x489347, 1));
      bush.add(this.add.circle(0, -8, 10, 0x65a953, 1));
    }
  }

  private drawFences() {
    const fences = this.add.graphics().setDepth(4);
    for (const fence of FENCES) {
      const horizontal = fence.orientation === 'horizontal';
      const endX = fence.x + (horizontal ? fence.length : 0);
      const endY = fence.y + (horizontal ? 0 : fence.length);
      fences.lineStyle(6, 0x5b3d24, 1);
      fences.lineBetween(fence.x, fence.y, endX, endY);
      fences.lineStyle(3, 0xa97843, 1);
      fences.lineBetween(fence.x, fence.y - 7, endX, endY - 7);

      for (let offset = 0; offset <= fence.length; offset += 28) {
        const x = fence.x + (horizontal ? offset : 0);
        const y = fence.y + (horizontal ? 0 : offset);
        fences.fillStyle(0x754c29, 1);
        fences.fillRect(x - 3, y - 13, 7, 26);
      }
    }
  }

  private drawTownDetails() {
    for (const [index, position] of ROCK_POSITIONS.entries()) {
      if (!this.isDecorationClear(position, 16)) {
        continue;
      }

      const rock = this.add.container(position.x, position.y).setDepth(position.y - 1);
      rock.add(this.add.ellipse(0, 8, 28, 9, 0x315b31, 0.24));
      rock.add(this.add.ellipse(0, 0, 24 + index % 3 * 3, 15, 0x777b6b, 1));
      rock.add(this.add.ellipse(-4, -3, 11, 5, 0xa8aa91, 0.72));
    }

    for (const [index, position] of FLOWER_POSITIONS.entries()) {
      if (!this.isDecorationClear(position, 8)) {
        continue;
      }

      const flowers = this.add.graphics().setDepth(position.y);
      const color = index % 3 === 0 ? 0xf4d15f : index % 3 === 1 ? 0xf29b7f : 0xece2c2;
      flowers.fillStyle(0x3c7d3d, 1);
      flowers.fillRect(position.x - 1, position.y, 2, 8);
      flowers.fillStyle(color, 1);
      flowers.fillCircle(position.x - 3, position.y, 3);
      flowers.fillCircle(position.x + 3, position.y, 3);
      flowers.fillCircle(position.x, position.y - 3, 3);
    }

    for (const sign of SIGN_POSTS) {
      const post = this.add.container(sign.x, sign.y).setDepth(sign.y);
      post.add(this.add.rectangle(0, 9, 5, 30, 0x63401f, 1));
      post.add(this.add.rectangle(0, -4, 70, 24, 0x9d6c36, 1).setStrokeStyle(2, 0x53351d));
      post.add(this.add.text(0, -4, sign.label, {
        fontFamily: '"IBM Plex Sans", sans-serif',
        fontSize: '8px',
        color: '#fff0c5',
        align: 'center',
      }).setOrigin(0.5));
    }
  }

  private isDecorationClear(position: MapPoint, margin: number) {
    return this.locations.every((location) => {
      const halfWidth = location.footprintWidth / 2 + margin;
      const halfHeight = location.footprintHeight / 2 + margin;
      const insideFootprint =
        Math.abs(position.x - location.worldX) < halfWidth &&
        Math.abs(position.y - location.worldY) < halfHeight;
      if (insideFootprint) {
        return false;
      }

      const labelY = location.worldY + Math.max(location.labelOffsetY, location.footprintHeight / 2 + 18);
      return !(
        Math.abs(position.x - (location.worldX + location.labelOffsetX)) < location.footprintWidth / 2 + 56 &&
        position.y > labelY - margin &&
        position.y < labelY + 54 + margin
      );
    });
  }

  private drawNpcMarkers() {
    for (const marker of NPC_MARKERS) {
      const npc = this.add.container(marker.x, marker.y).setDepth(marker.y);
      npc.add(this.add.ellipse(0, 16, 22, 8, 0x000000, 0.3));
      npc.add(this.add.circle(0, -11, 8, 0xd5b48a, 1));
      npc.add(this.add.rectangle(0, 4, 16, 24, 0x7b5737, 1));
      npc.add(this.add.rectangle(-5, 18, 5, 12, 0x3f3327, 1));
      npc.add(this.add.rectangle(5, 18, 5, 12, 0x3f3327, 1));
      const label = this.add
        .text(0, 34, `${marker.name}\n${marker.role}`, {
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '9px',
          color: '#fff0c5',
          align: 'center',
          backgroundColor: '#24351fcc',
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
      lantern.add(this.add.circle(0, -2, 7, index % 2 === 0 ? 0xf6b74c : 0xf0d47a, 0.34));
      lantern.add(this.add.circle(0, -2, 3, 0xfff2cf, 0.82));
    });
  }

  private drawLocations() {
    for (const location of this.locations) {
      const container = this.add.container(location.worldX, location.worldY).setDepth(location.worldY);
      const labelContainer = this.add
        .container(location.worldX, location.worldY)
        .setDepth(LOCATION_LABEL_DEPTH + location.order);
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
          color: '#fff7dc',
          align: 'center',
          backgroundColor: '#263b22dd',
          padding: { x: 6, y: 3 },
        })
        .setOrigin(0.5, 0)
        .setStroke('#263b22', 7)
        .setShadow(0, 2, '#172414', 8, true, true);

      const subtitle = this.add
        .text(location.labelOffsetX, labelY + 24, location.subtitle, {
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '9px',
          color: '#f0dfb4',
          align: 'center',
        })
        .setOrigin(0.5, 0);

      container.add(visuals);
      labelContainer.add([label, subtitle]);

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
    const textureKey = getBuildingTextureKey(location.id, location.kind);
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
