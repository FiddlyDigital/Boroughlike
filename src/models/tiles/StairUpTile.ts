import { TILE_SPRITE_INDICES } from "../../constants/spriteIndices";
import { IActor } from "../actors/base/IActor";
import { IMap } from "../maps/IMap";
import { BaseTile } from "./base/baseTile";

// Brings Player to the prev level
export class StairUpTile extends BaseTile {
    constructor(map: IMap, x: number, y: number) {
        super(map, x, y, TILE_SPRITE_INDICES.StairUp, true);
    }

    public stepOn(monster: IActor): void {
        // todo: log nothing happens
        console.log(monster);
    }

    public activate(monster: IActor): void {
        if (monster && monster.isPlayer) {
            this.map.prevLevel();
        }
    }
}
