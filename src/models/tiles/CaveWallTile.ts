import { CAVE_WALLS } from "../../constants/spriteIndices";
import { IMap } from "../maps/IMap";
import { WallTile } from "./WallTile";

// Dark rocky wall used by the cave levels.
export class CaveWallTile extends WallTile {
    public wallSprites: Array<Array<number>> = CAVE_WALLS;

    constructor(map: IMap, x: number, y: number) {
        super(map, x, y);
        this.sprite = CAVE_WALLS[0];
        this.minimapRGB = "70, 66, 78";
    }
}
