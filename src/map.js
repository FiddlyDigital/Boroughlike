import { numTiles, TILE_SPRITE_INDICES } from "./constants.js";
import { Bird, Snake, Tank, Eater, Jester, Turret } from "./monster.js";
import { Floor, Wall, SpikePit, Fountain } from "./tile.js";
import Utilities from "./utilities.js";

class Map {
    constructor() {
        if (!Map.instance) {
            this.props = {
                monsters: [],
                tiles: [], // floors: []
                level: 1,
            };

            Map.instance = this;
        }

        return Map.instance;
    }

    replaceTile(x, y, newTileType) {
        this.props.tiles[x][y] = new newTileType(x, y)
        return this.props.tiles[x][y]
    }

    tiles() {
        return this.props.tiles;
    }

    getMonsters() {
        return this.props.monsters;
    }

    generateLevel(lvl) {
        this.props.level = lvl;

        Utilities.tryTo('generate map', function () {
            return map.generateTiles() == map.randomPassableTile().getConnectedTiles().length;
        });

        this.generateMonsters();

        var booksPlaced = 0
        while (booksPlaced < 3) {
            let t = this.randomPassableTile()
            if (t instanceof Floor) {
                booksPlaced++;
                t.book = true;
            }
        }
    }

    generateTiles() {
        let passableTiles = 0;
        this.props.tiles = [];
        for (let i = 0; i < numTiles; i++) {
            this.props.tiles[i] = [];
            for (let j = 0; j < numTiles; j++) {
                if (i == 0 || j == 0 || i == (numTiles -1) || j == (numTiles -1)){
                    this.props.tiles[i][j] = new Wall(i, j);
                } else {                    
                    if (Math.random() < 0.3) {
                        this.props.tiles[i][j] = new Wall(i, j);
                    } else {
                        if (Math.random() < 0.02) {
                            this.props.tiles[i][j] = new SpikePit(i, j);
                        } else if (Math.random() < 0.005) {
                            this.props.tiles[i][j] = new Fountain(i, j);
                        } else {
                            this.props.tiles[i][j] = new Floor(i, j);
                        }

                        passableTiles++;
                    }
                }
            }
        }

        // Repass over, changing sprite depending on neighbours
        for (let y = 0; y < numTiles; y++) {
            for (let x = 0; x < numTiles; x++) {            
                let tile = this.props.tiles[x][y];

                // Below candidates for extraction/refactoring....
                if (tile instanceof Wall) {
                    let neighbours = tile.getAdjacentNeighbors();
                    if (neighbours && neighbours.length > 0) {
                        let newSpriteName = this.getSpriteVariationSuffixForTile(neighbours, Wall);
                        if (newSpriteName) {                            
                            tile.sprite = TILE_SPRITE_INDICES["Wall_" + newSpriteName];
                        }
                    }
                }
            }
        }

        return passableTiles;
    }

    getSpriteVariationSuffixForTile(neighbours, tileClass) {
        let suffix = "";

        if (neighbours[2] && (neighbours[2] instanceof tileClass)) {
            suffix += "L";
        }
        if (neighbours[3] && (neighbours[3] instanceof tileClass)) {
            suffix += "R";
        }
        if (neighbours[0] && (neighbours[0] instanceof tileClass)) {
            suffix += "T";
        }
        if (neighbours[1] && (neighbours[1] instanceof tileClass)) {
            suffix += "B";
        }

        return suffix;
    }

    inBounds(x, y) {
        return x >= 0 && y >= 0 && x < numTiles && y < numTiles;
    }

    getTile(x, y) {
        if (this.inBounds(x, y)) {
            return this.props.tiles[x][y];
        } else {
            return null;
        }
    }

    randomPassableTile() {
        let tile;
        Utilities.tryTo('get random passable tile', function () {
            let x = Utilities.randomRange(0, numTiles - 1);
            let y = Utilities.randomRange(0, numTiles - 1);
            tile = map.getTile(x, y);
            return tile && tile.passable && !tile.monster;
        });
        return tile;
    }

    generateMonsters() {
        this.props.monsters = [];
        let numMonsters = Math.ceil(this.props.level / 2) + 1;
        for (let i = 0; i < numMonsters; i++) {
            this.spawnMonster();
        }
    }

    spawnMonster() {
        let monsterType = Utilities.shuffle([Bird, Snake, Tank, Eater, Jester, Turret])[0];
        let monster = new monsterType(this.randomPassableTile());
        this.props.monsters.push(monster);
    }
}

const map = new Map();
Object.freeze(map);

export default map;