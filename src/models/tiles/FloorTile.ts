import { TILE_SPRITE_INDICES } from "../../constants/spriteIndices";
import { IActor } from "../actors/base/IActor";
import { IMap } from "../maps/IMap";
import { BaseTile } from "./base/baseTile";
import { DoorTile } from "./DoorTile";

export class FloorTile extends BaseTile {
    constructor(map: IMap, x: number, y: number) {
        super(map, x, y, TILE_SPRITE_INDICES.Floor, true, "80, 80, 80");
    };

    public stepOn(monster: IActor): void {
        if (this.book && monster && monster.isPlayer) {
            this.book = false;
        }
    }

    public activate(monster: IActor): void {
        if (monster && monster.isPlayer) {
            // Check for adjacent doors
            const neighbors = this.getAdjacentNeighbors();
            const adjacentDoors = neighbors.filter(t => t instanceof DoorTile) as DoorTile[];
            
            // If we found any doors, toggle them
            for (const door of adjacentDoors) {
                door.toggleState();
            }
        }
    }
}
