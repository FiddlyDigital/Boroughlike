import { Branches, HUBEVENTS } from "../../constants/enums";
import { Hub } from "../../services/hub";
import { IActor } from "../actors/base/IActor";
import { IMap } from "./IMap";
import { ITile } from "../tiles/ITile";
import { randomRange, shuffle, tryTo } from "../../utilities";
import { BirdActor } from "../actors/BirdActor";
import { SnakeActor } from "../actors/SnakeActor";
import { TankActor } from "../actors/TankActor";
import { EaterActor } from "../actors/EaterActor";
import { JesterActor } from "../actors/JestorActor";
import { TurretActor } from "../actors/TurretActor";

export class Map implements IMap {
    monsters: Array<IActor>;
    tiles: Array<Array<ITile>>;
    height: number = 0;
    width: number = 0;
    branch: string = Branches.LIBRARY;

    public constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.monsters = new Array<IActor>();
        this.tiles = new Array<Array<ITile>>();
    }

    public getMonsters(): Array<IActor> {
        return this.monsters;
    }

    public getTile(x: number, y: number): ITile | null {
        if (this.inBounds(x, y)) {
            return this.tiles[x][y];
        }

        return null;
    }

    public nextLevel(): void {
        Hub.getInstance().publish(HUBEVENTS.NEXTLEVEL, null);
    }

    public randomPassableTile(): ITile | null {
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

    public replaceTile(x: number, y: number, newTile: ITile): void {
        if (!this.inBounds(x, y)) {
            throw "attempting to replace a tile at non-existant location";
        }

        this.tiles[x][y] = newTile;
    }

    public spawnMonster(): void {
        let monsterType = shuffle([BirdActor, SnakeActor, TankActor, EaterActor, JesterActor, TurretActor])[0];
        let monster = new monsterType(this.randomPassableTile());
        this.monsters.push(monster);
    }

    private inBounds(x: number, y: number): boolean {
        return (
            (x >= 0) &&
            (y >= 0) &&
            (x < this.width) &&
            (y < this.height)
        );
    }
}