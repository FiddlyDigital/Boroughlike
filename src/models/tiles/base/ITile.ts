import { IActor } from "../../actors/base/IActor";
import { IMap } from "../../maps/IMap";

export interface ITile {
    map: IMap;
    x: number;
    y: number;
    book: boolean;
    passable: boolean;
    monster: IActor | null;
    sprite: Array<number>;
    effectIndex: Array<number> | null;
    effectCounter: number;
    dist(other: ITile): number;
    getAdjacentNeighbors(): Array<ITile | null>;
    getAdjacentPassableNeighbors(): Array<ITile>;
    getNeighbor(dx: number, dy: number): ITile | null;
    getNeighborChain(direction: string): Array<ITile>;
    setEffect(effectSprite: Array<number>): void;
    stepOn(monster: IActor): void;
    activate(monster: IActor): void;
}

