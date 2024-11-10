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
    bonusAttack: number;
    isPlayer: boolean = false;
    stunned: boolean = false;
    attackedThisTurn: boolean = false;
    shield: number = 0;
    dead: boolean = false;
    tile: ITile;
    protected hitSFX: string;

    public constructor(tile: ITile, sprite: Array<number>, hp: number) {
        this.tile = tile;
        this.isPlayer = false;
        this.stunned = false;

        this.attackedThisTurn = false;
        this.shield = 0;
        this.dead = false;

        this.move(tile);
        this.sprite = sprite;
        this.hp = hp;
        this.teleportCounter = 2;
        this.offsetX = 0;
        this.offsetY = 0;
        this.lastMove = [-1, 0];
        this.bonusAttack = 0;

        this.hitSFX = SOUNDFX.MONSTERHIT;

    }

    public heal(damage: number): void {
        this.hp = Math.min(maxHp, this.hp + damage);
        Hub.getInstance().publish(HUBEVENTS.PLAYSOUND, SOUNDFX.PLAYERHEAL);
    }

    public update(): void {
        this.teleportCounter--;
        if (this.stunned || this.teleportCounter > 0) {
            this.stunned = false;
            return;
        }

        this.act();
    }

    protected act(): void {
        let neighbors = this.tile.getAdjacentPassableNeighbors().filter(t => t && (!t.monster || t.monster.isPlayer));
        if (neighbors.length) {
            // get the closest tile to the player
            neighbors.sort((a, b) => a.dist(this.tile) - b.dist(this.tile));
            this.tryMove(neighbors[0].x - this.tile.x, neighbors[0].y - this.tile.y);
        }
    }

    public getDisplayX(): number {
        return this.tile.x + this.offsetX;
    }

    public getDisplayY(): number {
        return this.tile.y + this.offsetY;
    }

    public tryMove(dx: number, dy: number): boolean {
        let newTile = this.tile.getNeighbor(dx, dy);
        if (newTile && newTile.passable) {
            this.lastMove = [dx, dy];

            if (!newTile.monster) {
                this.move(newTile);
            } else {
                if (this.isPlayer != newTile.monster.isPlayer) {
                    this.attackedThisTurn = true;
                    newTile.monster.stunned = true;
                    newTile.monster.hit(1 + this.bonusAttack);
                    this.bonusAttack = 0;

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

        if (this.shield > 0) {
            return;
        }

        this.hp -= damage;
        if (this.hp <= 0) {
            this.die();

            if (this.tile instanceof FloorTile) {
                this.tile.book = true;
            }
        }
    }

    private die(): void {
        this.dead = true;
        this.tile.monster = null;
        if (this.isPlayer) {
            this.sprite = MONSTER_SPRITE_INDICES.Player_Dead;
        }
    }

    public move(tile: ITile): void {
        if (this.tile) {
            this.tile.monster = null;
            this.offsetX = this.tile.x - tile.x;
            this.offsetY = this.tile.y - tile.y;

            this.tile = tile;
            tile.monster = this;
            tile.stepOn(this);
        }
    }
}