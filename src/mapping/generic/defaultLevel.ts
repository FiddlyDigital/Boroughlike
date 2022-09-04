import { Tile, Wall, Floor, SpikePit, Fountain } from "../../tile";
import { Monster, Bird, Snake, Tank, Eater, Jester, Turret } from "../../monster"
import { numTiles } from "../../constants";
import { tryTo, randomRange, shuffle } from "../../utilities";

export class DefaultLevel {
    levelNum: number;
    width: number;
    height: number;
    tiles: Array<Array<Tile>>;
    monsters: Array<Array<Monster>>;

    constructor(levelNum: number) {
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
        let monsterType = shuffle([Bird, Snake, Tank, Eater, Jester, Turret])[0];
        return new monsterType(this.randomPassableTile());
    }

    placeBooks() {
        var booksPlaced = 0
        while (booksPlaced < 3) {
            let t = this.randomPassableTile()
            if (t && t instanceof Floor) {
                booksPlaced++;
                t.book = true;
            }
        }
    }

    randomPassableTile() : Tile | undefined {
        let self = this;
        let tile;

        tryTo('Get random passable tile', function () {
            let x = randomRange(0, self.width - 1);
            let y = randomRange(0, self.height - 1);
            tile = self.tiles[x][y];
            return tile.passable && !tile.monster;
        });

        return tile;
    }
}