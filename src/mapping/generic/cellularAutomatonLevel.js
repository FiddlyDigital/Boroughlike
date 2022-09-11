
import { Wall, Floor } from "../../tile.js";
import { DefaultLevel } from "./defaultLevel.js";

export class CellularAutomationLevel extends DefaultLevel {
    constructor(levelNum) {
        super(levelNum);
        this.chanceToStartAlive = 0.4;
        this.deathLimit = 3;
        this.birthLimit = 4;
        this.numberOfSteps = 8; // TODO: Randomise between 2 and 4
    }

    generate() {
        this.generateTiles();
        super.generateMonsters();
        super.placeBooks();
    }

    generateTiles() {
        this.tiles = this.initialiseMap([[]]);

        for (var i = 0; i < this.numberOfSteps; i++) {
            this.tiles = this.doSimulationStep(this.tiles);
        }

        // at this stage we want to convert our "wall-or-not" map into a feature map.
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                if (x == 0 || x == (this.width - 1) || y == 0 || y == (this.width - 1)) {
                    // All edges need to be a special type of wall
                    this.tiles[x][y] = new Wall(x, y);
                } else if (this.tiles[x][y] === 1) {
                    // every other 'alive' cell - becomes a normal wall.
                    this.tiles[x][y] = new Wall(x, y);
                } else {
                    this.tiles[x][y] = new Floor(x, y);
                }
            }
        }
    }

    initialiseMap(map) {
        for (var x = 0; x < this.width; x++) {
            map[x] = [];

            for (var y = 0; y < this.height; y++) {
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

    doSimulationStep(map) {
        // Here's the new map we're going to copy our data into
        var newmap = [
            []
        ];

        for (var x = 0; x < map.length; x++) {
            newmap[x] = [];
            for (var y = 0; y < map[0].length; y++) {
                // Count up the neighbours
                var nbs = this.countAliveNeighbours(map, x, y);

                // If the tile is currently solid
                if (map[x][y] > 0) {
                    if (nbs < this.deathLimit) {
                        // See if it should die
                        newmap[x][y] = 0;
                    } else {
                        // Otherwise keep it solid
                        newmap[x][y] = 1;
                    }
                } else {
                    // If the tile is currently empty
                    // See if it should become solid
                    if (nbs > this.birthLimit) {
                        newmap[x][y] = 1;
                    } else {
                        newmap[x][y] = 0;
                    }
                }
            }
        }

        return newmap;
    }

    countAliveNeighbours(map, x, y) {
        var count = 0;

        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                var nb_x = i + x;
                var nb_y = j + y;

                if (i == 0 && j == 0) {

                } else if (nb_x < 0 || nb_y < 0 ||
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