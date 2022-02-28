import { Wall, Floor, SpikePit, Fountain } from "../../tile.js";
import { Bird, Snake, Tank, Eater, Jester, Turret } from "../../monster.js"
import { numTiles } from "../../constants.js";
import Utilities from '../../utilities.js';

export class DefaultLevel {
    constructor(levelNum) {
        this.levelNum = levelNum;
        this.width = numTiles;   // TODO: + Math.floor((numTiles / 100) * levelNum);
        this.height = numTiles;  // TODO: + Math.floor((numTiles / 100) * levelNum);
        this.tiles = [];
        this.monsters = [];
    }

    generate() {
        this.generateTiles();
        this.generateMonsters();
        this.placeBooks();
    }

    generateTiles() {
        for (let x = 0; x < this.width; x++) {
            this.tiles[x] = [];

            for (let y = 0; y < this.height; y++) {
                if (x == 0 || y == 0 || x == (this.width - 1) || y == (this.height - 1)) {
                    this.tiles[x][y] = new Wall(x, y);
                } else {
                    let ran = Math.random();
                    if (ran < 0.3) {
                        this.tiles[x][y] = new Wall(x, y);
                    } else {
                        if (ran < 0.02) {
                            this.tiles[x][y] = new SpikePit(x, y);
                        } else if (ran < 0.005) {
                            this.tiles[x][y] = new Fountain(x, y);
                        } else {
                            this.tiles[x][y] = new Floor(x, y);
                        }
                    }
                }
            }
        }
    }

    generateMonsters() {
        let numMonsters = Math.ceil(this.levelNum / 2) + 1;
        for (let i = 0; i < numMonsters; i++) {
            this.monsters.push(this.spawnMonster());
        }
    }

    spawnMonster() {
        let monsterType = Utilities.shuffle([Bird, Snake, Tank, Eater, Jester, Turret])[0];
        return new monsterType(this.randomPassableTile());
    }

    placeBooks() {
        var booksPlaced = 0
        while (booksPlaced < 3) {
            let t = this.randomPassableTile()
            if (t instanceof Floor) {
                booksPlaced++;
                t.book = true;
            }
        }
    }

    randomPassableTile() {
        let self = this;
        let tile;
        Utilities.tryTo('Get random passable tile', function () {
            let x = Utilities.randomRange(0, self.width - 1);
            let y = Utilities.randomRange(0, self.height - 1);
            tile = self.tiles[x][y];
            return tile.passable && !tile.monster;
        });
        return tile;
    }
}