import { Tile, WallTile, FloorTile, SpikePitTile, FountainTile } from "../../tile";
import { BaseActor, BirdActor, SnakeActor, TankActor, EaterActor, JesterActor, TurretActor } from "../../actor"
import { numTiles } from "../../constants";
import { tryTo, randomRange, shuffle } from "../../utilities";

export interface ILevelGenerator {
    generate(): void;
    generateTiles(): void;
}

export class DefaultLevel implements ILevelGenerator {
    levelNum: number;
    width: number;
    height: number;
    tiles: Array<Array<Tile>>;
    monsters: Array<Array<BaseActor>>;

    public constructor(levelNum: number) {
        this.levelNum = levelNum;
        this.width = numTiles;   // TODO: + Math.floor((numTiles / 100) * levelNum);
        this.height = numTiles;  // TODO: + Math.floor((numTiles / 100) * levelNum);
        this.tiles = [];
        this.monsters = [];
    }

    public generate(): void {
        this.generateTiles();
        this.generateMonsters();
        this.placeBooks();
    }

    public generateTiles(): void {
        for (let x = 0; x < this.width; x++) {
            this.tiles[x] = [];

            for (let y = 0; y < this.height; y++) {
                if (x == 0 || y == 0 || x == (this.width - 1) || y == (this.height - 1)) {
                    this.tiles[x][y] = new WallTile(x, y);
                } else {
                    let ran = Math.random();
                    if (ran < 0.3) {
                        this.tiles[x][y] = new WallTile(x, y);
                    } else {
                        if (ran < 0.02) {
                            this.tiles[x][y] = new SpikePitTile(x, y);
                        } else if (ran < 0.005) {
                            this.tiles[x][y] = new FountainTile(x, y);
                        } else {
                            this.tiles[x][y] = new FloorTile(x, y);
                        }
                    }
                }
            }
        }
    }

    protected generateMonsters() {
        let numMonsters = Math.ceil(this.levelNum / 2) + 1;
        for (let i = 0; i < numMonsters; i++) {
            this.monsters.push(this.spawnMonster());
        }
    }

    private spawnMonster() {
        let monsterType = shuffle([BirdActor, SnakeActor, TankActor, EaterActor, JesterActor, TurretActor])[0];
        return new monsterType(this.randomPassableTile());
    }

    protected placeBooks() {
        var booksPlaced = 0
        while (booksPlaced < 3) {
            let t = this.randomPassableTile()
            if (t && t instanceof FloorTile) {
                booksPlaced++;
                t.book = true;
            }
        }
    }

    private randomPassableTile(): Tile | null {
        let self = this;
        let tile = null;

        tryTo('Get random passable tile', function () {
            let x = randomRange(0, self.width - 1);
            let y = randomRange(0, self.height - 1);
            tile = self.tiles[x][y];
            return tile.passable && !tile.monster;
        });

        return tile;
    }
}