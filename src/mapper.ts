import { inject, singleton } from "tsyringe";
import { Branches } from "./constants";
import { ILevelGenerator } from "./interfaces/ILevelGenerator";
import { IMap } from "./interfaces/IMap";
import { IMapper } from "./interfaces/IMapper";

@singleton()
export class Mapper implements IMapper {
    floors: Array<IMap>;
    currentFloorIdx: number = 0;

    constructor(
        @inject("ILevelGenerator") private levelGenerator: ILevelGenerator

    ) {
        this.floors = new Array<IMap>();
    }

    getOrCreateLevel(levelNumber: number): any {
        let level: IMap | null = this.floors[levelNumber];
        if (level) {
            this.currentFloorIdx = levelNumber;
            return level;
        }

        level = this.levelGenerator.generateLevel(this.currentFloorIdx, Branches.LIBRARY);
        if (level) {
            this.currentFloorIdx = levelNumber;
            this.floors[levelNumber] = level;
        }
        return level;
    }

    getCurrentLevel(): IMap {
        return this.floors[this.currentFloorIdx];
    }
}
