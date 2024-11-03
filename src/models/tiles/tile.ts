import { HUBEVENTS } from "../../constants/enums";
import { TILE_SPRITE_INDICES } from "../../constants/spriteIndices";
import { Hub } from "../../services/hub";
import { IActor } from "../actors/IActor";
import { IMap } from "../maps/IMap";
import { BaseTile } from "./baseTile";

export class FloorTile extends BaseTile {
    constructor(map: IMap, x: number, y: number) {
        super(map, x, y, TILE_SPRITE_INDICES.Floor, true);
    };

    stepOn(monster: IActor): void {
        if (this.book && monster && monster.isPlayer) {
            this.book = false;
        }
    }
}

export class WallTile extends BaseTile {
    constructor(map: IMap, x: number, y: number) {
        super(map, x, y, TILE_SPRITE_INDICES.Wall, false);
    }

    stepOn(monster: IActor): void { };
}

// Brings Player to the next level
export class StairDownTile extends BaseTile {
    constructor(map: IMap, x: number, y: number) {
        super(map, x, y, TILE_SPRITE_INDICES.StairDown, true);
    }

    stepOn(monster: IActor): void {
        if (monster && monster.isPlayer) {
            this.map.nextLevel();
        }
    }
}

// When stepped on deals damage
// Affects monsters, so can be used tactically
export class SpikePitTile extends BaseTile {
    constructor(map: IMap, x: number, y: number) {
        super(map, x, y, TILE_SPRITE_INDICES.SpikePit, true);
    };

    stepOn(monster: IActor): void {
        if (monster) {
            monster.hit(1);

            if (monster.isPlayer) {
                Hub.getInstance().publish(HUBEVENTS.SETSHAKE, 5);
            }
        }
    }
}

// When stepped on brings Player back to full-health.
// Can only be used once, and Monsters can't use them.
export class FountainTile extends BaseTile {
    constructor(map: IMap, x: number, y: number) {
        super(map, x, y, TILE_SPRITE_INDICES.FountainActive, true);
        this.isActive = true;
    };

    stepOn(monster: IActor): void {
        if (this.isActive && monster && monster.isPlayer) {
            this.isActive = false;
            this.sprite = TILE_SPRITE_INDICES.FountainInactive;
            monster.heal(10);
        }
    }
}
