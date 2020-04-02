import {numTiles} from "./constants.js";
import {Bird, Snake, Tank, Eater, Jester, Turret} from "./monster.js";
import {Floor, Wall, SpikePit, Fountain, StairDown, StairUp} from "./tile.js";
import Utilities from "./utilities.js";

class Map {
    constructor() {
        if (!Map.instance) {
            this.props = {
                monsters : [],                
                tiles : [],
                level : 1,
            };

            Map.instance = this;
        }

        return Map.instance;
    }

    replaceTile(x,y, newTileType) {
        this.props.tiles[x][y] = new newTileType(x, y)
        return this.props.tiles[x][y]
    }

    tiles () {
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
        while(booksPlaced < 3) {        
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
                if (Math.random() < 0.3 || !this.inBounds(i, j)) {
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
        return passableTiles;
    }

    inBounds(x, y) {
        return x > 0 && y > 0 && x < numTiles - 1 && y < numTiles - 1;
    }

    getTile(x, y) {
        if (this.inBounds(x, y)) {
            return this.props.tiles[x][y];
        } else {
            return new Wall(x, y);
        }
    }

    randomPassableTile() {
        let tile;
        Utilities.tryTo('get random passable tile', function () {
            let x = Utilities.randomRange(0, numTiles - 1);
            let y = Utilities.randomRange(0, numTiles - 1);
            tile = map.getTile(x, y);
            return tile.passable && !tile.monster;
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