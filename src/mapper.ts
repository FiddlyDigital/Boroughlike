import { numTiles, TILE_SPRITE_INDICES } from "./constants";
import { BirdActor, SnakeActor, TankActor, EaterActor, JesterActor, TurretActor, IActor } from "./actor"
import { FloorTile, ITile, Tile, WallTile } from "./tile";
import { LevelGenerator, Branches } from './mapping/levelGenerator'
import { randomRange, tryTo, shuffle } from "./utilities";

export interface IMapper {

}

export class Mapper implements IMapper {
    private static instance: Mapper;
    props: any;
    levelGenerator: any;

    private constructor() {
        this.levelGenerator = new LevelGenerator();
        this.props = {
            monsters: [],
            tiles: [], // floors: []
            levelNum: 1,
            height: numTiles,
            width: numTiles,
            branch: Branches.LIBRARY
        };
    }

    public static getInstance(): Mapper {
        if (!Mapper.instance) {
            Mapper.instance = new Mapper();
        }

        return Mapper.instance;
    }

    replaceTile(x: number, y: number, newTileType: any) {
        this.props.tiles[x][y] = new newTileType(x, y)
        return this.props.tiles[x][y]
    }

    tiles(): Array<ITile> {
        return this.props.tiles;
    }

    getMonsters(): Array<IActor> {
        return this.props.monsters;
    }

    generateLevel(newLevelNum: number): void {
        this.props.levelNum = newLevelNum;

        let level = this.levelGenerator.generateLevel(this.props.levelNum, this.props.branch);

        this.props.height = level.height;
        this.props.width = level.width;
        this.props.tiles = level.tiles;
        this.props.monsters = level.monsters;

        this.overrideSprites();
    }

    overrideSprites(): void {
        // Repass over the map, changing map sprites depending on neighbours (if required)
        for (let y = 0; y < this.props.height; y++) {
            for (let x = 0; x < this.props.width; x++) {
                let tile = this.props.tiles[x][y];

                if (tile instanceof WallTile) {
                    let neighbours = tile.getAdjacentNeighbors();
                    if (neighbours && neighbours.length > 0) {
                        let newSpriteName = this.getSpriteVariationSuffixForTile(neighbours, WallTile);
                        if (newSpriteName) {
                            tile.sprite = TILE_SPRITE_INDICES["Wall_" + newSpriteName];
                        }
                    }
                }
            }
        }
    }

    getSpriteVariationSuffixForTile(neighbours: Array<Tile | null>, tileClass: any): string {
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

    inBounds(x: number, y: number): boolean {
        return (x >= 0) && (y >= 0) && (x < this.props.width) && (y < this.props.height);
    }

    getTile(x: number, y: number): Tile | null {
        if (this.inBounds(x, y)) {
            return this.props.tiles[x][y];
        } else {
            return null;
        }
    }

    randomPassableTile(): Tile | null {
        let self = this;
        let tile = null;

        tryTo('get random passable tile', function () {
            let x = randomRange(0, self.props.width - 1);
            let y = randomRange(0, self.props.height - 1);
            tile = Mapper.getInstance().getTile(x, y);
            return tile && tile.passable && !tile.monster;
        });

        return tile;
    }

    spawnMonster(): void {
        let monsterType = shuffle([BirdActor, SnakeActor, TankActor, EaterActor, JesterActor, TurretActor])[0];
        let monster = new monsterType(this.randomPassableTile());
        this.props.monsters.push(monster);
    }
}
