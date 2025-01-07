/* eslint-disable @typescript-eslint/no-this-alias */
import { Branches, HUBEVENTS } from "../../constants/enums";
import { Hub } from "../../services/hub";
import { IActor } from "../actors/base/IActor";
import { IMap } from "./IMap";
import { ITile } from "../tiles/base/ITile";
import { randomRange, shuffle, tryTo } from "../../utilities";
import { BirdActor } from "../actors/BirdActor";
import { SnakeActor } from "../actors/SnakeActor";
import { TankActor } from "../actors/TankActor";
import { EaterActor } from "../actors/EaterActor";
import { JesterActor } from "../actors/JestorActor";
import { TurretActor } from "../actors/TurretActor";
import { StairUpTile } from "../tiles/StairUpTile";
import { StairDownTile } from "../tiles/StairDownTile";

export class Map implements IMap {
    monsters: Array<IActor>;
    tiles: Array<Array<ITile>>;
    height: number = 0;
    width: number = 0;
    branch: string = Branches.LIBRARY;
    stairsUp: ITile | null = null;
    stairsDown: ITile | null = null;

    public constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.monsters = new Array<IActor>();
        this.tiles = new Array<Array<ITile>>();
    }

    public getStairUpTile(): ITile | null {
        return this.stairsUp;
    }

    public getStairDownTile(): ITile | null {
        return this.stairsDown;
    }

    public setStairDownTile(): ITile | null {
        const newStaircaseTile = this.randomPassableTile();
        if (newStaircaseTile) {
            this.stairsDown = new StairDownTile(this, newStaircaseTile.x, newStaircaseTile.y);
            this.replaceTile(
                newStaircaseTile.x,
                newStaircaseTile.y,
                this.stairsDown
            );
        }

        return this.getStairDownTile();
    }

    public setStairUpTile(): ITile | null {
        const newStaircaseTile = this.randomPassableTile();
        if (newStaircaseTile) {
            this.stairsUp = new StairUpTile(this, newStaircaseTile.x, newStaircaseTile.y);
            this.replaceTile(
                newStaircaseTile.x,
                newStaircaseTile.y,
                this.stairsUp
            );
        }

        return this.getStairUpTile();
    }

    public removeActor(actor: IActor): void {
        this.monsters = this.monsters.filter((m) => m !== actor);
    }

    public addActor(actor: IActor, movingUp: boolean = false): void {
        this.monsters.push(actor);

        let tileToPlaceOn = movingUp ? this.stairsDown : this.stairsUp;
        if (tileToPlaceOn === null) {
            console.log("no stairs, placing on random tile");
            tileToPlaceOn = this.randomPassableTile()
        }

        if (tileToPlaceOn !== null) {
            console.log("placing actor on tile", tileToPlaceOn);
            actor.setTile(tileToPlaceOn, true)
        }
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

    public prevLevel(): void {
        Hub.getInstance().publish(HUBEVENTS.PREVLEVEL, null);
    }

    public randomPassableTile(): ITile | null {
        const self = this;
        let tile = null;

        tryTo('get random passable tile', function () {
            const x = randomRange(0, self.width - 1);
            const y = randomRange(0, self.height - 1);
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
        const monsterType = shuffle([BirdActor, SnakeActor, TankActor, EaterActor, JesterActor, TurretActor])[0];
        const monster = new monsterType(this.randomPassableTile());
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
