import { DIRECTION } from "../../constants/enums";
import { IActor } from "../interfaces/IActor";
import { IMap } from "../interfaces/IMap";
import { ITile } from "../interfaces/ITile";
import { WallTile } from "../tile";

export abstract class Tile implements ITile {
    map: IMap;
    x: number;
    y: number;
    sprite: Array<number>;
    passable: boolean;
    book: boolean = false;
    effectIndex: Array<number> | null;
    effectCounter: number = 0;
    isActive: boolean = false;
    monster: IActor | null;

    /**
     * 
     * @param map - Reference to the Map that contains it
     * @param x - X Coordinate on map
     * @param y - Y Coordinate on map
     * @param sprite - index of sprite image
     * @param passable - can an actor walk through it?
     */
    public constructor(map: IMap, x: number, y: number, sprite: Array<number>, passable: boolean) {
        this.map = map;
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.passable = passable;
        this.effectIndex = null;
        this.monster = null;
    }

    public dist(other: ITile): number {
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
    }

    public getNeighbor(dx: number, dy: number): ITile | null {
        return this.map.getTile(this.x + dx, this.y + dy)
    }

    public getAdjacentNeighbors(): Array<ITile | null> {
        return [
            this.getNeighbor(0, -1),// Top
            this.getNeighbor(0, 1), // Bottom
            this.getNeighbor(-1, 0),// Left
            this.getNeighbor(1, 0)  // Right
        ];
    }

    public getNeighborChain(direction: string): Array<ITile> {
        let xy = [0, 0];
        switch (direction) {
            case DIRECTION.N:
                xy = [0, -1];
                break;
            case DIRECTION.S:
                xy = [0, 1];
                break;
            case DIRECTION.E:
                xy = [1, 0];
                break;
            case DIRECTION.W:
                xy = [-1, 0];
                break;
            default:
                throw "Direction didn't have a valid value.";
        }

        let chain: Array<ITile> = [];
        let currentTile = this.map.getTile(this.x, this.y);
        while (currentTile != null) {
            currentTile = currentTile.getNeighbor(xy[0], xy[1]);

            if (currentTile && !(currentTile instanceof WallTile)) {
                chain.push(currentTile);
            } else {
                currentTile = null;
            }
        }

        return chain;
    }

    public getAdjacentPassableNeighbors(): Array<ITile> {
        return this.getAdjacentNeighbors().filter(t => t && t.passable) as Array<ITile>;
    }

    public setEffect(effectSprite: Array<number>): void {
        this.effectIndex = effectSprite;
        this.effectCounter = 30;
    }

    public abstract stepOn(monster: IActor): void;
}