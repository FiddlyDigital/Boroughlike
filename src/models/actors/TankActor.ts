import { MONSTER_SPRITE_INDICES } from "../../constants/spriteIndices";
import { ITile } from "../tiles/base/ITile";
import { BaseActor } from "./base/baseActor";

// Moves every other turn
export class TankActor extends BaseActor {
    constructor(tile: ITile | null) {
        super(tile, MONSTER_SPRITE_INDICES.Tank, 2);
    }

    public update(): void {
        const startedStunned = this.stunned;
        super.update();
        
        if (!startedStunned) {
            this.stunned = true;
        }
    }
}