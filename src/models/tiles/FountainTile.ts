import { TILE_SPRITE_INDICES } from "../../constants/spriteIndices";
import { IActor } from "../actors/base/IActor";
import { IMap } from "../maps/IMap";
import { BaseTile } from "./base/baseTile";

// When stepped on brings Player back to full-health.
// Can only be used once, and Monsters can't use them.
export class FountainTile extends BaseTile {
    constructor(map: IMap, x: number, y: number) {
        super(map, x, y, TILE_SPRITE_INDICES.FountainActive, true);
        this.stepEffectActive = true;
    };

    stepOn(monster: IActor): void {
        if (this.stepEffectActive && monster && monster.isPlayer) {
            this.stepEffectActive = false;
            this.sprite = TILE_SPRITE_INDICES.FountainInactive;
            monster.heal(10);
        }
    }
}
