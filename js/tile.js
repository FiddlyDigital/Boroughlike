class Tile {
    constructor(x, y, sprite, passable) {
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.passable = passable;
    }

    replace(newTileType) {
        tiles[this.x][this.y] = new newTileType(this.x, this.y);
        return tiles[this.x][this.y];
    }

    dist(other) {
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
    }

    getNeighbor(dx, dy) {
        return MAP.getTile(this.x + dx, this.y + dy)
    }

    getAdjacentNeighbors() {
        return Utilities.shuffle([
            this.getNeighbor(0, -1),
            this.getNeighbor(0, 1),
            this.getNeighbor(-1, 0),
            this.getNeighbor(1, 0)
        ]);
    }

    getAdjacentPassableNeighbors() {
        return this.getAdjacentNeighbors().filter(t => t.passable);
    }

    getConnectedTiles() {
        let connectedTiles = [this];
        let frontier = [this];
        while (frontier.length) {
            let neighbors = frontier.pop()
                .getAdjacentPassableNeighbors()
                .filter(t => !connectedTiles.includes(t));
            connectedTiles = connectedTiles.concat(neighbors);
            frontier = frontier.concat(neighbors);
        }
        return connectedTiles;
    }

    draw() {
        renderer.drawSprite(this.sprite, this.x, this.y);

        if (this.book) {
            renderer.drawSprite(12, this.x, this.y);
        }

        if (this.effectCounter) {
            this.effectCounter--;

            renderer.drawSprite(this.effect, this.x, this.y, this.effectCounter);
        }
    }

    setEffect(effectSprite) {
        this.effect = effectSprite;
        this.effectCounter = 30;
    }
}

class Floor extends Tile {
    constructor(x, y) {
        super(x, y, 2, true);
    };

    stepOn(monster) {
        if (monster.isPlayer && this.book) {
            GAME.incrementScore();
            this.book = false;
        }
    }
}

class Wall extends Tile {
    constructor(x, y) {
        super(x, y, 3, false);
    }
}

// Brings Player to the next level
class Exit extends Tile {
    constructor(x, y) {
        super(x, y, 11, true);
    }

    stepOn(monster) {
        if (monster.isPlayer) {
            GAME.nextLevel();
        }
    }
}

// When stepped on deals damage
// Affects monsters, so can be used tactically
class SpikePit extends Tile {
    constructor(x, y) {
        super(x, y, 17, true);
    };

    stepOn(monster) {
        if (monster.isPlayer){
            renderer.setShakeAmount(5);
        }
        monster.hit(1);
    }
}

// When stepped on brings Player back to full-health.
// Can only be used once, and Monsters can't use them.
class Fountain extends Tile {
    constructor(x, y) {
        super(x, y, 18, true);
        this.isActive = true;
    };

    stepOn(monster) {
        if (this.isActive && monster.isPlayer) {
            this.isActive = false;
            this.sprite = 19;
            monster.heal(10);
        }
    }
}