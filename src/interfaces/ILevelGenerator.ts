import { IMap } from "./IMap";

export interface ILevelGenerator {
    generateLevel(levelNum: number, branch: string): IMap;
}
