import { MONSTER_SPRITE_INDICES } from "../../constants/spriteIndices";
import { shuffle } from "../../utilities";
import { ITile } from "../tiles/base/ITile";
import { FloorTile } from "../tiles/FloorTile";
import { BaseActor } from "./base/baseActor";

// Destroys walls and heals by doing so
export class EaterActor extends BaseActor {
    constructor(tile: ITile | null) {
        super(tile, MONSTER_SPRITE_INDICES.Eater, 1);
    }

    act(): void {
        if(this.tile === null) {
            return;
        }
        
        const neighbors = this.tile.getAdjacentNeighbors().filter(t => t && !t.passable);
        if (neighbors.length) {
            const tileToEat: ITile = shuffle(neighbors)[0];
            if (tileToEat) {
                tileToEat.map.replaceTile(tileToEat.x, tileToEat.y, new FloorTile(tileToEat.map, tileToEat.x, tileToEat.y));
                this.heal(0.5);
            }
        } else {
            super.act();
        }
    }
}