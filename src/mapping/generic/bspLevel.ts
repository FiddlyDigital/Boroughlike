import { Leaf } from "./bspTreeMap/leaf";
import { Room } from "./bspTreeMap/room";
import { WallTile, FloorTile, SpikePitTile, FountainTile } from "../../tile";
import { DefaultLevel } from './defaultLevel';
import { IMap, Map } from "../../map";

// port of https://github.com/Fixtone/DungeonCarver/blob/master/Assets/Scripts/Maps/MapGenerators/BSPTreeMapGenerator.cs
// Originally from in WulfenStil
export class BSPTreemapLevel extends DefaultLevel {
    maxLeafSize: number = 12;
    minLeafSize: number = 3;
    roomMaxSize: number = 10;
    roomMinSize: number = 3;
    leaves: Array<Leaf | null> = [];

    constructor(levelNum: number) {
        super(levelNum);
        this.generate();
    }

    generate() {
        this.generateTiles();
        super.generateMonsters();
        super.placeBooks();
    }

    generateTiles() {
        this.initialiseMap();

        let rootLeaf = new Leaf(0, 0, this.map.width, this.map.height);
        this.leaves.push(rootLeaf);

        let successfulSplit = true;

        while (successfulSplit) {
            successfulSplit = false;

            for (var i = 0; i < this.leaves.length; i++) {
                let leaf = this.leaves[i];
                if (leaf) {
                    if (!leaf.childLeafLeft && !leaf.childLeafRight) {
                        if ((leaf.leafWidth > this.maxLeafSize) || (leaf.leafHeight > this.maxLeafSize)) {
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
            }
        }

        rootLeaf.createRooms(this, this.maxLeafSize, this.roomMaxSize, this.roomMinSize);
    }

    // We this one we start totally blocked in, then carve out
    initialiseMap() {
        for (var x = 0; x < this.map.width; x++) {
            this.map.tiles[x] = [];

            for (var y = 0; y < this.map.height; y++) {
                this.map.tiles[x][y] = new WallTile(this.map, x, y);
            }
        }
    }

    placeRoom(room: Room) {
        for (let x = (room.x + 1); x < room.maxX; x++) {
            for (let y = (room.y + 1); y < room.maxY; y++) {
                let ran = Math.random();
                if (ran < 0.02) {
                    this.map.tiles[x][y] = new SpikePitTile(this.map, x, y);
                } else if (ran < 0.005) {
                    this.map.tiles[x][y] = new FountainTile(this.map, x, y);
                } else {
                    this.map.tiles[x][y] = new FloorTile(this.map, x, y);
                }
            }
        }
    }

    // connect two rooms by hallways
    createHall(room1: Room, room2: Room) {
        //# 50% chance that a tunnel will start horizontally
        let chance = (Math.random() >= 0.5);
        if (chance) {
            this.makeHorizontalTunnel(room1.centerX, room2.centerX, room1.centerY);
            this.makeVerticalTunnel(room1.centerY, room2.centerY, room2.centerX);
        }
        else {
            this.makeVerticalTunnel(room1.centerY, room2.centerY, room1.centerX);
            this.makeHorizontalTunnel(room1.centerX, room2.centerX, room2.centerY);
        }
    }

    makeHorizontalTunnel(xStart: number, xEnd: number, yPosition: number) {
        let min = Math.min(xStart, xEnd);
        let max = Math.max(xStart, xEnd)
        for (let x = min; x <= max; x++) {
            this.map.tiles[x][yPosition] = new FloorTile(this.map, x, yPosition);
        }
    }

    makeVerticalTunnel(yStart: number, yEnd: number, xPosition: number) {
        for (let y = Math.min(yStart, yEnd); y <= Math.max(yStart, yEnd); y++) {
            this.map.tiles[xPosition][y] = new FloorTile(this.map, xPosition, y);
        }
    }
}