import { inject, singleton } from "tsyringe";
import { Branches } from "../constants/enums";
import { ILevelGenerator } from "./interfaces/ILevelGenerator";
import { IMap } from "../models/maps/IMap";
import { IMapper } from "./interfaces/IMapper";

@singleton()
export class Mapper implements IMapper {
    floors: Array<IMap>;

    // todo: remove
    currentFloorIdx: number = 0;

    public constructor(
        @inject("ILevelGenerator") private levelGenerator: ILevelGenerator
    ) {
        this.floors = new Array<IMap>();
    }

    public getOrCreateLevel(levelNumber: number): IMap {
        let level = this.floors[levelNumber];
        if (level !== undefined) {
            this.currentFloorIdx = levelNumber;
            return level;
        }

        level = this.levelGenerator.generateLevel(levelNumber, Branches.LIBRARY);
        this.currentFloorIdx = levelNumber;
        this.floors[levelNumber] = level;

        return level;
    }

    public getCurrentLevel(): IMap {
        if (this.floors[this.currentFloorIdx] === undefined) {
            return this.getOrCreateLevel(this.currentFloorIdx);
        }
        return this.floors[this.currentFloorIdx];
    }

    public reset(): void {
        this.floors = new Array<IMap>();
    }
}
