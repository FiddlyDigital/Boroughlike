import { HUBEVENTS } from "../../constants/enums";
import { TILE_SPRITE_INDICES } from "../../constants/spriteIndices";
import { Hub } from "../../services/hub";
import { IActor } from "../actors/base/IActor";
import { IMap } from "../maps/IMap";
import { BaseTile } from "./base/baseTile";

// When stepped on deals damage
// Affects monsters, so can be used tactically
export class SpikePitTile extends BaseTile {
    constructor(map: IMap, x: number, y: number) {
        super(map, x, y, TILE_SPRITE_INDICES.SpikePit, true, "255, 0, 0");
    };

    public stepOn(monster: IActor): void {
        if (monster) {
            monster.hit(1);

            if (monster.isPlayer) {
                Hub.getInstance().publish(HUBEVENTS.SETSHAKE, 5);
            }
        }
    }

    public activate(monster: IActor): void {
        // todo: log nothing happens
        console.log(monster);
    }
}
