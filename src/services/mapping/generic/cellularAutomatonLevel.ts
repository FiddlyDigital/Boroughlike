import { FloorTile } from "../../../models/tiles/FloorTile";
import { WallTile } from "../../../models/tiles/WallTile";
import { DefaultLevel } from "./defaultLevel";

export class CellularAutomationLevel extends DefaultLevel {
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

        // at this stage we want to convert our "wall-or-not" map into a feature map.
        for (let x = 0; x < this.map.width; x++) {
            for (let y = 0; y < this.map.height; y++) {
                if (x == 0 || x == (this.map.width - 1) || y == 0 || y == (this.map.width - 1)) {
                    // All edges need to be a special type of wall
                    this.map.tiles[x][y] = new WallTile(this.map, x, y);
                } else if (maptiles[x][y] === 1) {
                    // every other 'alive' cell - becomes a normal wall.
                    this.map.tiles[x][y] = new WallTile(this.map, x, y);
                } else {
                    this.map.tiles[x][y] = new FloorTile(this.map, x, y);
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
