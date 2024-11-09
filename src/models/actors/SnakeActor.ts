import { MONSTER_SPRITE_INDICES } from "../../constants/spriteIndices";
import { FloorTile } from "../tiles/tile";
import { BaseActor } from "./base/baseActor";

// Moves twice 
export class SnakeActor extends BaseActor {
    constructor(tile: FloorTile) {
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