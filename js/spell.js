const spells = {
    WOOP: function (caster) {
        caster.move(MAP.randomPassableTile());
    },
    QUAKE: function (caster) {        
        for (let i = 0; i < numTiles; i++) {
            for (let j = 0; j < numTiles; j++) {
                let tile = MAP.getTile(i, j);
                if (tile.monster && tile.monster != caster) {
                    let numWalls = 4 - tile.getAdjacentPassableNeighbors().length;
                    tile.monster.hit(numWalls * 2);
                }
            }
        }

        renderer.setShakeAmount(20);
    },
    MAELSTROM: function () {
        for (let i = 0; i < MAP.getMonsters().length; i++) {
            MAP.getMonsters()[i].move(MAP.randomPassableTile());
            MAP.getMonsters()[i].teleportCounter = 2;
        }
    },
    AURA: function (caster) {
        caster.tile.getAdjacentNeighbors().forEach(function (t) {
            t.setEffect(13);
            if (t.monster) {
                t.monster.heal(1);
            }
        });
        caster.tile.setEffect(13);
        caster.heal(1);
    },
    DASH: function (caster) {
        let newTile = caster.tile;
        while (true) {
            let testTile = newTile.getNeighbor(caster.lastMove[0], caster.lastMove[1]);
            if (testTile.passable && !testTile.monster) {
                newTile = testTile;
            } else {
                break;
            }
        }
        if (caster.tile != newTile) {
            caster.move(newTile);
            newTile.getAdjacentNeighbors().forEach(t => {
                if (t.monster) {
                    t.setEffect(14);
                    t.monster.stunned = true;
                    t.monster.hit(1);
                }
            });
        }
    },
    DIG: function (caster) {        
        for (let i = 1; i < numTiles - 1; i++) {
            for (let j = 1; j < numTiles - 1; j++) {
                let tile = MAP.getTile(i, j);
                if (!tile.passable) {
                    tile.replace(Floor);
                }
            }
        }
        caster.tile.setEffect(13);
        caster.heal(2);
    },
    KINGMAKER: function () {
        for (let i = 0; i < MAP.getMonsters().length; i++) {
            MAP.getMonsters()[i].heal(1);
            MAP.getMonsters()[i].tile.book = true;
        }
    },
    ALCHEMY: function (caster) {
        caster.tile.getAdjacentNeighbors().forEach(function (t) {
            if (!t.passable && MAP.inBounds(t.x, t.y)) {
                t.replace(Floor).book = true;
            }
        });
    },
    POWER: function (caster) {
        caster.bonusAttack = 5;
    },
    BUBBLE: function (caster) {
        for (let i = caster.spells.length - 1; i > 0; i--) {
            if (!caster.spells[i]) {
                caster.spells[i] = caster.spells[i - 1];
            }
        }
    },
    BRAVERY: function (caster) {
        caster.shield = 2;
        for (let i = 0; i < MAP.getMonsters().length; i++) {
            MAP.getMonsters()[i].stunned = true;
        }
    },
    BOLT: function (caster) {
        boltTravel(caster, caster.lastMove, 15 + Math.abs(caster.lastMove[1]), 4);
    },
    CROSS: function (caster) {
        let directions = [
            [0, -1],
            [0, 1],
            [-1, 0],
            [1, 0]
        ];
        for (let k = 0; k < directions.length; k++) {
            boltTravel(caster, directions[k], 15 + Math.abs(directions[k][1]), 2);
        }
    },
    EX: function (caster) {
        let directions = [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1]
        ];
        for (let k = 0; k < directions.length; k++) {
            boltTravel(caster, directions[k], 14, 3);
        }
    }
};

function boltTravel(caster, direction, effect, damage) {
    let newTile = caster.tile;
    while (true) {
        let testTile = newTile.getNeighbor(direction[0], direction[1]);
        if (testTile.passable) {
            newTile = testTile;
            if (newTile.monster) {
                newTile.monster.hit(damage);
            }
            console.log(effect);
            newTile.setEffect(effect);
        } else {
            break;
        }
    }
}
