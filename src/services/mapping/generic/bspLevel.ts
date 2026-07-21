import { DoorTile } from "../../../models/tiles/DoorTile";
import { FloorTile } from "../../../models/tiles/FloorTile";
import { FountainTile } from "../../../models/tiles/FountainTile";
import { SpikePitTile } from "../../../models/tiles/SpikePitTile";
import { WallTile } from "../../../models/tiles/WallTile";
import { Leaf } from "./bspTreeMap/leaf";
import { Room } from "./bspTreeMap/room";
import { BaseLevel } from './baseLevel';

// port of https://github.com/Fixtone/DungeonCarver/blob/master/Assets/Scripts/Maps/MapGenerators/BSPTreeMapGenerator.cs
// Originally from in WulfenStil
export class BSPTreemapLevel extends BaseLevel {
    maxLeafSize: number = 12;
    minLeafSize: number = 3;
    roomMaxSize: number = 10;
    roomMinSize: number = 3;
    leaves: Array<Leaf | null> = [];

    public constructor(levelNum: number) {
        super(levelNum);
        this.generate();
    }

    public generate(): void {
        this.generateTiles();
        super.populateMap();
    }

    public generateTiles(): void {
        this.initialiseMap();

        const rootLeaf = new Leaf(0, 0, this.map.width, this.map.height);
        this.leaves.push(rootLeaf);

        let successfulSplit = true;

        while (successfulSplit) {
            successfulSplit = false;

            for (let i = 0; i < this.leaves.length; i++) {
                const leaf = this.leaves[i];
                if (!leaf) {
                    continue;
                }

                if ((!leaf.childLeafLeft && !leaf.childLeafRight) && (
                    (leaf.leafWidth > this.maxLeafSize) ||
                    (leaf.leafHeight > this.maxLeafSize)
                )) {
                    // Try to split the leaf
                    if (leaf.splitLeaf(this.minLeafSize)) {
                        if (leaf.childLeafLeft) {
                            this.leaves.push(leaf.childLeafLeft);
                        }
                        if (leaf.childLeafRight) {
                            this.leaves.push(leaf.childLeafRight);
                        }

                        successfulSplit = true;
                    }
                }
            }
        }

        rootLeaf.createRooms(this, this.maxLeafSize, this.roomMaxSize, this.roomMinSize);
    }

    // We this one we start totally blocked in, then carve out
    private initialiseMap(): void {
        for (let x = 0; x < this.map.width; x++) {
            this.map.tiles[x] = [];

            for (let y = 0; y < this.map.height; y++) {
                this.map.tiles[x][y] = new WallTile(this.map, x, y);
            }
        }
    }

    public placeRoom(room: Room): void {
        for (let x = (room.x + 1); x < room.maxX; x++) {
            for (let y = (room.y + 1); y < room.maxY; y++) {
                const ran = Math.random();

                if (ran < 0.005) {
                    this.map.tiles[x][y] = new FountainTile(this.map, x, y);
                }
                else if (ran < 0.02) {
                    this.map.tiles[x][y] = new SpikePitTile(this.map, x, y);
                } else {
                    this.map.tiles[x][y] = new FloorTile(this.map, x, y);
                }
            }
        }
    }

    // connect two rooms by an L-shaped hallway.
    // Each leg of the "L" shares an interior endpoint with exactly one room:
    // the first leg leaves room1, the second leg enters room2. We hand each leg
    // the single room it actually touches so it can place one door at that room's
    // threshold (rather than guessing a door for a room it never reaches).
    public createHall(room1: Room, room2: Room) {
        // 50% chance that a tunnel will start horizontally
        const chance = (Math.random() >= 0.5);
        if (chance) {
            this.makeHorizontalTunnel(room1.centerX, room2.centerX, room1.centerY, room1);
            this.makeVerticalTunnel(room1.centerY, room2.centerY, room2.centerX, room2);
        }
        else {
            this.makeVerticalTunnel(room1.centerY, room2.centerY, room1.centerX, room1);
            this.makeHorizontalTunnel(room1.centerX, room2.centerX, room2.centerY, room2);
        }
    }

    private makeHorizontalTunnel(xStart: number, xEnd: number, yPosition: number, connectingRoom?: Room): void {
        const min = Math.min(xStart, xEnd);
        const max = Math.max(xStart, xEnd);

        // Carve the corridor.
        for (let x = min; x <= max; x++) {
            this.map.tiles[x][yPosition] = new FloorTile(this.map, x, yPosition);
        }

        // Place a single door at the room threshold this leg passes through.
        if (connectingRoom) {
            const doorX = this.horizontalDoorPosition(xStart, xEnd, connectingRoom);
            if (doorX !== null && doorX > min && doorX < max) {
                this.map.tiles[doorX][yPosition] = new DoorTile(this.map, doorX, yPosition);
            }
        }
    }

    private makeVerticalTunnel(yStart: number, yEnd: number, xPosition: number, connectingRoom?: Room): void {
        const min = Math.min(yStart, yEnd);
        const max = Math.max(yStart, yEnd);

        // Carve the corridor.
        for (let y = min; y <= max; y++) {
            this.map.tiles[xPosition][y] = new FloorTile(this.map, xPosition, y);
        }

        // Place a single door at the room threshold this leg passes through.
        if (connectingRoom) {
            const doorY = this.verticalDoorPosition(yStart, yEnd, connectingRoom);
            if (doorY !== null && doorY > min && doorY < max) {
                this.map.tiles[xPosition][doorY] = new DoorTile(this.map, xPosition, doorY);
            }
        }
    }

    // The corridor shares one endpoint with the room's interior; the other endpoint
    // points toward the far room, so it tells us which side the doorway sits on.
    // room.x / room.maxX are the wall columns just outside the room's floor, which is
    // exactly where a door belongs.
    private horizontalDoorPosition(xStart: number, xEnd: number, room: Room): number | null {
        const startInside = xStart > room.x && xStart < room.maxX;
        const endInside = xEnd > room.x && xEnd < room.maxX;
        if (startInside === endInside) {
            return null; // Room doesn't straddle this leg cleanly; skip the door.
        }
        const farX = startInside ? xEnd : xStart;
        return (farX < room.centerX) ? room.x : room.maxX;
    }

    private verticalDoorPosition(yStart: number, yEnd: number, room: Room): number | null {
        const startInside = yStart > room.y && yStart < room.maxY;
        const endInside = yEnd > room.y && yEnd < room.maxY;
        if (startInside === endInside) {
            return null;
        }
        const farY = startInside ? yEnd : yStart;
        return (farY < room.centerY) ? room.y : room.maxY;
    }
}
