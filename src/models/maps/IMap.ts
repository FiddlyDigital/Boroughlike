import { IActor } from "../actors/base/IActor";
import { ITile } from "../tiles/base/ITile";

export interface IMap {
    removeActor(actor: IActor): void;
    addActor(actor: IActor, movingUp: boolean): void;
    height: number;
    width: number;
    getMonsters(): Array<IActor>;
    getTile(x: number, y: number): ITile | null;
    getStairUpTile(): ITile | null;
    setStairUpTile(): ITile | null
    getStairDownTile(): ITile | null;
    setStairDownTile(): ITile | null
    nextLevel(): void;
    prevLevel(): void;
    randomPassableTile(): ITile | null;
    replaceTile(x: number, y: number, newTile: ITile): void;
    spawnMonster(): void;
}
