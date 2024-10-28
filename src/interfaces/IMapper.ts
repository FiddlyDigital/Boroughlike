import { IMap } from "./IMap";

export interface IMapper {
    currentFloorIdx: number;
    getCurrentLevel(): IMap;
    getOrCreateLevel(newLevelNum: number): IMap;
    reset(): void;
}
