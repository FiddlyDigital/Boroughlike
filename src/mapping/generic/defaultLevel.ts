import { Tile, WallTile, FloorTile, SpikePitTile, FountainTile } from "../../tile";
import { IActor, BirdActor, SnakeActor, TankActor, EaterActor, JesterActor, TurretActor } from "../../actor"
import { numTiles } from "../../constants";
import { tryTo, randomRange, shuffle } from "../../utilities";
import { IMap, Map } from '../../map';

export interface ILevelGenerator {
    generate(): void;
    generateTiles(): void;
}

export class DefaultLevel implements ILevelGenerator {
    levelNum: number;
    map: Map;

    public constructor(levelNum: number) {
        this.levelNum = levelNum;        
        this.map = new Map(numTiles, numTiles); // TODO: width/height = + Math.floor((numTiles / 100) * levelNum);
    }

    public generate(): void {
        this.generateTiles();
        this.generateMonsters();
        this.placeBooks();
    }

    public generateTiles(): void {
        for (let x = 0; x < this.map.width; x++) {
            this.map.tiles[x] = [];

            for (let y = 0; y < this.map.height; y++) {
                if (x == 0 || y == 0 || x == (this.map.width - 1) || y == (this.map.height - 1)) {
                    this.map.tiles[x][y] = new WallTile(this.map, x, y);
                } else {
                    let ran = Math.random();
                    if (ran < 0.3) {
                        this.map.tiles[x][y] = new WallTile(this.map, x, y);
                    } else {
                        if (ran < 0.02) {
                            this.map.tiles[x][y] = new SpikePitTile(this.map, x, y);
                        } else if (ran < 0.005) {
                            this.map.tiles[x][y] = new FountainTile(this.map, x, y);
                        } else {
                            this.map.tiles[x][y] = new FloorTile(this.map, x, y);
                        }
                    }
                }
            }
        }
    }

    protected generateMonsters() {
        let numMonsters = Math.ceil(this.levelNum / 2) + 1;
        for (let i = 0; i < numMonsters; i++) {
            this.map.monsters.push(this.spawnMonster());
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
            let x = randomRange(0, self.map.width - 1);
            let y = randomRange(0, self.map.height - 1);
            tile = self.map.tiles[x][y];
            return tile && tile.passable && !tile.monster;
        });

        return tile;
    }
}