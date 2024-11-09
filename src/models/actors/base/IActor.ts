import { ITile } from "../../tiles/ITile";

export interface IActor {
    dead: boolean;
    stunned: boolean;
    isPlayer: boolean;
    teleportCounter: number;
    sprite: Array<number>
    hp: number;
    offsetX: number;
    offsetY: number;
    tile: ITile;
    lastMove: Array<number>;
    bonusAttack: number;
    shield: number;
    getDisplayX(): number;
    getDisplayY(): number;
    heal(damage: number): void;
    hit(damage: number): void;
    move(tile: ITile): void;
    tryMove(dx: number, dy: number): boolean;
    update(): void;
}
