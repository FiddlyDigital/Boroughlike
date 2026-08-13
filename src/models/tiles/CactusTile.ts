import { HUBEVENTS } from "../../constants/enums";
import { TILE_SPRITE_INDICES } from "../../constants/spriteIndices";
import { Hub } from "../../services/hub";
import { IActor } from "../actors/base/IActor";
import { IMap } from "../maps/IMap";
import { BaseTile } from "./base/baseTile";

// A desert hazard: impassable, and walking into it deals 1 damage.
export class CactusTile extends BaseTile {
    constructor(map: IMap, x: number, y: number) {
        super(map, x, y, TILE_SPRITE_INDICES.Cactus, false, "70, 130, 65");
    }

    public stepOn(monster: IActor): void {
        console.log(monster);
        throw new Error("Shouldn't be able to step on a cactus tile");
    }

    public activate(monster: IActor): void {
        void monster;
    }

    public bumpInto(monster: IActor): void {
        if (monster) {
            monster.hit(1);
            if (monster.isPlayer) {
                Hub.getInstance().publish(HUBEVENTS.SETSHAKE, 5);
            }
        }
    }
}
