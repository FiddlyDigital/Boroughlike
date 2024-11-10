import { MONSTER_SPRITE_INDICES } from "../../constants/spriteIndices";
import { FloorTile } from "../tiles/FloorTile";
import { BaseActor } from "./base/baseActor";

// Moves every other turn
export class TankActor extends BaseActor {
    constructor(tile: FloorTile) {
        super(tile, MONSTER_SPRITE_INDICES.Tank, 2);
    }

    update(): void {
        const startedStunned = this.stunned;
        super.update();
        if (!startedStunned) {
            this.stunned = true;
        }
    }
}