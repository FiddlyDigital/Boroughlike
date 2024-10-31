import { IMap } from "../../models/interfaces/IMap";

export interface ILevelGenerator {
    generateLevel(levelNum: number, branch: string): IMap;
}
