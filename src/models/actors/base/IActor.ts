import { ITile } from "../../tiles/base/ITile";

export interface IActor {
    isDead(): boolean;
    stunned: boolean;
    isPlayer: boolean;
    teleportCounter: number;
    sprite: Array<number>
    hp: number;
    offsetX: number;
    offsetY: number;
    tile: ITile | null;
    setTile(tile: ITile, newMap: boolean): void;
    lastMove: Array<number>;
    getDisplayX(): number;
    getDisplayY(): number;
    heal(damage: number): void;
    hit(damage: number): void;
    setTile(tile: ITile): void;
    tryMove(dx: number, dy: number): boolean;
    tickUpdate(): void;
}
