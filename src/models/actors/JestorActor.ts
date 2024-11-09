import { MONSTER_SPRITE_INDICES } from "../../constants/spriteIndices";
import { shuffle } from "../../utilities";
import { FloorTile } from "../tiles/tile";
import { BaseActor } from "./base/baseActor";

// Moves randomly
export class JesterActor extends BaseActor {
    constructor(tile: FloorTile) {
        super(tile, MONSTER_SPRITE_INDICES.Jester, 2);
    }

    act(): void {
        let neighbors = this.tile.getAdjacentPassableNeighbors();
        if (neighbors.length) {
            let randomNeighbour = shuffle(neighbors)[0]
            this.tryMove(randomNeighbour.x - this.tile.x, randomNeighbour.y - this.tile.y);
        }
    }
}