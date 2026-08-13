import { randomRange } from "../../../utilities";
import { Map } from "../../../models/maps/map";
import { ITile } from "../../../models/tiles/base/ITile";
import { FloorTile } from "../../../models/tiles/FloorTile";
import { CanyonWallTile } from "../../../models/tiles/CanyonWallTile";
import { CactusTile } from "../../../models/tiles/CactusTile";
import { OasisTile } from "../../../models/tiles/OasisTile";
import { BaseLevel } from "./baseLevel";

// The opening biome: a vast open desert of sand dotted with cactus and oasis,
// with a canyon region carved along one edge. The descent staircase (the "cave
// opening") is placed deep inside the canyon.
export class DesertLevel extends BaseLevel {
    private static readonly SIZE = 56;
    private canyonStartX = 0;
    private canyonFloors: Array<ITile> = [];

    constructor(levelNum: number) {
        super(levelNum);
        // A desert should feel vast, independent of the per-level size formula.
        this.map = new Map(DesertLevel.SIZE, DesertLevel.SIZE);
        this.generate();
    }

    private generate(): void {
        this.generateTiles();
        this.populateMap();
    }

    public generateTiles(): void {
        const size = this.map.width;
        this.canyonStartX = Math.floor(size * 0.6);
        this.canyonFloors = [];

        // Base terrain: open sand, canyon rock along the right edge, solid border.
        for (let x = 0; x < size; x++) {
            this.map.tiles[x] = [];
            for (let y = 0; y < size; y++) {
                if (x === 0 || y === 0 || x === size - 1 || y === size - 1) {
                    this.map.tiles[x][y] = new CanyonWallTile(this.map, x, y);
                } else if (x >= this.canyonStartX) {
                    this.map.tiles[x][y] = new CanyonWallTile(this.map, x, y);
                } else {
                    this.map.tiles[x][y] = new FloorTile(this.map, x, y);
                }
            }
        }

        this.carveCanyons(size);
        this.scatterDesertFeatures(size);
    }

    // Carve a handful of winding passages from the open desert into the canyon rock,
    // so the canyon is reachable and forms twisting corridors. Each step moves along
    // a single axis (never diagonally) so the path stays 4-connected and walkable.
    private carveCanyons(size: number): void {
        const numPaths = 4;
        const targetX = size - 3;
        for (let k = 0; k < numPaths; k++) {
            let cx = this.canyonStartX - 2;             // start in the open desert
            let cy = randomRange(3, size - 4);
            this.carveCanyonTile(cx, cy);
            let guard = 0;
            while (cx < targetX && guard++ < size * 4) {
                if (Math.random() < 0.62) {
                    cx += 1;                            // advance toward the canyon depths
                } else {
                    cy += (Math.random() < 0.5 ? -1 : 1);
                    cy = Math.max(2, Math.min(size - 3, cy));
                }
                this.carveCanyonTile(cx, cy);
                // occasional 2-wide stretch so canyons don't feel like thin tunnels
                if (Math.random() < 0.4) {
                    this.carveCanyonTile(cx, Math.min(size - 2, cy + 1));
                }
            }
        }
    }

    private carveCanyonTile(x: number, y: number): void {
        const floor = new FloorTile(this.map, x, y);
        this.map.tiles[x][y] = floor;
        if (x >= this.canyonStartX) {
            this.canyonFloors.push(floor);
        }
    }

    // Sprinkle cactus (hazard) and oasis ponds (decor) across the open desert only.
    private scatterDesertFeatures(size: number): void {
        for (let x = 1; x < this.canyonStartX; x++) {
            for (let y = 1; y < size - 1; y++) {
                if (this.map.tiles[x][y] instanceof FloorTile && Math.random() < 0.03) {
                    this.map.tiles[x][y] = new CactusTile(this.map, x, y);
                }
            }
        }

        const numPonds = randomRange(3, 5);
        for (let p = 0; p < numPonds; p++) {
            const ox = randomRange(3, this.canyonStartX - 3);
            const oy = randomRange(3, size - 4);
            const r = randomRange(1, 2);
            for (let x = ox - r; x <= ox + r; x++) {
                for (let y = oy - r; y <= oy + r; y++) {
                    if (x <= 0 || y <= 0 || x >= size - 1 || y >= size - 1) continue;
                    if ((x - ox) * (x - ox) + (y - oy) * (y - oy) > r * r + 1) continue;
                    if (this.map.tiles[x][y] instanceof FloorTile) {
                        this.map.tiles[x][y] = new OasisTile(this.map, x, y);
                    }
                }
            }
        }
    }

    // Put the descent deep in the canyon — the "opening that leads to a cave".
    protected placeStairsDown(): void {
        let target: ITile | null = null;
        let bestX = -1;
        for (const t of this.canyonFloors) {
            const current = this.map.getTile(t.x, t.y);
            if (current && current.passable && !current.monster && current.x > bestX) {
                bestX = current.x;
                target = current;
            }
        }
        this.map.setStairDownTile(target);
    }
}
