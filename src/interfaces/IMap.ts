import { IActor } from "./IActor";
import { ITile } from "./ITile";

export interface IMap {
    height: number;
    width: number;
    getMonsters(): Array<IActor>;
    getTile(x: number, y: number): ITile | null;
    inBounds(x: number, y: number): boolean;
    nextLevel() : void;
    randomPassableTile(): ITile | null;
    replaceTile(x: number, y: number, newTile: ITile): void;
    spawnMonster(): void;
}