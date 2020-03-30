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
        renderer.drawSprite(SPRITETYPES.TILE, this.sprite, this.x, this.y);

        if (this.book) {
            renderer.drawSprite(SPRITETYPES.ITEMS, ITEM_SPRITE_INDICES.Book, this.x, this.y);
        }

        if (this.effectCounter) {
            this.effectCounter--;

            renderer.drawSprite(SPRITETYPES.EFFECT, this.effect, this.x, this.y, this.effectCounter);
        }
    }

    setEffect(effectSprite) {
        this.effect = effectSprite;
        this.effectCounter = 30;
    }
}

class Floor extends Tile {
    constructor(x, y) {
        super(x, y, TILE_SPRITE_INDICES.Floor, true);
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
        super(x, y, TILE_SPRITE_INDICES.Wall, false);
    }
}

// Brings Player to the next level
class StairDown extends Tile {
    constructor(x, y) {
        super(x, y, TILE_SPRITE_INDICES.StairDown, true);
    }

    stepOn(monster) {
        if (monster.isPlayer) {
            GAME.nextLevel();
        }
    }
}

class StairUp extends Tile {
    constructor(x, y) {
        super(x, y, TILE_SPRITE_INDICES.StairUp, true);
    }

    stepOn(monster) {
        if (monster.isPlayer) {
            GAME.previousLevel();
        }
    }
}

// When stepped on deals damage
// Affects monsters, so can be used tactically
class SpikePit extends Tile {
    constructor(x, y) {
        super(x, y, TILE_SPRITE_INDICES.SpikePit, true);
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
        super(x, y, TILE_SPRITE_INDICES.FountainActive, true);
        this.isActive = true;
    };

    stepOn(monster) {
        if (this.isActive && monster.isPlayer) {
            this.isActive = false;
            this.sprite = TILE_SPRITE_INDICES.FountainInactive;
            monster.heal(10);
        }
    }
}