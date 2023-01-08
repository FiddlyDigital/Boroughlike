import { numTiles, TILE_SPRITE_INDICES } from "./constants";
import { ITile, WallTile } from "./tile";
import { LevelGenerator, Branches } from './mapping/levelGenerator'
import { IMap } from "./map";

export interface IMapper {
    currentFloorIdx: number;
    getCurrentLevel() : IMap;
    generateLevel(newLevelNum: number): IMap;
}

export class Mapper implements IMapper {
    private static instance: IMapper;
    props: any;
    floors: Array<IMap>;
    currentFloorIdx: number = 0;
    currentBranch: string = Branches.LIBRARY;
    levelGenerator: any;

    private constructor() {
        this.levelGenerator = new LevelGenerator();
        this.floors = new Array<IMap>();
        this.props = {
            monsters: [],
            tiles: [],
            floors: [],
            levelNum: 1,
            height: numTiles,
            width: numTiles,
            branch: Branches.LIBRARY
        };
    }

    public static getInstance(): IMapper {
        if (!Mapper.instance) {
            Mapper.instance = new Mapper();
        }

        return Mapper.instance;
    }

    generateLevel(newLevelNum: number): any {
        let level = this.levelGenerator.generateLevel(this.currentFloorIdx, this.currentBranch);
        this.overrideSprites(level);
        this.floors[newLevelNum] = level;
        this.currentFloorIdx = newLevelNum;
        return level;
    }

    getCurrentLevel() : IMap {
        return this.floors[this.currentFloorIdx];
    }

    private overrideSprites(level: IMap): void {
        // Repass over the map, changing map sprites depending on neighbours (if required)
        for (let y = 0; y < level.height; y++) {
            for (let x = 0; x < level.width; x++) {
                let tile = level.getTile(x, y);

                if (tile && tile instanceof WallTile) {
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
