import { TILE_SPRITE_INDICES } from "./constants";
import { PlayerActor } from "./actor";
import { Hub } from "./hub";
import { IActor } from "./interfaces/IActor";
import { ITile } from "./interfaces/ITile";
import { IMap } from "./interfaces/IMap";

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
            case "N":
                xy = [0, -1];
                break;
            case "NE":
                xy = [1, -1];
                break;
            case "NW":
                xy = [-1, -1];
                break;

            case "S":
                xy = [0, 1];
                break;
            case "SE":
                xy = [1, 1];
                break;
            case "SW":
                xy = [-1, 1];
                break;
            case "E":
                xy = [1, 0];
                break;

            case "W":
                xy = [-1, 0];
                break;
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

export class FloorTile extends Tile {
    constructor(map: IMap, x: number, y: number) {
        super(map, x, y, TILE_SPRITE_INDICES.Floor, true);
    };

    stepOn(monster: IActor) {
        if (monster && monster instanceof PlayerActor && this.book) {
            (monster as PlayerActor).incrementScore()
            this.book = false;
        }
    }
}

export class WallTile extends Tile {
    constructor(map: IMap, x: number, y: number) {
        super(map, x, y, TILE_SPRITE_INDICES.Wall, false);
    }

    stepOn(monster: IActor) { };
}

// Brings Player to the next level
export class StairDownTile extends Tile {
    constructor(map: IMap, x: number, y: number) {
        super(map, x, y, TILE_SPRITE_INDICES.StairDown, true);
    }

    stepOn(monster: IActor) {
        if (monster && monster instanceof PlayerActor) {
            this.map.nextLevel();
        }
    }
}

// When stepped on deals damage
// Affects monsters, so can be used tactically
export class SpikePitTile extends Tile {
    constructor(map: IMap, x: number, y: number) {
        super(map, x, y, TILE_SPRITE_INDICES.SpikePit, true);
    };

    stepOn(monster: IActor) {
        if (monster) {
            monster.hit(1);

            if (monster instanceof PlayerActor) {
                Hub.getInstance().publish("SETSHAKE", 5);
            }
        }
    }
}

// When stepped on brings Player back to full-health.
// Can only be used once, and Monsters can't use them.
export class FountainTile extends Tile {
    constructor(map: IMap, x: number, y: number) {
        super(map, x, y, TILE_SPRITE_INDICES.FountainActive, true);
        this.isActive = true;
    };

    stepOn(monster: IActor) {
        if (this.isActive && monster && monster instanceof PlayerActor) {
            this.isActive = false;
            this.sprite = TILE_SPRITE_INDICES.FountainInactive;
            monster.heal(10);
        }
    }
}
