import { BirdActor, EaterActor, IActor, JesterActor, SnakeActor, TankActor, TurretActor } from "./actor";
import { Branches } from "./mapping/levelGenerator";
import { ITile } from "./tile";
import { randomRange, shuffle, tryTo } from "./utilities";

export interface IMap {
    height: number;
    width: number;
    getMonsters(): Array<IActor>;
    getTile(x: number, y: number): ITile | null;
    inBounds(x: number, y: number): boolean;
    randomPassableTile(): ITile | null;
    replaceTile(x: number, y: number, newTileType: any): void;
    spawnMonster(): void;
}

export class Map implements IMap {
    monsters: Array<IActor>;
    tiles: Array<Array<ITile>>;
    height: number = 0;
    width: number = 0;
    branch: string = Branches.LIBRARY;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.monsters = new Array<IActor>();
        this.tiles = new Array<Array<ITile>>();
    }

    getMonsters(): Array<IActor> {
        return this.monsters;
    }

    getTile(x: number, y: number): ITile | null {
        if (this.inBounds(x, y)) {
            return this.tiles[x][y];
        } else {
            return null;
        }
    }

    inBounds(x: number, y: number): boolean {
        return (x >= 0) && (y >= 0) && (x < this.width) && (y < this.height);
    }

    randomPassableTile(): ITile | null {
        let self = this;
        let tile = null;

        tryTo('get random passable tile', function () {
            let x = randomRange(0, self.width - 1);
            let y = randomRange(0, self.height - 1);
            tile = self.getTile(x, y);
            return tile && tile.passable && !tile.monster;
        });

        return tile;
    }

    replaceTile(x: number, y: number, newTileType: any) {
        this.tiles[x][y] = new newTileType(this, x, y)
        return this.tiles[x][y]
    }

    spawnMonster(): void {
        let monsterType = shuffle([BirdActor, SnakeActor, TankActor, EaterActor, JesterActor, TurretActor])[0];
        let monster = new monsterType(this.randomPassableTile());
        this.monsters.push(monster);
    }
}