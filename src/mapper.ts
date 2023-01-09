import { numTiles } from "./constants";
import { LevelGenerator } from './mapping/levelGenerator'
import { Branches } from "./constants";
import { IMap } from "./map";

export interface IMapper {
    currentFloorIdx: number;
    getCurrentLevel(): IMap;
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
        this.floors[newLevelNum] = level;
        this.currentFloorIdx = newLevelNum;
        return level;
    }

    getCurrentLevel(): IMap {
        return this.floors[this.currentFloorIdx];
    }
}
