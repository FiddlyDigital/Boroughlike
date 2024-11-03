import { IMap } from "../../models/maps/IMap";

export interface IMapper {
    currentFloorIdx: number;
    getCurrentLevel(): IMap;
    getOrCreateLevel(newLevelNum: number): IMap;
    reset(): void;
}
