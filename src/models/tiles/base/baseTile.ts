import { DIRECTION } from "../../../constants/enums";
import { IActor } from "../../actors/base/IActor";
import { IMap } from "../../maps/IMap";
import { ITile } from "./ITile";

export abstract class BaseTile implements ITile {
    map: IMap;
    x: number;
    y: number;
    sprite: Array<number>;
    passable: boolean;
    visible: boolean = false;
    seen: boolean = false;
    book: boolean = false;
    effectIndex: Array<number> | null = null;
    effectCounter: number = 0;
    stepEffectActive: boolean = false; // Should a trap spring, etc.
    monster: IActor | null = null;
    protected minimapRGB= "256, 256, 256,"

    /**
     * 
     * @param map - Reference to the Map that contains it
     * @param x - X Coordinate on map
     * @param y - Y Coordinate on map
     * @param sprite - index of sprite image
     * @param passable - can an actor walk through it?
     * @param minimapColor - color of the tile on the minimap
     */
    public constructor(
        map: IMap, 
        x: number, 
        y: number, 
        sprite: Array<number>, 
        passable: boolean,
        minimapColor: string
    ) {
        this.map = map;
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.passable = passable;
        this.minimapRGB = minimapColor;
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

        const chain: Array<ITile> = [];
        let currentTile = this.map.getTile(this.x, this.y);
        while (currentTile != null) {
            currentTile = currentTile.getNeighbor(xy[0], xy[1]);

            if (currentTile && currentTile.passable) {
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

    public getMiniMapColor(alpha: number = 0): string {
        return `rgba(${this.minimapRGB}, ${alpha})`;
    }

    public abstract stepOn(monster: IActor): void;

    public abstract activate(monster: IActor): void;
}
