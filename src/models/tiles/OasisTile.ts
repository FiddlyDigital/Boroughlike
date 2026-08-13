import { TILE_SPRITE_INDICES } from "../../constants/spriteIndices";
import { IActor } from "../actors/base/IActor";
import { IMap } from "../maps/IMap";
import { BaseTile } from "./base/baseTile";

// Shallow desert water. Purely decorative: walkable, no effect right now (maybe later)
export class OasisTile extends BaseTile {
    constructor(map: IMap, x: number, y: number) {
        super(map, x, y, TILE_SPRITE_INDICES.Oasis, true, "60, 120, 170");
    }

    public stepOn(monster: IActor): void {
        void monster;
    }

    public activate(monster: IActor): void {
        void monster;
    }
}
