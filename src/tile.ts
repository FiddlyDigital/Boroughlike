import { SPRITETYPES, TILE_SPRITE_INDICES, ITEM_SPRITE_INDICES } from "./constants";
import Game from "./game";
import { Mapper } from "./mapper";
import { Monster } from "./monster";
import { Renderer } from "./renderer";
import { deepCopy } from "./utilities";

export class Tile {
    x: number;
    y: number;
    sprite: Array<number>;
    passable: boolean;
    book: boolean = false;
    effectIndex: Array<number> | undefined;
    effectCounter: number = 0;
    isActive: boolean = false;
    monster: Monster | undefined | null;

    constructor(x: number, y: number, sprite: Array<number>, passable: boolean) {
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.passable = passable;
    }

    dist(other: any) {
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
    }

    getNeighbor(dx: number, dy: number) {
        return Mapper.getInstance().getTile(this.x + dx, this.y + dy)
    }

    getAdjacentNeighbors(): Array<Tile> {
        return [
            this.getNeighbor(0, -1),// Top
            this.getNeighbor(0, 1), // Bottom
            this.getNeighbor(-1, 0),// Left
            this.getNeighbor(1, 0)  // Right
        ];
    }

    getNeighbourChain(direction: string) {
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

        let chain = [];
        let currentTile = this;
        while (true) {
            if(currentTile){
                currentTile = currentTile.getNeighbor(xy[0], xy[1]);

                if (!(currentTile instanceof Wall)) {
                    chain.push(currentTile);
                } else {
                    break;
                }
            }

            break;
        }

        return chain;
    }

    getAdjacentPassableNeighbors() {
        return this.getAdjacentNeighbors().filter(t => t && t.passable);
    }

    getConnectedTiles() {
        let connectedTiles: Array<Tile> = new Array(this); //[this];
        let frontier: Array<Tile> = new Array(this); //[this];

        while (frontier.length) {
            let nextNeighbour = frontier.pop();

            if (nextNeighbour) {
                let neighbors = nextNeighbour
                    .getAdjacentPassableNeighbors()
                    .filter(t => t && !connectedTiles.includes(t));

                connectedTiles = connectedTiles.concat(neighbors);
                frontier = frontier.concat(neighbors);
            }
        }
        return connectedTiles;
    }

    draw() {
        Renderer.getInstance().drawSprite(SPRITETYPES.TILE, this.sprite, this.x, this.y);

        if (this.book) {
            Renderer.getInstance().drawSprite(SPRITETYPES.ITEMS, ITEM_SPRITE_INDICES.Book, this.x, this.y);
        }

        if (this.effectCounter) {
            this.effectCounter--;

            Renderer.getInstance().drawSprite(SPRITETYPES.EFFECTS, this.effectIndex, this.x, this.y, this.effectCounter);
        }
    }

    setEffect(effectSprite: Array<number>) {
        this.effectIndex = effectSprite;
        this.effectCounter = 30;
    }
}

export class Floor extends Tile {
    constructor(x: number, y: number) {
        super(x, y, TILE_SPRITE_INDICES.Floor, true);
    };

    stepOn(monster: any) {
        if (monster.isPlayer && this.book) {
            Game.getInstance().incrementScore();
            this.book = false;
        }
    }
}

export class Wall extends Tile {
    constructor(x: number, y: number) {
        super(x, y, TILE_SPRITE_INDICES.Wall, false);
    }
}

// Brings Player to the next level
export class StairDown extends Tile {
    constructor(x: number, y: number) {
        super(x, y, TILE_SPRITE_INDICES.StairDown, true);
    }

    stepOn(monster: any) {
        if (monster.isPlayer) {
            Game.getInstance().nextLevel();
        }
    }
}

// export class StairUp extends Tile {
//     constructor(x: number, y: number) {
//         super(x, y, TILE_SPRITE_INDICES.StairUp, true);
//     }

//     stepOn(monster: any) {
//         if (monster.isPlayer) {
//             Game.getInstance().previousLevel();
//         }
//     }
// }

// When stepped on deals damage
// Affects monsters, so can be used tactically
export class SpikePit extends Tile {
    constructor(x: number, y: number) {
        super(x, y, TILE_SPRITE_INDICES.SpikePit, true);
    };

    stepOn(monster: any) {
        if (monster.isPlayer) {
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

    stepOn(monster: any) {
        if (this.isActive && monster.isPlayer) {
            this.isActive = false;
            this.sprite = TILE_SPRITE_INDICES.FountainInactive;
            monster.heal(10);
        }
    }
}
