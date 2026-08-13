import { TILE_SPRITE_INDICES, DUNGEON_WALLS } from "../../constants/spriteIndices";
import { IActor } from "../actors/base/IActor";
import { IMap } from "../maps/IMap";
import { BaseTile } from "./base/baseTile";

export class WallTile extends BaseTile {
    // 16-entry blob sprite set, indexed by neighbour mask (L=1, R=2, T=4, B=8).
    // Subclasses swap this for their biome's wall art; the autotiler reads it.
    public wallSprites: Array<Array<number>> = DUNGEON_WALLS;

    constructor(map: IMap, x: number, y: number) {
        super(map, x, y, TILE_SPRITE_INDICES.Wall, false, "200, 200, 200");
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
