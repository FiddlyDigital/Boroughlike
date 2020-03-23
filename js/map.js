const MAP = (function () {    
    var monsters = [];
    var numTiles = 0;
    var level = 1;

    function getMonsters() {
        return monsters;
    }

    function generateLevel(nt, lvl) {
        numTiles = nt;
        level = lvl;

        UTILITIES.tryTo('generate map', function () {
            return generateTiles() == randomPassableTile().getConnectedTiles().length;
        });

        generateMonsters();

        for (let i = 0; i < 3; i++) {
            randomPassableTile().treasure = true;
        }
    }

    function generateTiles() {
        let passableTiles = 0;
        tiles = [];
        for (let i = 0; i < numTiles; i++) {
            tiles[i] = [];
            for (let j = 0; j < numTiles; j++) {
                if (Math.random() < 0.3 || !inBounds(i, j)) {
                    tiles[i][j] = new Wall(i, j);
                } else {
                    tiles[i][j] = new Floor(i, j);
                    passableTiles++;
                }
            }
        }
        return passableTiles;
    }

    function inBounds(x, y) {
        return x > 0 && y > 0 && x < numTiles - 1 && y < numTiles - 1;
    }

    function getTile(x, y) {
        if (inBounds(x, y)) {
            return tiles[x][y];
        } else {
            return new Wall(x, y);
        }
    }

    function randomPassableTile() {
        let tile;
        UTILITIES.tryTo('get random passable tile', function () {
            let x = UTILITIES.randomRange(0, numTiles - 1);
            let y = UTILITIES.randomRange(0, numTiles - 1);
            tile = getTile(x, y);
            return tile.passable && !tile.monster;
        });
        return tile;
    }

    function generateMonsters() {
        monsters = [];
        let numMonsters = level + 1;
        for (let i = 0; i < numMonsters; i++) {
            spawnMonster();
        }
    }

    function spawnMonster() {
        let monsterType = UTILITIES.shuffle([Bird, Snake, Tank, Eater, Jester])[0];
        let monster = new monsterType(randomPassableTile());
        monsters.push(monster);
    }

    return {
        getMonsters: getMonsters,
        generateLevel: generateLevel,
        inBounds: inBounds,
        getTile: getTile,
        randomPassableTile: randomPassableTile,
        spawnMonster: spawnMonster
    }
}());
