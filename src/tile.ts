import { SPRITETYPES, TILE_SPRITE_INDICES, ITEM_SPRITE_INDICES } from "./constants";
import Game from "./game";
import { Mapper } from "./mapper";
import { IMonster, Monster, Player } from "./monster";
import { Renderer } from "./renderer";

export interface ITile {
    x: number;
    y: number;
    dist(other: ITile): number;
    getAdjacentNeighbors(): Array<Tile>;
    getAdjacentPassableNeighbors(): Array<Tile>;
    getNeighbor(dx: number, dy: number): Tile | null;
    getNeighborChain(direction: string): Array<Tile>;
    setEffect(effectSprite: Array<number>): void;
    stepOn(monster: IMonster): void;
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
    monster: Monster | undefined | null;

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

    public getAdjacentNeighbors(): Array<Tile> {
        let neighbours = [
            this.getNeighbor(0, -1),// Top
            this.getNeighbor(0, 1), // Bottom
            this.getNeighbor(-1, 0),// Left
            this.getNeighbor(1, 0)  // Right
        ];

        return neighbours.filter(x => x != null) as Array<Tile>;
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

        let chain : Array<Tile> = [];
        let currentTile = Mapper.getInstance().getTile(this.x, this.y);
        while (currentTile != null) {
            if (currentTile) {
                currentTile = currentTile.getNeighbor(xy[0], xy[1]);

                if (currentTile && !(currentTile instanceof Wall)) {
                    chain.push(currentTile);
                }
            }

        }

        return chain;
    }

    public getAdjacentPassableNeighbors(): Array<Tile> {
        return this.getAdjacentNeighbors().filter(t => t && t.passable);
    }

    public setEffect(effectSprite: Array<number>): void {
        this.effectIndex = effectSprite;
        this.effectCounter = 30;
    }

    public abstract stepOn(monster: IMonster): void;
}

export class Floor extends Tile {
    constructor(x: number, y: number) {
        super(x, y, TILE_SPRITE_INDICES.Floor, true);
    };

    stepOn(monster: IMonster) {
        if (monster && monster instanceof Player && this.book) {
            Game.getInstance().incrementScore();
            this.book = false;
        }
    }
}

export class Wall extends Tile {
    constructor(x: number, y: number) {
        super(x, y, TILE_SPRITE_INDICES.Wall, false);
    }

    stepOn(monster: IMonster) { };
}

// Brings Player to the next level
export class StairDown extends Tile {
    constructor(x: number, y: number) {
        super(x, y, TILE_SPRITE_INDICES.StairDown, true);
    }

    stepOn(monster: IMonster) {
        if (monster && monster instanceof Player) {
            Game.getInstance().nextLevel();
        }
    }
}

// When stepped on deals damage
// Affects monsters, so can be used tactically
export class SpikePit extends Tile {
    constructor(x: number, y: number) {
        super(x, y, TILE_SPRITE_INDICES.SpikePit, true);
    };

    stepOn(monster: IMonster) {
        if (monster && monster instanceof Player) {
            Renderer.getInstance().setShakeAmount(5);
        }
        monster.hit(1);
    }
}

// When stepped on brings Player back to full-health.
// Can only be used once, and Monsters can't use them.
export class Fountain extends Tile {
    constructor(x: number, y: number) {
        super(x, y, TILE_SPRITE_INDICES.FountainActive, true);
        this.isActive = true;
    };

    stepOn(monster: IMonster) {
        if (this.isActive && monster && monster instanceof Player) {
            this.isActive = false;
            this.sprite = TILE_SPRITE_INDICES.FountainInactive;
            monster.heal(10);
        }
    }
}
