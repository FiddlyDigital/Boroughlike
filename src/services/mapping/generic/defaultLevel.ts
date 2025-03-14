import { numTiles } from "../../../constants/values";
import { TILE_SPRITE_INDICES } from "../../../constants/spriteIndices";
import { shuffle } from "../../../utilities";
import { Map } from '../../../models/maps/map';
import { IMap } from '../../../models/maps/IMap';
import { ITile } from "../../../models/tiles/base/ITile";
import { BirdActor } from "../../../models/actors/BirdActor";
import { SnakeActor } from "../../../models/actors/SnakeActor";
import { TankActor } from "../../../models/actors/TankActor";
import { EaterActor } from "../../../models/actors/EaterActor";
import { JesterActor } from "../../../models/actors/JestorActor";
import { TurretActor } from "../../../models/actors/TurretActor";
import { WallTile } from "../../../models/tiles/WallTile";
import { FountainTile } from "../../../models/tiles/FountainTile";
import { SpikePitTile } from "../../../models/tiles/SpikePitTile";
import { FloorTile } from "../../../models/tiles/FloorTile";
import { ILevelGenerator } from "../../../services/interfaces/ILevelGenerator";

export class DefaultLevel implements ILevelGenerator {
    levelIdx: number;
    map: Map;

    public constructor(levelNum: number) {
        this.levelIdx = levelNum;
        const mapSize = Math.floor((numTiles / 100) * (levelNum * 10 + 100));
        this.map = new Map(mapSize, mapSize);
    }

    public generateLevel(levelNum: number, branch: string): IMap {
        this.levelIdx = levelNum;

        const mapSize = Math.floor((numTiles / 100) * (levelNum * 10 + 100));
        this.map = new Map(mapSize, mapSize);
        this.generateTiles();
        this.populateMap();
        return this.map;
    }

    public generateTiles(): void {
        for (let x = 0; x < this.map.width; x++) {
            this.map.tiles[x] = [];

            for (let y = 0; y < this.map.height; y++) {
                if (x == 0 || y == 0 || x == (this.map.width - 1) || y == (this.map.height - 1)) {
                    this.map.tiles[x][y] = new WallTile(this.map, x, y);
                }
                else {
                    const ran = Math.random();

                    if (ran < 0.005) {
                        this.map.tiles[x][y] = new FountainTile(this.map, x, y);
                    }
                    else if (ran < 0.02) {
                        this.map.tiles[x][y] = new SpikePitTile(this.map, x, y);
                    }
                    else if (ran < 0.3) {
                        this.map.tiles[x][y] = new WallTile(this.map, x, y);
                    }
                    else {
                        this.map.tiles[x][y] = new FloorTile(this.map, x, y);
                    }
                }
            }
        }
    }

    protected populateMap() {
        this.generateMonsters();
        this.placeBooks();
        this.placeStairsDown();

        console.log("Level " + this.levelIdx + " generated");
        if (this.levelIdx > 0) {
            console.log("Placing stairs up");
            this.placeStairsUp();
        }

        this.overrideWallSpritesOnEdges();
    }

    private generateMonsters() {
        const numMonsters = Math.ceil((this.levelIdx + 1) / 2) + 1;
        for (let i = 0; i < numMonsters; i++) {
            this.map.monsters.push(this.spawnMonster());
        }
    }

    private spawnMonster() {
        const monsterType = shuffle([BirdActor, SnakeActor, TankActor, EaterActor, JesterActor, TurretActor])[0];
        return new monsterType(this.map.randomPassableTile());
    }

    private placeBooks() {
        let booksPlaced = 0
        while (booksPlaced < 3) {
            const t = this.map.randomPassableTile()
            if (t && t instanceof FloorTile) {
                booksPlaced++;
                t.book = true;
            }
        }
    }

    private placeStairsDown() {
        this.map.setStairDownTile();
    }

    private placeStairsUp() {
        this.map.setStairUpTile();
    }

    private overrideWallSpritesOnEdges(): void {
        // Repass over the map, changing map sprites depending on neighbours (if required)
        for (let y = 0; y < this.map.height; y++) {
            for (let x = 0; x < this.map.width; x++) {
                const tile = this.map.getTile(x, y);
                if (tile instanceof WallTile) {
                    const neighbours = tile.getAdjacentNeighbors();
                    if (neighbours && neighbours.length > 0) {
                        const newSpriteName = this.getSpriteVariationSuffixForTile(neighbours, WallTile);
                        if (newSpriteName) {
                            tile.sprite = TILE_SPRITE_INDICES["Wall_" + newSpriteName];
                        }
                    }
                }
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private getSpriteVariationSuffixForTile(neighbours: Array<ITile | null>, tileClass: any): string {
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
}
