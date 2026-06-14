import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const sourceImagePath = path.join(repoRoot, 'public/game/assets/TilesetGrass/overworld_tileset_grass.png');
const outputImagePath = path.join(repoRoot, 'docs/assets/tilesetgrass-contact-sheet.png');

const TILE_SIZE = 16;
const SCALE = 4;
const COLUMNS = 12;
const ROWS = 21;
const CELL_SIZE = TILE_SIZE * SCALE;
const WIDTH = COLUMNS * CELL_SIZE;
const HEIGHT = ROWS * CELL_SIZE;

async function main() {
  await mkdir(path.dirname(outputImagePath), { recursive: true });

  const args = [
    sourceImagePath,
    '-filter',
    'point',
    '-resize',
    `${WIDTH}x${HEIGHT}!`,
    '-gravity',
    'northwest',
    '-font',
    'DejaVu-Sans-Mono',
    '-pointsize',
    '11',
    '-fill',
    'none',
    '-stroke',
    'rgba(255,255,255,0.25)',
    '-strokewidth',
    '1',
  ];

  for (let index = 0; index < COLUMNS * ROWS; index += 1) {
    const column = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);
    const x = column * CELL_SIZE;
    const y = row * CELL_SIZE;

    args.push(
      '-draw',
      `rectangle ${x},${y} ${x + CELL_SIZE},${y + CELL_SIZE}`,
    );
  }

  args.push(
    '-fill',
    'white',
    '-stroke',
    'black',
    '-strokewidth',
    '2',
  );

  for (let index = 0; index < COLUMNS * ROWS; index += 1) {
    const column = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);
    const x = column * CELL_SIZE;
    const y = row * CELL_SIZE;

    args.push('-draw', `text ${x + 4},${y + 12} "${index}"`);
  }

  args.push(outputImagePath);

  await execFileAsync('convert', args);
  console.log(`Wrote ${outputImagePath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
