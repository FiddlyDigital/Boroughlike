import { IActor } from "../actors/base/IActor";
import { ITile } from "../tiles/base/ITile";

export interface IMap {
    removeActor(actor: IActor): void;
    addActor(actor: IActor, movingUp: boolean): void;
    height: number;
    width: number;
    getMonsters(): Array<IActor>;
    getPlayer(): IActor | null;
    getTile(x: number, y: number): ITile | null;
    getStairUpTile(): ITile | null;
    setStairUpTile(preferredTile?: ITile | null): ITile | null
    getStairDownTile(): ITile | null;
    setStairDownTile(preferredTile?: ITile | null): ITile | null
    nextLevel(): void;
    prevLevel(): void;
    randomPassableTile(): ITile | null;
    replaceTile(x: number, y: number, newTile: ITile): void;
    spawnMonster(): void;
}
