class Monster {
    constructor(tile, sprite, hp) {
        this.move(tile);
        this.sprite = sprite;
        this.hp = hp;
        this.teleportCounter = 2;
        this.offsetX = 0;
        this.offsetY = 0;
        this.lastMove = [-1, 0];
        this.bonusAttack = 0;
    }

    heal(damage) {
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

        neighbors = neighbors.filter(t => !t.monster || t.monster.isPlayer);

        let playerTile = GAME.getPlayerTile();

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
            renderer.drawSprite(SPRITETYPES.MONSTER, MONSTER_SPRITE_INDICES.MonsterLoad, this.getDisplayX(), this.getDisplayY());
        } else {
            renderer.drawSprite(SPRITETYPES.MONSTER, this.sprite, this.getDisplayX(), this.getDisplayY());
            this.drawHp();
        }

        this.offsetX -= Math.sign(this.offsetX) * (1 / 8);
        this.offsetY -= Math.sign(this.offsetY) * (1 / 8);
    }

    drawHp() {
        for (let i = 0; i < this.hp; i++) {
            renderer.drawSprite(
                SPRITETYPES.MONSTER,
                MONSTER_SPRITE_INDICES.HP,
                this.getDisplayX() + (i % 3) * (5 / 16),
                this.getDisplayY() - Math.floor(i / 3) * (5 / 16)
            );

        }
    }

    tryMove(dx, dy) {
        let newTile = this.tile.getNeighbor(dx, dy);
        if (newTile.passable) {
            this.lastMove = [dx, dy];

            if (!newTile.monster) {
                this.move(newTile);
            } else {
                if (this.isPlayer != newTile.monster.isPlayer) {
                    this.attackedThisTurn = true;
                    newTile.monster.stunned = true;
                    newTile.monster.hit(1 + this.bonusAttack);
                    this.bonusAttack = 0;

                    renderer.setShakeAmount(5)

                    this.offsetX = (newTile.x - this.tile.x) / 2;
                    this.offsetY = (newTile.y - this.tile.y) / 2;
                }
            }
            return true;
        }
    }

    hit(damage) {
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
            audioPlayer.playSound(SOUNDFX.PLAYERHIT);
        } else {
            audioPlayer.playSound(SOUNDFX.MONSTERHIT);
        }
    }

    die() {
        this.dead = true;
        this.tile.monster = null;
        if (this.isPlayer) {
            this.sprite = 1;
        }
    }

    move(tile) {
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

class Player extends Monster {
    constructor(tile) {
        super(tile, MONSTER_SPRITE_INDICES.Player, 3);
        this.isPlayer = true;
        this.teleportCounter = 0;
        this.spells = Utilities.shuffle(Object.keys(spells)).splice(0, numSpells);
    }

    update() {
        this.shield--;
    }

    tryMove(dx, dy) {
        if (super.tryMove(dx, dy)) {
            GAME.tick();
        }
    }

    addSpell() {
        let newSpell = Utilities.shuffle(Object.keys(spells))[0];
        this.spells.push(newSpell);
    }

    castSpell(index) {
        let spellName = this.spells[index];
        if (spellName) {
            delete this.spells[index];
            spells[spellName](this);
            audioPlayer.playSound(SOUNDFX.SPELL);
            GAME.tick();
        }
    }
}

// Basic monster with no special behavior
class Bird extends Monster {
    constructor(tile) {
        super(tile, MONSTER_SPRITE_INDICES.Bird, 3);
    }
}

// Moves twice 
class Snake extends Monster {
    constructor(tile) {
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
class Tank extends Monster {
    constructor(tile) {
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
class Eater extends Monster {
    constructor(tile) {
        super(tile, MONSTER_SPRITE_INDICES.Eater, 1);
    }

    doStuff() {
        let neighbors = this.tile.getAdjacentNeighbors().filter(t => !t.passable && map.inBounds(t.x, t.y));
        if (neighbors.length) {            
            map.replaceTile(neighbors[0].x, neighbors[0].y, Floor);            
            this.heal(0.5);
        } else {
            super.doStuff();
        }
    }
}

// Moves randomly
class Jester extends Monster {
    constructor(tile) {
        super(tile, MONSTER_SPRITE_INDICES.Jester, 2);
    }

    doStuff() {
        let neighbors = this.tile.getAdjacentPassableNeighbors();
        if (neighbors.length) {
            this.tryMove(neighbors[0].x - this.tile.x, neighbors[0].y - this.tile.y);
        }
    }
}

// Doesn't move. 
// Just rotates in place and shoots player (and everything else on that line) when it sees them.
class Turret extends Monster {
    constructor(tile) {
        super(tile, MONSTER_SPRITE_INDICES.Turret, 1);
        this.directions = ["N", "E", "S", "W"];
        this.currentDirection = Utilities.randomRange(0, 3);
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
        if (targetTiles.some(t => { return (t.monster && t.monster.isPlayer)})) {
            // Shoot lighting at everything in that direction
            targetTiles.forEach(t => {
                if (t.monster) {
                    t.monster.hit(1);
                }

                switch(cardinalDirection) {
                    case "N":
                    case "S":
                        t.setEffect(EFFECT_SPRITE_INDICES.Bolt_Vertical);
                        break;
                    case "E":
                    case "W":
                        t.setEffect(EFFECT_SPRITE_INDICES.Bolt_Horizontal);
                        break;
                }
            })
        }
    }
}