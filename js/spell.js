const spells = {
    WOOP: function (caster) {
        caster.move(map.randomPassableTile());
    },
    QUAKE: function (caster) {        
        for (let i = 0; i < numTiles; i++) {
            for (let j = 0; j < numTiles; j++) {
                let tile = map.getTile(i, j);
                if (tile.monster && tile.monster != caster) {
                    let numWalls = 4 - tile.getAdjacentPassableNeighbors().length;
                    tile.monster.hit(numWalls * 2);
                }
            }
        }

        renderer.setShakeAmount(20);
    },
    TORNADO: function () {
        for (let i = 0; i < map.getMonsters().length; i++) {
            map.getMonsters()[i].move(map.randomPassableTile());
            map.getMonsters()[i].teleportCounter = 2;
        }
    },
    AURA: function (caster) {
        caster.tile.getAdjacentNeighbors().forEach(function (t) {
            t.setEffect(EFFECT_SPRITE_INDICES.Heal);
            if (t.monster) {
                t.monster.heal(1);
            }
        });
        caster.tile.setEffect(EFFECT_SPRITE_INDICES.Heal);
        caster.heal(3);
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
                    t.setEffect(EFFECT_SPRITE_INDICES.Flame);
                    t.monster.stunned = true;
                    t.monster.hit(1);
                }
            });
        }
    },
    FLATTEN: function (caster) {        
        for (let i = 1; i < numTiles - 1; i++) {
            for (let j = 1; j < numTiles - 1; j++) {
                let tile = map.getTile(i, j);
                if (!tile.passable) {
                    map.replaceTile(i,j, Floor);
                }
            }
        }
        caster.tile.setEffect(EFFECT_SPRITE_INDICES.Flame);
        caster.heal(2);
    },
    ALCHEMY: function (caster) {
        caster.tile.getAdjacentNeighbors().forEach(function (t) {
            if (!t.passable && map.inBounds(t.x, t.y)) {
                map.replaceTile(t.x, t.y, Floor);
                map.getTile(t.x, t.y).book = true;                
            }
        });
    },
    POWERATTACK: function (caster) {
        caster.bonusAttack = 5;
    },
    PROTECT: function (caster) {
        caster.shield = 2;
        for (let i = 0; i < map.getMonsters().length; i++) {
            map.getMonsters()[i].stunned = true;
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
            let dirSprite = Math.abs(directions[k][1]) == 0 ? EFFECT_SPRITE_INDICES.Bolt_Horizontal : EFFECT_SPRITE_INDICES.Bolt_Vertical;
            boltTravel(caster, directions[k], dirSprite, 2);
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
            boltTravel(caster, directions[k], EFFECT_SPRITE_INDICES.Flame, 3);
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
            
            newTile.setEffect(effect);
        } else {
            break;
        }
    }
}
