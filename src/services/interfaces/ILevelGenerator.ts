import { IMap } from "../../models/maps/IMap";

export interface ILevelGenerator {
    generateLevel(levelNum: number, branch: string): IMap;
}
