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
        this.hp = Math.min(GAME.getMaxHP(), this.hp + damage);
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
            renderer.drawSprite(10, this.getDisplayX(), this.getDisplayY());
        } else {
            renderer.drawSprite(this.sprite, this.getDisplayX(), this.getDisplayY());
            this.drawHp();
        }

        this.offsetX -= Math.sign(this.offsetX) * (1 / 8);
        this.offsetY -= Math.sign(this.offsetY) * (1 / 8);
    }

    drawHp() {
        for (let i = 0; i < this.hp; i++) {
            renderer.drawSprite(
                9,
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
        super(tile, 0, 3);
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
        super(tile, 4, 3);
    }
}

// Moves twice 
class Snake extends Monster {
    constructor(tile) {
        super(tile, 5, 1);
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
        super(tile, 6, 2);
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
        super(tile, 7, 1);
    }

    doStuff() {
        let neighbors = this.tile.getAdjacentNeighbors().filter(t => !t.passable && MAP.inBounds(t.x, t.y));
        if (neighbors.length) {
            neighbors[0].replace(Floor);
            this.heal(0.5);
        } else {
            super.doStuff();
        }
    }
}

// Moves randomly
class Jester extends Monster {
    constructor(tile) {
        super(tile, 8, 2);
    }

    doStuff() {
        let neighbors = this.tile.getAdjacentPassableNeighbors();
        if (neighbors.length) {
            this.tryMove(neighbors[0].x - this.tile.x, neighbors[0].y - this.tile.y);
        }
    }
}
