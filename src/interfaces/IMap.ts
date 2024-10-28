import { IActor } from "./IActor";
import { ITile } from "./ITile";

export interface IMap {
    height: number;
    width: number;
    getMonsters(): Array<IActor>;
    getTile(x: number, y: number): ITile | null;
    nextLevel() : void;
    randomPassableTile(): ITile | null;
    replaceTile(x: number, y: number, newTile: ITile): void;
    spawnMonster(): void;
}
