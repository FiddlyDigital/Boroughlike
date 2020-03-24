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
        return UTILITIES.shuffle([
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
        RENDERER.drawSprite(this.sprite, this.x, this.y);

        if (this.treasure) {
            RENDERER.drawSprite(12, this.x, this.y);
        }

        if (this.effectCounter) {
            this.effectCounter--;
            
            RENDERER.drawSprite(this.effect, this.x, this.y, this.effectCounter);
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
        if (monster.isPlayer && this.treasure) {
            GAME.incrementScore();
            this.treasure = false;
        }
    }
}

class Wall extends Tile {
    constructor(x, y) {
        super(x, y, 3, false);
    }
}

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