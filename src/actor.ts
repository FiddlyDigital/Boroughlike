import { maxHp,  } from "./constants/values.js";
import { SOUNDFX, DIRECTION, HUBEVENTS} from "./constants/enums.js";
import { EFFECT_SPRITE_INDICES, MONSTER_SPRITE_INDICES } from "./constants/spriteIndices.js";
import { Spells as ALLSPELLS } from "./spell";
import { FloorTile } from "./tile";
import { shuffle, randomRange } from "./utilities";
import { Hub } from "./hub.js";
import { IActor } from "./interfaces/IActor.js";
import { ITile } from "./interfaces/ITile.js";
import { ISpell } from "./interfaces/ISpell.js";

export abstract class BaseActor implements IActor {
    sprite: Array<number>
    hp: number;
    teleportCounter: number;
    offsetX: number;
    offsetY: number;
    lastMove: Array<number>
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
        if (this instanceof PlayerActor) {
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

export class PlayerActor extends BaseActor {
    score: number = 0;
    spells: Array<ISpell>;

    constructor(tile: FloorTile) {
        super(tile, MONSTER_SPRITE_INDICES.Player, 3);
        this.isPlayer = true;
        this.teleportCounter = 0;
        this.spells = shuffle(ALLSPELLS)[0]; // Get starting spell
        this.hitSFX = SOUNDFX.PLAYERHIT;
    }

    update(): void {
        this.shield--;
    };

    addSpell(): void {
        let spellType = shuffle(ALLSPELLS)[0];
        if (spellType) {
            let spell = new spellType(this);
            this.spells.push(spell);
        }
    };

    castSpell(index: number): void {
        let spell: ISpell = this.spells[index];
        if (spell) {
            this.spells.splice(index, 1);
            spell.cast();
        }
    };

    incrementScore() {
        this.score++;
    }
}

// Basic monster with no special behavior
export class BirdActor extends BaseActor {
    constructor(tile: FloorTile) {
        super(tile, MONSTER_SPRITE_INDICES.Bird, 3);
    }
}

// Moves twice 
export class SnakeActor extends BaseActor {
    constructor(tile: FloorTile) {
        super(tile, MONSTER_SPRITE_INDICES.Snake, 1);
    }

    act(): void {
        this.attackedThisTurn = false;
        super.act();

        if (!this.attackedThisTurn) {
            super.act();
        }
    }
}

// Moves every other turn
export class TankActor extends BaseActor {
    constructor(tile: FloorTile) {
        super(tile, MONSTER_SPRITE_INDICES.Tank, 2);
    }

    update(): void {
        let startedStunned = this.stunned;
        super.update();
        if (!startedStunned) {
            this.stunned = true;
        }
    }
}

// Destroys walls and heals by doing so
export class EaterActor extends BaseActor {
    constructor(tile: FloorTile) {
        super(tile, MONSTER_SPRITE_INDICES.Eater, 1);
    }

    act(): void {
        const neighbors = this.tile.getAdjacentNeighbors().filter(t => t && !t.passable);
        if (neighbors.length) {
            let tileToEat: ITile = shuffle(neighbors)[0];
            if (tileToEat) {
                tileToEat.map.replaceTile(tileToEat.x, tileToEat.y, new FloorTile(tileToEat.map, tileToEat.x, tileToEat.y));
                this.heal(0.5);
            }
        } else {
            super.act();
        }
    }
}

// Moves randomly
export class JesterActor extends BaseActor {
    constructor(tile: FloorTile) {
        super(tile, MONSTER_SPRITE_INDICES.Jester, 2);
    }

    act(): void {
        let neighbors = this.tile.getAdjacentPassableNeighbors();
        if (neighbors.length) {
            let randomNeighbour = shuffle(neighbors)[0]
            this.tryMove(randomNeighbour.x - this.tile.x, randomNeighbour.y - this.tile.y);
        }
    }
}

// Doesn't move. 
// Just rotates in place and shoots player (and everything else on that line) when it sees them.
export class TurretActor extends BaseActor {
    directions: Array<string>;
    currentDirection: number;

    constructor(tile: FloorTile) {
        super(tile, MONSTER_SPRITE_INDICES.Turret, 1);
        this.directions = [DIRECTION.N, DIRECTION.E, DIRECTION.S, DIRECTION.W];
        this.currentDirection = randomRange(0, 3);
    }

    act(): void {
        // Rotate 90 degrees
        this.currentDirection += 1;
        if (this.currentDirection == 4) {
            this.currentDirection = 0;
        }

        let cardinalDirection = this.directions[this.currentDirection];
        this.sprite = MONSTER_SPRITE_INDICES["Turret_" + cardinalDirection];
        var targetTiles = this.tile.getNeighborChain(cardinalDirection);

        // if the player is in LOS
        if (targetTiles.some(t => {
            return (t.monster && t.monster instanceof PlayerActor)
        })
        ) {
            // Shoot lighting at everything in that direction
            targetTiles.forEach(t => {
                if (t.monster) {
                    t.monster.hit(1);
                }

                switch (cardinalDirection) {
                    case DIRECTION.N:
                    case DIRECTION.S:
                        t.setEffect(EFFECT_SPRITE_INDICES.Bolt_Vertical);
                        break;
                    case DIRECTION.E:
                    case DIRECTION.W:
                        t.setEffect(EFFECT_SPRITE_INDICES.Bolt_Horizontal);
                        break;
                    default:
                        throw "CardinalDirection didn't have a valid value.";
                }
            })
        }
    }
}
