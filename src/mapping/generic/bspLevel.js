import { Leaf } from "./bspTreeMap/leaf.js";
import { Wall, Floor,SpikePit, Fountain } from "../../tile.js";
import { DefaultLevel } from './defaultLevel.js';

// port of https://github.com/Fixtone/DungeonCarver/blob/master/Assets/Scripts/Maps/MapGenerators/BSPTreeMapGenerator.cs
// Originally from in WulfenStil
export class BSPTreemapLevel extends DefaultLevel{
    constructor(levelNum) {
        super(levelNum);

        this.maxLeafSize = 12;
        this.minLeafSize = 3;
        this.roomMaxSize = 10;
        this.roomMinSize = 3;
        this.leaves = [];        
    }

    generate() {
        this.generateTiles();
        super.generateMonsters();
        super.placeBooks();
    }

    generateTiles() {        
        this.initialiseMap();

        let rootLeaf = new Leaf(0, 0, this.width, this.height);
        this.leaves.push(rootLeaf);

        let successfulSplit = true;
        while (successfulSplit) {
            successfulSplit = false;

            for (var i = 0; i < this.leaves.length; i++) {
                if (this.leaves[i].childLeafLeft === null && this.leaves[i].childLeafRight === null) {
                    if ((this.leaves[i].leafWidth > this.maxLeafSize) || (this.leaves[i].leafHeight > this.maxLeafSize)) {
                        // Try to split the leaf
                        if (this.leaves[i].splitLeaf(this.minLeafSize)) {
                            this.leaves.push(this.leaves[i].childLeafLeft);
                            this.leaves.push(this.leaves[i].childLeafRight);
                            successfulSplit = true;
                        }
                    }
                }
            }
        }

        rootLeaf.createRooms(this, this.maxLeafSize, this.roomMaxSize, this.roomMinSize);

        return this.tiles;
    }

    // We this one we start totally blocked in, then carve out
    initialiseMap() {
        this.tiles = [[]];

        for (var x = 0; x < this.width; x++) {
            this.tiles[x] = [];

            for (var y = 0; y < this.height; y++) {
                this.tiles[x][y] = new Wall(x, y);
            }
        }
    }

    placeRoom(room) {
        for (let x = (room.x + 1); x < room.maxX; x++) {
            for (let y = (room.y + 1); y < room.maxY; y++) {
                let ran = Math.random();
                if (ran < 0.02) {
                    this.tiles[x][y] = new SpikePit(x, y);
                } else if (ran < 0.005) {
                    this.tiles[x][y] = new Fountain(x, y);
                } else {
                    this.tiles[x][y] = new Floor(x, y);
                }                
            }
        }
    }

    // connect two rooms by hallways
    createHall(room1, room2) {
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

    makeHorizontalTunnel(xStart, xEnd, yPosition) {
        let min = Math.min(xStart, xEnd);
        let max = Math.max(xStart, xEnd)
        for (let x = min; x <= max; x++) {
            // if(x == min || x == (max-1)) {
            //     this.tiles[x][yPosition] = new Door(x, yPosition);
            // }   
            // else{
                this.tiles[x][yPosition] = new Floor(x, yPosition);
            //}
        }
    }

    makeVerticalTunnel(yStart, yEnd, xPosition) {
        for (let y = Math.min(yStart, yEnd); y <= Math.max(yStart, yEnd); y++) {
            this.tiles[xPosition][y] = new Floor(xPosition, y);
        }
    }
}