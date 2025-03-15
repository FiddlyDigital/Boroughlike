import { HUBEVENTS, SOUNDFX } from "../../../constants/enums";
import { MONSTER_SPRITE_INDICES } from "../../../constants/spriteIndices";
import { maxHp } from "../../../constants/values";
import { Hub } from "../../../services/hub";
import { ITile } from "../../tiles/base/ITile";
import { FloorTile } from "../../tiles/FloorTile";
import { IActor } from "./IActor";

export abstract class BaseActor implements IActor {
    sprite: Array<number>
    hp: number;
    teleportCounter: number;
    offsetX: number;
    offsetY: number;
    lastMove: Array<number>;
    isPlayer: boolean = false;
    stunned: boolean = false;
    attackedThisTurn: boolean = false;
    tile: ITile | null;
    protected hitSFX: string;

    public constructor(tile: ITile | null, sprite: Array<number>, hp: number) {
        this.tile = tile;
        this.isPlayer = false;
        this.stunned = false;

        this.attackedThisTurn = false;

        if (tile !== null) {
            this.setTile(tile);
        }
        
        this.sprite = sprite;
        this.hp = hp;
        this.teleportCounter = 2;
        this.offsetX = 0;
        this.offsetY = 0;
        this.lastMove = [0, 0];
        this.hitSFX = SOUNDFX.MONSTERHIT;
    }

    public heal(damage: number): void {
        this.hp = Math.min(maxHp, this.hp + damage);
        Hub.getInstance().publish(HUBEVENTS.PLAYSOUND, SOUNDFX.PLAYERHEAL);
    }

    public isDead() : boolean
    {
        return this.hp == 0;
    }

    public tickUpdate(): void {
        this.teleportCounter--;

        if (this.stunned || this.teleportCounter > 0) {
            this.stunned = false;
            return;
        }

        this.act();
    }

    protected act(): void {
        if (this.tile === null) {
            return;
        }

        const neighbors = this.tile.getAdjacentPassableNeighbors().filter(t => t && (!t.monster || t.monster.isPlayer));
        if (neighbors.length) {
            // get the closest tile to the player
            neighbors.sort((a, b) => a.dist(this.tile as ITile) - b.dist(this.tile as ITile));
            this.tryMove(neighbors[0].x - this.tile.x, neighbors[0].y - this.tile.y);
        }
    }

    public getDisplayX(): number {
        if (this.tile === null) {
            return -1;
        }

        return this.tile.x + this.offsetX;
    }

    public getDisplayY(): number {
        if (this.tile === null) {
            return -1;
        }

        return this.tile.y + this.offsetY;
    }

    public tryMove(dx: number, dy: number): boolean {
        if (this.tile === null) {
            return false;
        }

        const newTile = this.tile.getNeighbor(dx, dy);
        if (newTile && newTile.passable) {
            this.lastMove = [dx, dy];

            if (!newTile.monster) {
                this.setTile(newTile);
            } else {
                if (this.isPlayer != newTile.monster.isPlayer) {
                    this.attackedThisTurn = true;
                    newTile.monster.stunned = true;
                    newTile.monster.hit(1);

                    Hub.getInstance().publish(HUBEVENTS.SETSHAKE, 5);

                    this.offsetX = (newTile.x - this.tile.x) / 2;
                    this.offsetY = (newTile.y - this.tile.y) / 2;
                }
            }

            return true;
        }

        return false;
    }

    public hit(damage: number): void {
        Hub.getInstance().publish(HUBEVENTS.PLAYSOUND, this.hitSFX);

        this.hp -= damage;
        if (this.hp <= 0) {
            this.die();

            if (this.tile instanceof FloorTile) {
                this.tile.book = true;
            }
        }
    }

    private die(): void {        
        if (this.tile !== null) {
            this.tile.monster = null;
        }

        if (this.isPlayer) {
            this.sprite = MONSTER_SPRITE_INDICES.Player_Dead;
        }
    }

    public setTile(newTile: ITile, newMap: boolean = false): void {
        if (this.tile !== null) {
            this.tile.monster = null;

            if (newMap) {
                this.offsetX = 0;
                this.offsetY = 0;
            }
            else {
                this.offsetX = this.tile.x - newTile.x;
                this.offsetY = this.tile.y - newTile.y;
            }
        }

        this.tile = newTile;
        newTile.monster = this;
        newTile.stepOn(this);
    }
}