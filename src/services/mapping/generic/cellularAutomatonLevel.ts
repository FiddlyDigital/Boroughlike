import { CaveFloorTile } from "../../../models/tiles/CaveFloorTile";
import { CaveWallTile } from "../../../models/tiles/CaveWallTile";
import { BaseLevel } from "./baseLevel";

export class CellularAutomationLevel extends BaseLevel {
    chanceToStartAlive: number;
    deathLimit: number;
    birthLimit: number;
    numberOfSteps: number;

    constructor(levelNum: number) {
        super(levelNum);
        this.chanceToStartAlive = 0.4;
        this.deathLimit = 3;
        this.birthLimit = 4;
        this.numberOfSteps = 8; // TODO: Randomise between 2 and 4
        this.generate();
    }

    generate(): void {
        this.generateTiles();
        super.populateMap();
    }

    generateTiles(): void {
        let maptiles = this.initialiseMap([[]]);

        for (let i = 0; i < this.numberOfSteps; i++) {
            maptiles = this.doSimulationStep(maptiles);
        }

        // Force the border solid, then keep only the largest connected cavern so the
        // up/down stairs (placed on random passable tiles) are always reachable.
        for (let x = 0; x < this.map.width; x++) {
            for (let y = 0; y < this.map.height; y++) {
                if (x === 0 || x === (this.map.width - 1) || y === 0 || y === (this.map.height - 1)) {
                    maptiles[x][y] = 1;
                }
            }
        }
        this.keepLargestRegion(maptiles);

        // Convert the "wall-or-not" grid into cave tiles.
        for (let x = 0; x < this.map.width; x++) {
            this.map.tiles[x] = [];
            for (let y = 0; y < this.map.height; y++) {
                if (maptiles[x][y] === 1) {
                    this.map.tiles[x][y] = new CaveWallTile(this.map, x, y);
                } else {
                    this.map.tiles[x][y] = new CaveFloorTile(this.map, x, y);
                }
            }
        }
    }

    // Flood-fill every open cell (0), find the largest connected region, and fill
    // every other open cell with wall (1) so the playable cavern is a single space.
    private keepLargestRegion(maptiles: Array<Array<number>>): void {
        const w = this.map.width, h = this.map.height;
        const region: Array<Array<number>> = [];
        for (let x = 0; x < w; x++) { region[x] = new Array(h).fill(-1); }

        let bestId = -1, bestSize = 0;
        let nextId = 0;
        for (let sx = 0; sx < w; sx++) {
            for (let sy = 0; sy < h; sy++) {
                if (maptiles[sx][sy] !== 0 || region[sx][sy] !== -1) {
                    continue;
                }
                // BFS this region
                const id = nextId++;
                const stack = [[sx, sy]];
                region[sx][sy] = id;
                let size = 0;
                while (stack.length) {
                    const [cx, cy] = stack.pop() as [number, number];
                    size++;
                    const nbrs = [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]];
                    for (const [nx, ny] of nbrs) {
                        if (nx >= 0 && ny >= 0 && nx < w && ny < h && maptiles[nx][ny] === 0 && region[nx][ny] === -1) {
                            region[nx][ny] = id;
                            stack.push([nx, ny]);
                        }
                    }
                }
                if (size > bestSize) { bestSize = size; bestId = id; }
            }
        }

        // Wall off every open cell that isn't part of the biggest cavern.
        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                if (maptiles[x][y] === 0 && region[x][y] !== bestId) {
                    maptiles[x][y] = 1;
                }
            }
        }
    }

    initialiseMap(map: Array<Array<number>>): Array<Array<number>> {
        for (let x = 0; x < this.map.width; x++) {
            map[x] = [];

            for (let y = 0; y < this.map.height; y++) {
                if (Math.random() < this.chanceToStartAlive) {
                    // We're using numbers, not booleans, to decide if something is solid here. 0 = not solid
                    map[x][y] = 1;
                } else {
                    map[x][y] = 0;
                }
            }
        }

        return map;
    }

    doSimulationStep(map: Array<Array<number>>): Array<Array<number>> {
        // Here's the new map we're going to copy our data into
        const newMap: Array<Array<number>> = [
            []
        ];

        for (let x = 0; x < map.length; x++) {
            newMap[x] = [];
            for (let y = 0; y < map[0].length; y++) {
                // Count up the neighbours
                const nbs = this.countAliveNeighbours(map, x, y);

                // If the tile is currently solid
                if (map[x][y] > 0) {
                    if (nbs < this.deathLimit) {
                        // See if it should die
                        newMap[x][y] = 0;
                    } else {
                        // Otherwise keep it solid
                        newMap[x][y] = 1;
                    }
                } else {
                    // If the tile is currently empty
                    // See if it should become solid
                    if (nbs > this.birthLimit) {
                        newMap[x][y] = 1;
                    } else {
                        newMap[x][y] = 0;
                    }
                }
            }
        }

        return newMap;
    }

    countAliveNeighbours(map: Array<Array<number>>, x: number, y: number): number {
        let count = 0;

        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                const nb_x = i + x;
                const nb_y = j + y;

                // if (i == 0 && j == 0) {

                // } else 
                if (nb_x < 0 || nb_y < 0 ||
                    nb_x >= map.length ||
                    nb_y >= map[0].length) {
                    count = count + 1;
                } else if (map[nb_x][nb_y] == 1) {
                    count = count + 1;
                }
            }
        }

        return count;
    }
}
