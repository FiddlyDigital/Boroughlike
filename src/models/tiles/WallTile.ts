import { TILE_SPRITE_INDICES } from "../../constants/spriteIndices";
import { IMap } from "../maps/IMap";
import { BaseTile } from "./base/baseTile";

export class WallTile extends BaseTile {
    constructor(map: IMap, x: number, y: number) {
        super(map, x, y, TILE_SPRITE_INDICES.Wall, false);
    }

    stepOn(): void { };
}