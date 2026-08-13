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
        if (this.tile === null) {
            return;
        }

        // A meal is a meal: if the player is right next to us, bite them instead
        // of chewing on the scenery.
        const player = this.tile.map.getPlayer();
        if (player && player.tile && this.tile.dist(player.tile) === 1) {
            super.act();
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
