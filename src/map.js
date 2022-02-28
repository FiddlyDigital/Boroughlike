import { numTiles, TILE_SPRITE_INDICES } from "./constants.js";
import { Bird, Snake, Tank, Eater, Jester, Turret } from "./monster.js"
import { Wall } from "./tile.js";
import { LevelGenerator, Branches } from './mapping/levelGenerator.js'
import Utilities from "./utilities.js";

class Map {
    constructor() {
        if (!Map.instance) {
            this.levelGenerator = new LevelGenerator();
            this.props = {
                monsters: [],
                tiles: [], // floors: []
                levelNum: 1,
                height: numTiles,
                width: numTiles,
                branch: Branches.LIBRARY
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

    generateLevel(newLevelNum) {
        this.props.levelNum = newLevelNum;

        let level = this.levelGenerator.generateLevel(this.props.levelNum, this.props.branch);

        this.props.height = level.height;
        this.props.width = level.width;
        this.props.tiles = level.tiles;
        this.props.monsters = level.monsters;

        this.overrideSprites();
    }

    overrideSprites() {
        // Repass over the map, changing map sprites depending on neighbours (if required)
        for (let y = 0; y < this.props.height; y++) {
            for (let x = 0; x < this.props.width; x++) {
                let tile = this.props.tiles[x][y];

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
        return (x >= 0) && (y >= 0) && (x < this.props.width) && (y < this.props.height);
    }

    getTile(x, y) {
        if (this.inBounds(x, y)) {
            return this.props.tiles[x][y];
        } else {
            return null;
        }
    }

    randomPassableTile() {
        let self = this;
        let tile;
        Utilities.tryTo('get random passable tile', function () {
            let x = Utilities.randomRange(0, self.props.width - 1);
            let y = Utilities.randomRange(0, self.props.height - 1);
            tile = map.getTile(x, y);
            return tile && tile.passable && !tile.monster;
        });
        return tile;
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