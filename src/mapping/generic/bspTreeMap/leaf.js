import { Room } from "./room.js";

// Port of https://github.com/Fixtone/DungeonCarver/blob/master/Assets/Scripts/Maps/Leaf.cs
export class Leaf {
    constructor(x, y, leafWidth, leafHeight) {
        this.x = x;
        this.y = y;
        this.leafWidth = leafWidth;
        this.leafHeight = leafHeight;

        this.childLeafLeft = null;
        this.childLeafRight = null;
        this.room = new Room();
        this.room1 = new Room();
        this.room2 = new Room();
    }

    createRooms(mapGenerator, maxLeafSize, roomMaxSize, roomMinSize) {

        if (this.childLeafLeft !== null || this.childLeafRight !== null) {
            //# recursively search for children until you hit the end of the branch
            if (this.childLeafLeft != null) {
                this.childLeafLeft.createRooms(mapGenerator, maxLeafSize, roomMaxSize, roomMinSize);
            }

            if (this.childLeafRight != null) {
                this.childLeafRight.createRooms(mapGenerator, maxLeafSize, roomMaxSize, roomMinSize);
            }

            if (this.childLeafLeft !== null && this.childLeafRight !== null) {
                mapGenerator.createHall(this.childLeafLeft.getRoom(), this.childLeafRight.getRoom());
            }
        }
        else {
            let w = this.getRandomIntBetweenMinAndMax(roomMinSize, Math.min(roomMaxSize, (this.leafWidth - 1)));
            let h = this.getRandomIntBetweenMinAndMax(roomMinSize, Math.min(roomMaxSize, (this.leafHeight - 1)));
            let x = this.getRandomIntBetweenMinAndMax(this.x, (this.x + (this.leafWidth - 1) - w));
            let y = this.getRandomIntBetweenMinAndMax(this.y, (this.y + (this.leafHeight - 1) - h));

            this.room = new Room(x, y, w, h);
            mapGenerator.placeRoom(this.room);
        }
    }

    getRandomIntBetweenMinAndMax(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    splitLeaf(minLeafSize) {
        if (this.childLeafLeft !== null || this.childLeafRight !== null) {
            return false;
        }

        //==== Determine the direction of the split ====
        // If the leafWidth of the leaf is >25% larger than the leafHeight,
        //  - split the leaf vertically.
        // If the leafHeight of the leaf is >25 larger than the leafWidth,
        //  - split the leaf horizontally.
        // Otherwise, choose the direction at random.

        // 50% chance to split horizontally
        let splitHorizontally = (Math.random() >= 0.5);

        let horizontalFactor = (this.leafWidth / this.leafHeight);
        let verticalFactor = (this.leafHeight / this.leafWidth);

        if (horizontalFactor >= 1.25) {
            splitHorizontally = false;
        }
        else if (verticalFactor >= 1.25) {
            splitHorizontally = true;
        }

        let max = splitHorizontally ? (this.leafHeight - minLeafSize) : (this.leafWidth - minLeafSize)
        if (max <= minLeafSize) {
            return false;
        }

        let split = this.getRandomIntBetweenMinAndMax(minLeafSize, max);

        if (splitHorizontally) {
            this.childLeafLeft = new Leaf(this.x, this.y, this.leafWidth, split);
            this.childLeafRight = new Leaf(this.x, this.y + split, this.leafWidth, this.leafHeight - split);
        }
        else {
            this.childLeafLeft = new Leaf(this.x, this.y, split, this.leafHeight);
            this.childLeafRight = new Leaf(this.x + split, this.y, this.leafWidth - split, this.leafHeight);
        }

        return true;
    }

    getRoom() {
        if (!this.room.isZero()) {
            return this.room;
        }
        else {
            if (this.childLeafLeft !== null) {
                this.room1 = this.childLeafLeft.getRoom();
            }

            if (this.childLeafRight !== null) {
                this.room2 = this.childLeafRight.getRoom();
            }
        }

        if (this.childLeafLeft === null && this.childLeafRight === null) {
            return new Room(0, 0, 0, 0);
        }
        else if (this.room2.isZero()) {
            return this.room1;
        }
        else if (this.room1.isZero()) {
            return this.room2;
        }
        else {
            let chance = (Math.random() >= 0.5);
            return chance ? this.room1 : this.room2;
        }
    }
} 