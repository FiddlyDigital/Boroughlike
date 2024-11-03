
import { SOUNDFX, DIRECTION} from "../../constants/enums.js";
import { EFFECT_SPRITE_INDICES, MONSTER_SPRITE_INDICES } from "../../constants/spriteIndices.js";
import { Spells as ALLSPELLS } from "../spells/spell.js";
import { FloorTile } from "../tiles/tile.js";
import { shuffle, randomRange } from "../../utilities.js";
import { ITile } from "../tiles/ITile.js";
import { ISpell } from "../spells/ISpell.js";
import { BaseActor } from "./baseActor.js";

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
