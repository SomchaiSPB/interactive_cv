import Phaser from 'phaser';

export const TILESET_GRASS_KEY = 'tileset-grass';
export const TILESET_GRASS_PATH = '/game/assets/TilesetGrass/overworld_tileset_grass.png';
export const TILESET_GRASS_TILE_SIZE = 16;
export const TILESET_GRASS_COLUMNS = 12;
export const TILESET_GRASS_TOTAL_TILES = 252;
export const TILESET_GRASS_TERRAIN_SCALE = 2;

export const TILESET_GRASS_TILES = {
  grassBase: 1,
  grassVariants: [0, 2, 3, 4, 13, 14, 24, 25, 26, 36, 37, 38] as const,
} as const;

export type TileObjectDefinition = {
  widthTiles: number;
  heightTiles: number;
  tiles: readonly (number | null)[];
};

export const TILESET_GRASS_OBJECTS = {
  // Stone courtyard with grass beds; the well sits on the centre tile.
  townSquarePlaza: {
    widthTiles: 3,
    heightTiles: 3,
    tiles: [21, 22, 23, 33, 34, 35, 45, 46, 47],
  },
  townSquareWell: {
    widthTiles: 1,
    heightTiles: 1,
    tiles: [197],
  },
  integrationMarketStalls: {
    widthTiles: 2,
    heightTiles: 2,
    tiles: [216, 217, 218, 219],
  },
  treeCluster: {
    widthTiles: 3,
    heightTiles: 5,
    tiles: [57, 58, 59, 69, 70, 71, 81, 82, 83, 93, 94, 95, 105, 106, 107],
  },
  bushCluster: {
    widthTiles: 2,
    heightTiles: 2,
    tiles: [104, 105, 106, 107],
  },
  // Walled fort only (columns 0-3); the cathedral to its right is guildHall.
  commandHallFort: {
    widthTiles: 4,
    heightTiles: 4,
    tiles: [
      144, 145, 146, 147,
      156, 157, 158, 159,
      168, 169, 170, 171,
      180, 181, 182, 183,
    ],
  },
  guildHall: {
    widthTiles: 3,
    heightTiles: 4,
    tiles: [
      148, 149, 150,
      160, 161, 162,
      172, 173, 174,
      184, 185, 186,
    ],
  },
  darkTower: {
    widthTiles: 2,
    heightTiles: 3,
    tiles: [163, 164, 175, 176, 187, 188],
  },
} as const;

export type TileArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TileSurface = {
  texture: Phaser.Textures.CanvasTexture;
  drawTile: (tileIndex: number, x: number, y: number, scale?: number) => void;
  drawTileCentered: (tileIndex: number, centerX: number, centerY: number, scale?: number) => void;
  drawTileRect: (tileIndex: number, x: number, y: number, widthTiles: number, heightTiles: number, scale?: number) => void;
  drawTilePattern: (tileIndexes: number[], area: TileArea, scale?: number) => void;
  refresh: () => void;
};

export function tileIndexToSourceRect(tileIndex: number) {
  if (!Number.isInteger(tileIndex) || tileIndex < 0 || tileIndex >= TILESET_GRASS_TOTAL_TILES) {
    throw new Error(`Invalid TilesetGrass tile index ${tileIndex}.`);
  }

  const column = tileIndex % TILESET_GRASS_COLUMNS;
  const row = Math.floor(tileIndex / TILESET_GRASS_COLUMNS);

  return {
    x: column * TILESET_GRASS_TILE_SIZE,
    y: row * TILESET_GRASS_TILE_SIZE,
    width: TILESET_GRASS_TILE_SIZE,
    height: TILESET_GRASS_TILE_SIZE,
  };
}

function getSourceImage(scene: Phaser.Scene): CanvasImageSource {
  const texture = scene.textures.get(TILESET_GRASS_KEY);
  const source = texture.getSourceImage();

  if (!source) {
    throw new Error(`Missing source image for texture "${TILESET_GRASS_KEY}".`);
  }

  return source as CanvasImageSource;
}

function paintTileObject(
  drawTile: (tileIndex: number, x: number, y: number, scale?: number) => void,
  objectDef: TileObjectDefinition,
  originX: number,
  originY: number,
  scale = 1,
) {
  const tileSize = TILESET_GRASS_TILE_SIZE * scale;

  for (let row = 0; row < objectDef.heightTiles; row += 1) {
    for (let column = 0; column < objectDef.widthTiles; column += 1) {
      const tileIndex = objectDef.tiles[row * objectDef.widthTiles + column];
      if (tileIndex === null || tileIndex === undefined) {
        continue;
      }

      drawTile(tileIndex, originX + column * tileSize, originY + row * tileSize, scale);
    }
  }
}

export function drawTileObject(
  surface: Pick<TileSurface, 'drawTile'>,
  objectDef: TileObjectDefinition,
  centerX: number,
  centerY: number,
  scale = 1,
) {
  const tileSize = TILESET_GRASS_TILE_SIZE * scale;
  const originX = centerX - (objectDef.widthTiles * tileSize) / 2;
  const originY = centerY - (objectDef.heightTiles * tileSize) / 2;
  paintTileObject(surface.drawTile, objectDef, originX, originY, scale);
}

export function createTileObjectTexture(
  scene: Phaser.Scene,
  textureKey: string,
  objectDef: TileObjectDefinition,
  scale = 1,
) {
  const width = Math.ceil(objectDef.widthTiles * TILESET_GRASS_TILE_SIZE * scale);
  const height = Math.ceil(objectDef.heightTiles * TILESET_GRASS_TILE_SIZE * scale);
  const canvasTexture = scene.textures.createCanvas(textureKey, width, height);
  const context = canvasTexture.getContext();

  if (!context) {
    throw new Error(`Unable to create canvas context for "${textureKey}".`);
  }

  context.imageSmoothingEnabled = false;
  const sourceImage = getSourceImage(scene);

  const drawTile = (tileIndex: number, x: number, y: number, tileScale = 1) => {
    const frame = tileIndexToSourceRect(tileIndex);
    const size = TILESET_GRASS_TILE_SIZE * tileScale;
    context.drawImage(sourceImage, frame.x, frame.y, frame.width, frame.height, Math.round(x), Math.round(y), size, size);
  };

  paintTileObject(drawTile, objectDef, 0, 0, scale);
  canvasTexture.refresh();

  return canvasTexture;
}

export function createTileSurface(scene: Phaser.Scene, textureKey: string, width: number, height: number): TileSurface {
  const canvasTexture = scene.textures.createCanvas(textureKey, width, height);
  const context = canvasTexture.getContext();

  if (!context) {
    throw new Error(`Unable to create canvas context for "${textureKey}".`);
  }

  context.imageSmoothingEnabled = false;
  const sourceImage = getSourceImage(scene);

  const drawTile = (tileIndex: number, x: number, y: number, scale = 1) => {
    const frame = tileIndexToSourceRect(tileIndex);
    const size = TILESET_GRASS_TILE_SIZE * scale;
    context.drawImage(sourceImage, frame.x, frame.y, frame.width, frame.height, Math.round(x), Math.round(y), size, size);
  };

  const drawTileCentered = (tileIndex: number, centerX: number, centerY: number, scale = 1) => {
    const size = TILESET_GRASS_TILE_SIZE * scale;
    drawTile(tileIndex, centerX - size / 2, centerY - size / 2, scale);
  };

  const drawTileRect = (tileIndex: number, x: number, y: number, widthTiles: number, heightTiles: number, scale = 1) => {
    const size = TILESET_GRASS_TILE_SIZE * scale;
    for (let row = 0; row < heightTiles; row += 1) {
      for (let column = 0; column < widthTiles; column += 1) {
        drawTile(tileIndex, x + column * size, y + row * size, scale);
      }
    }
  };

  const drawTilePattern = (tileIndexes: number[], area: TileArea, scale = 1) => {
    if (tileIndexes.length === 0) {
      return;
    }

    const tileSize = TILESET_GRASS_TILE_SIZE * scale;
    const widthTiles = Math.ceil(area.width / tileSize);
    const heightTiles = Math.ceil(area.height / tileSize);

    for (let row = 0; row < heightTiles; row += 1) {
      for (let column = 0; column < widthTiles; column += 1) {
        const pick = tileIndexes[(column * 17 + row * 31) % tileIndexes.length];
        drawTile(pick, area.x + column * tileSize, area.y + row * tileSize, scale);
      }
    }
  };

  return {
    texture: canvasTexture,
    drawTile,
    drawTileCentered,
    drawTileRect,
    drawTilePattern,
    refresh: () => canvasTexture.refresh(),
  };
}
