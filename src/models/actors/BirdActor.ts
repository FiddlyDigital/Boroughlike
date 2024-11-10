import { MONSTER_SPRITE_INDICES } from "../../constants/spriteIndices";
import { FloorTile } from "../tiles/FloorTile";
import { BaseActor } from "./base/baseActor";

// Basic monster with no special behavior
export class BirdActor extends BaseActor {
    constructor(tile: FloorTile) {
        super(tile, MONSTER_SPRITE_INDICES.Bird, 3);
    }
}