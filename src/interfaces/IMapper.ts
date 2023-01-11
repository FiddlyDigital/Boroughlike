import { IMap } from "./IMap";

export interface IMapper {
    currentFloorIdx: number;
    getCurrentLevel(): IMap;
    generateNewLevel(newLevelNum: number): IMap;
}