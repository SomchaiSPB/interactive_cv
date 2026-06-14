import Phaser from 'phaser';
import type { GameLocation, OdysseyNearestEventDetail } from './types';
import { GAME_WORLD } from './locationMapper';
import {
  BUSH_POSITIONS,
  FLOWER_POSITIONS,
  NPC_MARKERS,
  PLAYER_SPAWN,
  ROCK_POSITIONS,
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
  ADVENTURER_IDLE_DEFAULT_KEY,
  ADVENTURER_STABLE_FRAME_INDEX,
  ADVENTURER_TEXTURE_BY_FACING,
  hasAdventurerSprites,
  preloadAdventurerSprites,
  type AdventurerFacing,
} from './adventurerAssets';
import {
  createTileSurface,
  createTileObjectTexture,
  drawTileObject,
  TILESET_GRASS_KEY,
  TILESET_GRASS_OBJECTS,
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

type RoadSegment = {
  start: MapPoint;
  end: MapPoint;
  clearance: number;
};

const PROXIMITY_EXIT_BUFFER = 36;
const LOCATION_LABEL_DEPTH = 100_000;
const LABEL_BACKGROUND_COLOR = 0x26301c;
const LABEL_BORDER_COLOR = 0xd8b36a;
const LABEL_HOVER_BORDER_COLOR = 0xffd166;
const LABEL_TITLE_COLOR = '#fff2b8';
const LABEL_SUBTITLE_COLOR = '#d7c98d';
const ADVENTURER_SHADOW_OFFSET_X = 4;
const ADVENTURER_SHADOW_OFFSET_Y = -6;
const ADVENTURER_SHADOW_WIDTH = 18;
const ADVENTURER_SHADOW_HEIGHT = 6;
const DEBUG_PLAYER_VISUALS = false;

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
  private roadSegments: RoadSegment[] = [];
  private heroFacing: AdventurerFacing = 'down';
  private usesAdventurerSprite = false;
  private heroTextureKey = ADVENTURER_IDLE_DEFAULT_KEY;

  constructor(config: BootConfig) {
    super('BackendOdysseyScene');
    this.bootConfig = config;
  }

  preload() {
    preloadAdventurerSprites(this);
    this.load.image(TILESET_GRASS_KEY, TILESET_GRASS_PATH);
    generateAllTextures(this);
  }

  create() {
    this.locations = this.bootConfig.locations;
    this.roadSegments = this.buildRoadSegments();

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

    if (!this.textures.exists(TILESET_GRASS_KEY)) {
      this.drawFoliage();
      this.drawTownDetails();
    }
    this.drawTownSquare();
    this.drawLocations();
    this.drawNpcMarkers();
    this.drawLanterns();

    this.usesAdventurerSprite = hasAdventurerSprites(this);
    if (this.usesAdventurerSprite) {
      this.player = this.physics.add.sprite(PLAYER_SPAWN.x, PLAYER_SPAWN.y, ADVENTURER_IDLE_DEFAULT_KEY);
      this.player.setOrigin(0.5, 1);
      // The Adventurer strips are 64x80, and frame 3 is a centered stable pose in the source pack.
      // Slightly increasing the scale keeps the player readable without changing the map layout.
      this.player.setScale(0.88);
      this.player.body.setSize(18, 20, true);
      this.player.body.setOffset(23, 40);
      this.player.setFrame(ADVENTURER_STABLE_FRAME_INDEX);
    } else {
      console.warn('[BackendOdysseyScene] Adventurer sprite assets are unavailable; using the generated hero fallback.');
      this.player = this.physics.add.sprite(PLAYER_SPAWN.x, PLAYER_SPAWN.y, 'odyssey-hero');
      this.player.body.setSize(14, 10, true);
      this.player.body.setOffset(4, 30);
    }
    this.player.setDepth(PLAYER_SPAWN.y);
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(0, 0);
    // The Adventurer uses a bottom-centered origin, so the contact shadow is nudged a few pixels right/up to sit under the feet.
    this.playerShadow = this.add
      .ellipse(
        this.player.x + ADVENTURER_SHADOW_OFFSET_X,
        this.player.y + ADVENTURER_SHADOW_OFFSET_Y,
        ADVENTURER_SHADOW_WIDTH,
        ADVENTURER_SHADOW_HEIGHT,
        0x000000,
        0.34,
      )
      .setDepth(PLAYER_SPAWN.y - 1);

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
        this.updateHeroFacing(dx, dy);

        if (distance < step) {
          this.player.setPosition(target.x, target.y);
          this.player.setVelocity(0, 0);
          this.currentTarget = null;
        }
      }
    } else {
      this.player.setVelocity(0, 0);
    }

    this.player.setPosition(Math.round(this.player.x), Math.round(this.player.y));
    this.playerShadow.setPosition(
      this.player.x + ADVENTURER_SHADOW_OFFSET_X,
      this.player.y + ADVENTURER_SHADOW_OFFSET_Y,
    );
    this.player.setDepth(this.player.y);
    this.playerShadow.setDepth(this.player.y - 1);

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

  private updateHeroFacing(velocityX: number, velocityY: number) {
    const absX = Math.abs(velocityX);
    const absY = Math.abs(velocityY);
    const axisBias = 1.25;

    if (absX >= absY * axisBias) {
      this.heroFacing = velocityX >= 0 ? 'right' : 'left';
    } else if (absY >= absX * axisBias) {
      this.heroFacing = velocityY >= 0 ? 'down' : 'up';
    }
    this.applyHeroFacingTexture();
  }

  private applyHeroFacingTexture() {
    if (!this.usesAdventurerSprite) {
      return;
    }

    const nextTextureKey = ADVENTURER_TEXTURE_BY_FACING[this.heroFacing];
    if (this.heroTextureKey === nextTextureKey) {
      return;
    }

    this.heroTextureKey = nextTextureKey;
    this.player.setTexture(nextTextureKey);
    this.player.setFrame(ADVENTURER_STABLE_FRAME_INDEX);
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

    this.drawPrototypePlaza(painter);
    this.drawPrototypeFoliage(painter);

    painter.refresh();
    this.add.image(0, 0, textureKey).setOrigin(0).setDepth(-60);
  }

  private drawPrototypePlaza(surface: ReturnType<typeof createTileSurface>) {
    const square = this.locations.find((location) => location.id === 'spawn-point');
    if (!square) {
      return;
    }

    drawTileObject(
      surface,
      TILESET_GRASS_OBJECTS.townSquarePlaza,
      square.worldX,
      square.worldY,
      4,
    );
  }

  private getMapSubtitle(location: GameLocation) {
    if (location.branchOf) {
      return null;
    }

    const compact = location.subtitle
      .split('/')
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 2)
      .join(' / ');

    if (!compact) {
      return null;
    }

    return compact.length > 26 ? `${compact.slice(0, 23).trimEnd()}…` : compact;
  }

  private drawPrototypeFoliage(surface: ReturnType<typeof createTileSurface>) {
    const treePositions = TREE_POSITIONS.filter((_, index) => index % 3 === 0);
    const bushPositions = BUSH_POSITIONS.filter((_, index) => index % 2 === 0);
    const centerTrees: MapPoint[] = [
      { x: 680, y: 520 },
      { x: 1540, y: 180 },
      { x: 2140, y: 320 },
    ];

    for (const position of treePositions) {
      if (!this.isDecorationClear(position, 96)) {
        continue;
      }

      drawTileObject(surface, TILESET_GRASS_OBJECTS.treeCluster, position.x, position.y, TILESET_GRASS_TERRAIN_SCALE);
    }

    for (const position of bushPositions) {
      if (!this.isDecorationClear(position, 48)) {
        continue;
      }

      drawTileObject(surface, TILESET_GRASS_OBJECTS.bushCluster, position.x, position.y, TILESET_GRASS_TERRAIN_SCALE);
    }

    for (const position of centerTrees) {
      if (!this.isDecorationClear(position, 96)) {
        continue;
      }

      drawTileObject(surface, TILESET_GRASS_OBJECTS.treeCluster, position.x, position.y, TILESET_GRASS_TERRAIN_SCALE);
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
  }

  private isDecorationClear(position: MapPoint, margin: number) {
    if (!this.isClearOfRoads(position, margin)) {
      return false;
    }

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

  private buildRoadSegments() {
    const segments: RoadSegment[] = [];

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
      const clearance = (route.width ?? 36) / 2 + 24;

      for (let index = 0; index < points.length - 1; index += 1) {
        segments.push({
          start: points[index],
          end: points[index + 1],
          clearance,
        });
      }
    }

    return segments;
  }

  private isClearOfRoads(position: MapPoint, margin: number) {
    return this.roadSegments.every((segment) => {
      const distance = this.distanceToSegment(position, segment.start, segment.end);
      return distance > segment.clearance + margin;
    });
  }

  private distanceToSegment(point: MapPoint, start: MapPoint, end: MapPoint) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    if (dx === 0 && dy === 0) {
      return Phaser.Math.Distance.Between(point.x, point.y, start.x, start.y);
    }

    const t = Phaser.Math.Clamp(
      ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy),
      0,
      1,
    );
    const projectionX = start.x + t * dx;
    const projectionY = start.y + t * dy;
    return Phaser.Math.Distance.Between(point.x, point.y, projectionX, projectionY);
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
      [1044, 770],
      [1356, 770],
      [1044, 940],
      [1356, 940],
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

      const body = location.kind === 'town_square'
        ? this.add.rectangle(0, 0, 1, 1, 0xffffff, 0)
        : this.createLocationBody(location);
      const halo = DEBUG_PLAYER_VISUALS
        ? this.add.ellipse(
            0,
            18,
            (location.footprintWidth * 1.12) / visualScale,
            (location.footprintHeight * 0.42) / visualScale,
            location.accentColor,
            location.branchOf ? 0.08 : 0.12,
          )
        : null;

      if (halo) {
        visuals.add(halo);
      }
      visuals.add(body);

      container.add(visuals);
      const mapSubtitle = this.getMapSubtitle(location);
      const labelY = Math.max(location.labelOffsetY, location.footprintHeight / 2 + 18);
      const labelWidth = mapSubtitle ? 200 : 150;
      const labelHeight = mapSubtitle ? 40 : 24;
      const labelBackground = this.add.graphics();
      labelBackground.fillStyle(LABEL_BACKGROUND_COLOR, 0.88);
      labelBackground.fillRoundedRect(-labelWidth / 2, -labelHeight / 2, labelWidth, labelHeight, 8);
      labelBackground.lineStyle(1, LABEL_BORDER_COLOR, 0.85);
      labelBackground.strokeRoundedRect(-labelWidth / 2, -labelHeight / 2, labelWidth, labelHeight, 8);

      const labelTitle = this.add
        .text(0, mapSubtitle ? -10 : -5, location.displayName, {
          fontFamily: '"IBM Plex Sans", sans-serif',
          fontSize: location.branchOf ? '11px' : '12px',
          color: LABEL_TITLE_COLOR,
          align: 'center',
        })
        .setOrigin(0.5, 0.5)
        .setStroke('#263b22', 4)
        .setShadow(0, 1, '#172414', 4, true, true);

      const labelSubtitle = this.add
        .text(0, 9, mapSubtitle ?? '', {
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '8px',
          color: LABEL_SUBTITLE_COLOR,
          align: 'center',
        })
        .setOrigin(0.5, 0.5)
        .setVisible(Boolean(mapSubtitle));

      labelContainer.setPosition(location.worldX + location.labelOffsetX, location.worldY + labelY);
      labelContainer.add([labelBackground, labelTitle, labelSubtitle]);

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
        labelBackground.clear();
        labelBackground.fillStyle(LABEL_BACKGROUND_COLOR, 0.92);
        labelBackground.fillRoundedRect(-labelWidth / 2, -labelHeight / 2, labelWidth, labelHeight, 8);
        labelBackground.lineStyle(1, LABEL_HOVER_BORDER_COLOR, 0.95);
        labelBackground.strokeRoundedRect(-labelWidth / 2, -labelHeight / 2, labelWidth, labelHeight, 8);
        if (halo) {
          this.tweens.add({
            targets: halo,
            alpha: location.branchOf ? 0.2 : 0.28,
            duration: 120,
          });
        }
      });
      zone.on('pointerout', () => {
        labelBackground.clear();
        labelBackground.fillStyle(LABEL_BACKGROUND_COLOR, 0.88);
        labelBackground.fillRoundedRect(-labelWidth / 2, -labelHeight / 2, labelWidth, labelHeight, 8);
        labelBackground.lineStyle(1, LABEL_BORDER_COLOR, 0.85);
        labelBackground.strokeRoundedRect(-labelWidth / 2, -labelHeight / 2, labelWidth, labelHeight, 8);
        if (halo) {
          this.tweens.add({
            targets: halo,
            alpha: location.branchOf ? 0.08 : 0.12,
            duration: 120,
          });
        }
      });

      this.nodes.set(location.id, { location, halo, zone });

      if (halo) {
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
  }

  private createLocationBody(location: GameLocation) {
    if (location.id === 'legacy-forest') {
      const textureKey = 'tileset-grass-old-library';
      if (!this.textures.exists(textureKey)) {
        createTileObjectTexture(this, textureKey, TILESET_GRASS_OBJECTS.oldLibraryCompound, TILESET_GRASS_TERRAIN_SCALE);
      }

      return this.add
        .image(0, 0, textureKey)
        .setDisplaySize(location.footprintWidth / location.displayScale, location.footprintHeight / location.displayScale);
    }

    if (location.id === 'integration-swamp') {
      const textureKey = 'tileset-grass-integration-market';
      if (!this.textures.exists(textureKey)) {
        createTileObjectTexture(this, textureKey, TILESET_GRASS_OBJECTS.integrationMarketStalls, TILESET_GRASS_TERRAIN_SCALE);
      }

      return this.add
        .image(0, 0, textureKey)
        .setDisplaySize(location.footprintWidth / location.displayScale, location.footprintHeight / location.displayScale);
    }

    if (location.id === 'leadership-tower') {
      const textureKey = 'tileset-grass-command-hall';
      if (!this.textures.exists(textureKey)) {
        createTileObjectTexture(this, textureKey, TILESET_GRASS_OBJECTS.commandHallFort, TILESET_GRASS_TERRAIN_SCALE);
      }

      return this.add
        .image(0, 0, textureKey)
        .setDisplaySize(location.footprintWidth / location.displayScale, location.footprintHeight / location.displayScale);
    }

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
