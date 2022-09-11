import { SPRITETYPES, TILE_SPRITE_INDICES, ITEM_SPRITE_INDICES } from "./constants";
import Game from "./game";
import { Mapper } from "./mapper";
import { IActor, BaseActor, PlayerActor } from "./actor";
import { Renderer } from "./renderer";

export interface ITile {
    x: number;
    y: number;
    dist(other: ITile): number;
    getAdjacentNeighbors(): Array<Tile | null>;
    getAdjacentPassableNeighbors(): Array<Tile>;
    getNeighbor(dx: number, dy: number): Tile | null;
    getNeighborChain(direction: string): Array<Tile>;
    setEffect(effectSprite: Array<number>): void;
    stepOn(monster: IActor): void;
}

export abstract class Tile implements ITile {
    x: number;
    y: number;
    sprite: Array<number>;
    passable: boolean;
    book: boolean = false;
    effectIndex: Array<number> | undefined;
    effectCounter: number = 0;
    isActive: boolean = false;
    monster: BaseActor | undefined | null;

    public constructor(x: number, y: number, sprite: Array<number>, passable: boolean) {
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.passable = passable;
    }

    public dist(other: ITile): number {
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
    }

    public getNeighbor(dx: number, dy: number): Tile | null {
        return Mapper.getInstance().getTile(this.x + dx, this.y + dy)
    }

    public getAdjacentNeighbors(): Array<Tile | null> {
        return [
            this.getNeighbor(0, -1),// Top
            this.getNeighbor(0, 1), // Bottom
            this.getNeighbor(-1, 0),// Left
            this.getNeighbor(1, 0)  // Right
        ];
    }

    public getNeighborChain(direction: string): Array<Tile> {
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

        let chain: Array<Tile> = [];
        let currentTile = Mapper.getInstance().getTile(this.x, this.y);
        while (currentTile != null) {
            if (currentTile) {
                currentTile = currentTile.getNeighbor(xy[0], xy[1]);

                if (currentTile && !(currentTile instanceof WallTile)) {
                    chain.push(currentTile);
                } else {
                    currentTile = null;
                }
            }
        }

        return chain;
    }

    public getAdjacentPassableNeighbors(): Array<Tile> {
        return this.getAdjacentNeighbors().filter(t => t && t.passable) as Array<Tile>;
    }

    public setEffect(effectSprite: Array<number>): void {
        this.effectIndex = effectSprite;
        this.effectCounter = 30;
    }

    public abstract stepOn(monster: IActor): void;
}

export class FloorTile extends Tile {
    constructor(x: number, y: number) {
        super(x, y, TILE_SPRITE_INDICES.Floor, true);
    };

    stepOn(monster: IActor) {
        if (monster && monster instanceof PlayerActor && this.book) {
            Game.getInstance().incrementScore();
            this.book = false;
        }
    }
}

export class WallTile extends Tile {
    constructor(x: number, y: number) {
        super(x, y, TILE_SPRITE_INDICES.Wall, false);
    }

    stepOn(monster: IActor) { };
}

// Brings Player to the next level
export class StairDownTile extends Tile {
    constructor(x: number, y: number) {
        super(x, y, TILE_SPRITE_INDICES.StairDown, true);
    }

    stepOn(monster: IActor) {
        if (monster && monster instanceof PlayerActor) {
            Game.getInstance().nextLevel();
        }
    }
}

// When stepped on deals damage
// Affects monsters, so can be used tactically
export class SpikePitTile extends Tile {
    constructor(x: number, y: number) {
        super(x, y, TILE_SPRITE_INDICES.SpikePit, true);
    };

    stepOn(monster: IActor) {
        if (monster && monster instanceof PlayerActor) {
            Renderer.getInstance().setShakeAmount(5);
        }
        monster.hit(1);
    }
}

// When stepped on brings Player back to full-health.
// Can only be used once, and Monsters can't use them.
export class FountainTile extends Tile {
    constructor(x: number, y: number) {
        super(x, y, TILE_SPRITE_INDICES.FountainActive, true);
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
