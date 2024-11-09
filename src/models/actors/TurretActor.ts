// Doesn't move. 

import { DIRECTION } from "../../constants/enums";
import { EFFECT_SPRITE_INDICES, MONSTER_SPRITE_INDICES } from "../../constants/spriteIndices";
import { randomRange } from "../../utilities";
import { FloorTile } from "../tiles/tile";
import { BaseActor } from "./base/baseActor";

// Just rotates in place and shoots player (and everything else on that line) when it sees them.
export class TurretActor extends BaseActor {
    directions: Array<string>;
    currentDirection: number;

    constructor(tile: FloorTile) {
        super(tile, MONSTER_SPRITE_INDICES.Turret, 1);
        this.directions = [DIRECTION.N, DIRECTION.E, DIRECTION.S, DIRECTION.W];
        this.currentDirection = randomRange(0, 3);
    }

    act(): void {
        // Rotate 90 degrees
        this.currentDirection += 1;
        if (this.currentDirection == 4) {
            this.currentDirection = 0;
        }

        let cardinalDirection = this.directions[this.currentDirection];
        this.sprite = MONSTER_SPRITE_INDICES["Turret_" + cardinalDirection];
        var targetTiles = this.tile.getNeighborChain(cardinalDirection);

        // if the player is in LOS
        if (targetTiles.some(t => {
            return (t.monster && t.monster.isPlayer)
        })
        ) {
            // Shoot lighting at everything in that direction
            targetTiles.forEach(t => {
                if (t.monster) {
                    t.monster.hit(1);
                }

                switch (cardinalDirection) {
                    case DIRECTION.N:
                    case DIRECTION.S:
                        t.setEffect(EFFECT_SPRITE_INDICES.Bolt_Vertical);
                        break;
                    case DIRECTION.E:
                    case DIRECTION.W:
                        t.setEffect(EFFECT_SPRITE_INDICES.Bolt_Horizontal);
                        break;
                    default:
                        throw "CardinalDirection didn't have a valid value.";
                }
            })
        }
    }
}
