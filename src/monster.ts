import { maxHp, SOUNDFX, SPRITETYPES, EFFECT_SPRITE_INDICES, MONSTER_SPRITE_INDICES } from "./constants.js";
import { AudioPlayer} from "./audioPlayer";
import Game from './game';
import { Mapper } from "./mapper";
import { Renderer} from "./renderer";
import { spells } from "./spell";
import { Floor, Tile } from "./tile";
import { shuffle, randomRange, Dictionary } from "./utilities";

export class Monster {
    sprite: Array<number>
    hp: number;
    teleportCounter: number;
    offsetX: number;
    offsetY: number;
    lastMove: Array<number>
    bonusAttack: number;
    isPlayer: boolean;
    stunned: boolean;
    attackedThisTurn: boolean;
    shield: number;
    dead: boolean;
    tile: Floor;

    constructor(tile: Floor, sprite: Array<number>, hp: number) {        
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
        
    }

    heal(damage: number) {
        this.hp = Math.min(maxHp, this.hp + damage);

        if (this.isPlayer) {
            //audioPlayer.playSound(SOUNDFX.PLAYERHEAL);
        }
    }

    update() {
        this.teleportCounter--;
        if (this.stunned || this.teleportCounter > 0) {
            this.stunned = false;
            return;
        }

        this.doStuff();
    }

    doStuff() {
        let neighbors = this.tile.getAdjacentPassableNeighbors();

        neighbors = neighbors.filter(t => t && (!t.monster || t.monster.isPlayer));

        let playerTile = Game.getInstance().getPlayerTile();

        if (neighbors.length) {
            neighbors.sort((a, b) => a.dist(playerTile) - b.dist(playerTile));
            let newTile = neighbors[0];
            this.tryMove(newTile.x - this.tile.x, newTile.y - this.tile.y);
        }
    }

    getDisplayX() {
        return this.tile.x + this.offsetX;
    }

    getDisplayY() {
        return this.tile.y + this.offsetY;
    }

    draw() {
        if (this.teleportCounter > 0) {
            Renderer.getInstance().drawSprite(SPRITETYPES.MONSTER, MONSTER_SPRITE_INDICES.MonsterLoad, this.getDisplayX(), this.getDisplayY());
        } else {
            Renderer.getInstance().drawSprite(SPRITETYPES.MONSTER, this.sprite, this.getDisplayX(), this.getDisplayY());
            this.drawHp();
        }

        this.offsetX -= Math.sign(this.offsetX) * (1 / 8);
        this.offsetY -= Math.sign(this.offsetY) * (1 / 8);
    }

    drawHp() {
        for (let i = 0; i < this.hp; i++) {
            Renderer.getInstance().drawSprite(
                SPRITETYPES.MONSTER,
                MONSTER_SPRITE_INDICES.HP,
                this.getDisplayX() + (i % 3) * (5 / 16),
                this.getDisplayY() - Math.floor(i / 3) * (5 / 16)
            );

        }
    }

    tryMove(dx: number, dy: number) : boolean {
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

                    Renderer.getInstance().setShakeAmount(5)

                    this.offsetX = (newTile.x - this.tile.x) / 2;
                    this.offsetY = (newTile.y - this.tile.y) / 2;
                }
            }
            return true;
        }

        return false;
    }

    hit(damage: number) {
        if (this.shield > 0) {
            return;
        }

        this.hp -= damage;
        if (this.hp <= 0) {
            this.die();

            if (this.tile instanceof Floor) {
                this.tile.book = true;
            }
        }

        if (this.isPlayer) {
            AudioPlayer.getInstance().playSound(SOUNDFX.PLAYERHIT);
        } else {
            AudioPlayer.getInstance().playSound(SOUNDFX.MONSTERHIT);
        }
    }

    die() {
        this.dead = true;
        this.tile.monster = null;
        if (this.isPlayer) {
            this.sprite = MONSTER_SPRITE_INDICES.Player_Dead;
        }
    }

    move(tile: Floor) {
        if (this.tile) {
            this.tile.monster = null;
            this.offsetX = this.tile.x - tile.x;
            this.offsetY = this.tile.y - tile.y;
        }

        this.tile = tile;
        tile.monster = this;
        tile.stepOn(this);
    }
}

export class Player extends Monster {
    spells: Dictionary<any>;

    constructor(tile: Floor) {
        super(tile, MONSTER_SPRITE_INDICES.Player, 3);
        this.isPlayer = true;
        this.teleportCounter = 0;
        this.spells = shuffle(Object.keys(spells)).splice(0, Game.getInstance().props.numSpells);
    }

    update() {
        this.shield--;
    };

    tryMove(dx: number, dy: number) : boolean {
        if (super.tryMove(dx, dy)) {
            Game.getInstance().tick();
            return true;
        }

        return false;
    }

    addSpell() {
        let newSpell = shuffle(Object.keys(spells))[0];
        this.spells.push(newSpell);
    };

    castSpell(index: number) {
        let spellName : string = this.spells[index];
        if (spellName) {
            this.spells.splice(index, 1);
            this.spells[spellName](this);
            AudioPlayer.getInstance().playSound(SOUNDFX.SPELL);
            Game.getInstance().tick();
        }
    };
}

// Basic monster with no special behavior
export class Bird extends Monster {
    constructor(tile: Floor) {
        super(tile, MONSTER_SPRITE_INDICES.Bird, 3);
    }
}

// Moves twice 
export class Snake extends Monster {
    constructor(tile: Floor) {
        super(tile, MONSTER_SPRITE_INDICES.Snake, 1);
    }

    doStuff() {
        this.attackedThisTurn = false;
        super.doStuff();

        if (!this.attackedThisTurn) {
            super.doStuff();
        }
    }
}

// Moves every other turn
export class Tank extends Monster {
    constructor(tile: Floor) {
        super(tile, MONSTER_SPRITE_INDICES.Tank, 2);
    }

    update() {
        let startedStunned = this.stunned;
        super.update();
        if (!startedStunned) {
            this.stunned = true;
        }
    }
}

// Destroys walls and heals by doing so
export class Eater extends Monster {
    constructor(tile: Floor) {
        super(tile, MONSTER_SPRITE_INDICES.Eater, 1);
    }

    doStuff() {
        let neighbors = this.tile.getAdjacentNeighbors().filter(t => t && !t.passable && Mapper.getInstance().inBounds(t.x, t.y));
        if (neighbors.length) {
            Mapper.getInstance().replaceTile(neighbors[0].x, neighbors[0].y, Floor);
            this.heal(0.5);
        } else {
            super.doStuff();
        }
    }
}

// Moves randomly
export class Jester extends Monster {
    constructor(tile: Floor) {
        super(tile, MONSTER_SPRITE_INDICES.Jester, 2);
    }

    doStuff() {
        let neighbors = shuffle(this.tile.getAdjacentPassableNeighbors());
        if (neighbors.length) {
            this.tryMove(neighbors[0].x - this.tile.x, neighbors[0].y - this.tile.y);
        }
    }
}

// Doesn't move. 
// Just rotates in place and shoots player (and everything else on that line) when it sees them.
export class Turret extends Monster {
    directions: Array<string>;
    currentDirection: number;

    constructor(tile: Floor) {
        super(tile, MONSTER_SPRITE_INDICES.Turret, 1);
        this.directions = ["N", "E", "S", "W"];
        this.currentDirection = randomRange(0, 3);
    }

    doStuff() {
        // Rotate 90 degrees
        this.currentDirection += 1;
        if (this.currentDirection == 4) {
            this.currentDirection = 0;
        }

        let cardinalDirection = this.directions[this.currentDirection];
        this.sprite = MONSTER_SPRITE_INDICES["Turret_" + cardinalDirection];
        var targetTiles = this.tile.getNeighbourChain(cardinalDirection);

        // if the player is in LOS
        if (targetTiles.some(t => { return (t && t.monster && t.monster.isPlayer) })) {
            // Shoot lighting at everything in that direction
            targetTiles.forEach(t => {
                if (t) {
                    if (t.monster) {
                        t.monster.hit(1);
                    }

                    switch (cardinalDirection) {
                        case "N":
                        case "S":
                            t.setEffect(EFFECT_SPRITE_INDICES.Bolt_Vertical);
                            break;
                        case "E":
                        case "W":
                            t.setEffect(EFFECT_SPRITE_INDICES.Bolt_Horizontal);
                            break;
                    }
                }
            })
        }
    }
}