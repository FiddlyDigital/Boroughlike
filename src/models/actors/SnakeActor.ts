import { MONSTER_SPRITE_INDICES } from "../../constants/spriteIndices";
import { ITile } from "../tiles/base/ITile";
import { BaseActor } from "./base/baseActor";

// Moves twice 
export class SnakeActor extends BaseActor {
    constructor(tile: ITile | null) {
        super(tile, MONSTER_SPRITE_INDICES.Snake, 1);
    }

    act(): void {
        this.attackedThisTurn = false;
        super.act();

        if (!this.attackedThisTurn) {
            super.act();
        }
    }
}
