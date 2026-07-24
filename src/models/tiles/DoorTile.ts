/* eslint-disable @typescript-eslint/no-unused-vars */
import { TILE_SPRITE_INDICES } from "../../constants/spriteIndices";
import { IActor } from "../actors/base/IActor";
import { IMap } from "../maps/IMap";
import { BaseTile } from "./base/baseTile";

export class DoorTile extends BaseTile {
    private isOpen: boolean = false;

    constructor(map: IMap, x: number, y: number) {
        // Start closed
        super(map, x, y, TILE_SPRITE_INDICES.DoorClosed, false, "150, 100, 50");
    }

    public stepOn(monster: IActor): void {
        if (!this.isOpen) {
            throw new Error("Can't step on a closed door");
        }
    }

    public activate(monster: IActor): void {
        // Doors are activated through floor tiles
    }

    public toggleState(): void {
        // Toggle door state
        this.isOpen = !this.isOpen;
        
        // Update sprite and passability
        if (this.isOpen) {
            this.sprite = TILE_SPRITE_INDICES.DoorOpen;
            this.passable = true;
            this.minimapRGB = "100, 75, 25"; // Darker brown for open door
        } else {
            this.sprite = TILE_SPRITE_INDICES.DoorClosed;
            this.passable = false;
            this.minimapRGB = "150, 100, 50"; // Lighter brown for closed door
        }
    }

    public isBlocking(): boolean {
        // Closed doors block visibility like walls
        return !this.isOpen;
    }
} 