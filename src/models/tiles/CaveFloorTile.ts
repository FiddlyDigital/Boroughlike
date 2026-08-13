import { TILE_SPRITE_INDICES } from "../../constants/spriteIndices";
import { IMap } from "../maps/IMap";
import { FloorTile } from "./FloorTile";

// Dark rocky floor for the cave levels. Behaves exactly like a FloorTile
// (books, death-drops), only re-skinned.
export class CaveFloorTile extends FloorTile {
    constructor(map: IMap, x: number, y: number) {
        super(map, x, y);
        this.sprite = TILE_SPRITE_INDICES.CaveFloor;
        this.minimapRGB = "70, 66, 78";
    }
}
