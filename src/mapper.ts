import { numTiles } from "./constants";
import { LevelGenerator } from './mapping/levelGenerator'
import { Branches } from "./constants";
import { IMap } from "./interfaces/IMap";
import { IMapper } from "./interfaces/IMapper";
import { singleton } from "tsyringe";

@singleton()
export class Mapper implements IMapper {
    props: any;
    floors: Array<IMap>;
    currentFloorIdx: number = 0;
    currentBranch: string = Branches.LIBRARY;
    levelGenerator: any;

    constructor() {
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

    generateNewLevel(newLevelNum: number): any {
        let level = this.levelGenerator.generateLevel(this.currentFloorIdx, this.currentBranch);
        this.floors[newLevelNum] = level;
        this.currentFloorIdx = newLevelNum;
        return level;
    }

    getCurrentLevel(): IMap {
        return this.floors[this.currentFloorIdx];
    }
}
