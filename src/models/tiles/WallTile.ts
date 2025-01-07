import { TILE_SPRITE_INDICES } from "../../constants/spriteIndices";
import { IActor } from "../actors/base/IActor";
import { IMap } from "../maps/IMap";
import { BaseTile } from "./base/baseTile";

export class WallTile extends BaseTile {
    constructor(map: IMap, x: number, y: number) {
        super(map, x, y, TILE_SPRITE_INDICES.Wall, false);
    }

    public stepOn(monster: IActor): void {
        console.log(monster);
        throw new Error("Shouldn't be able to step on a wall tile");
    };

    public activate(monster: IActor): void {
        console.log(monster);
        throw new Error("Shouldn't be able to activate a wall tile");
    }
}
