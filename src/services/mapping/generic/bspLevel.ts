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
        this.maxLeafSize = this.maxLeafSize;
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

    // connect two rooms by hallways
    public createHall(room1: Room, room2: Room) {
        //# 50% chance that a tunnel will start horizontally
        const chance = (Math.random() >= 0.5);
        if (chance) {
            this.makeHorizontalTunnel(room1.centerX, room2.centerX, room1.centerY);
            this.makeVerticalTunnel(room1.centerY, room2.centerY, room2.centerX);
        }
        else {
            this.makeVerticalTunnel(room1.centerY, room2.centerY, room1.centerX);
            this.makeHorizontalTunnel(room1.centerX, room2.centerX, room2.centerY);
        }
    }

    private makeHorizontalTunnel(xStart: number, xEnd: number, yPosition: number): void {
        const min = Math.min(xStart, xEnd);
        const max = Math.max(xStart, xEnd)
        for (let x = min; x <= max; x++) {
            this.map.tiles[x][yPosition] = new FloorTile(this.map, x, yPosition);
        }
    }

    private makeVerticalTunnel(yStart: number, yEnd: number, xPosition: number): void {
        for (let y = Math.min(yStart, yEnd); y <= Math.max(yStart, yEnd); y++) {
            this.map.tiles[xPosition][y] = new FloorTile(this.map, xPosition, y);
        }
    }
}
