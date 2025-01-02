import { MONSTER_SPRITE_INDICES } from "../../constants/spriteIndices";
import { ITile } from "../tiles/base/ITile";
import { BaseActor } from "./base/baseActor";

// Basic monster with no special behavior
export class BirdActor extends BaseActor {
    constructor(tile: ITile | null) {
        super(tile, MONSTER_SPRITE_INDICES.Bird, 3);
    }
}