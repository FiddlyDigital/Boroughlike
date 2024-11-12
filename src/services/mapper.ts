import { inject, singleton } from "tsyringe";
import { Branches } from "../constants/enums";
import { ILevelGenerator } from "./interfaces/ILevelGenerator";
import { IMap } from "../models/maps/IMap";
import { IMapper } from "./interfaces/IMapper";

@singleton()
export class Mapper implements IMapper {
    floors: Array<IMap>;
    currentFloorIdx: number = 0;

    public constructor(
        @inject("ILevelGenerator") private levelGenerator: ILevelGenerator

    ) {
        this.floors = new Array<IMap>();
    }

    public getOrCreateLevel(levelNumber: number): IMap {
        let level: IMap | null = this.floors[levelNumber];
        if (level) {
            this.currentFloorIdx = levelNumber;
            return level;
        }

        level = this.levelGenerator.generateLevel(this.currentFloorIdx, Branches.LIBRARY);
        this.currentFloorIdx = levelNumber;
        this.floors[levelNumber] = level;

        return level;
    }

    public getCurrentLevel(): IMap {
        return this.floors[this.currentFloorIdx];
    }

    public reset(): void {
        this.floors = new Array<IMap>();
    }
}
