import { CANYON_WALLS } from "../../constants/spriteIndices";
import { IMap } from "../maps/IMap";
import { WallTile } from "./WallTile";

// Sandstone wall used by the desert's canyon region.
export class CanyonWallTile extends WallTile {
    public wallSprites: Array<Array<number>> = CANYON_WALLS;

    constructor(map: IMap, x: number, y: number) {
        super(map, x, y);
        this.sprite = CANYON_WALLS[0];
        this.minimapRGB = "150, 110, 70";
    }
}
