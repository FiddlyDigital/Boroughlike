import { EFFECT_SPRITE_INDICES, numTiles } from "./constants";
import { Mapper } from "./mapper";
import { Monster } from "./monster";
import { Renderer } from "./renderer";
import { Floor } from "./tile";

export const spells = {
    WOOP: function (caster: Monster) {
        let newTile = Mapper.getInstance().randomPassableTile();
        if (newTile) {
            caster.move(newTile);
        }

    },
    QUAKE: function (caster: Monster) {
        for (let i = 0; i < numTiles; i++) {
            for (let j = 0; j < numTiles; j++) {
                let tile = Mapper.getInstance().getTile(i, j);
                if (tile && tile.monster && tile.monster != caster) {
                    let numWalls = 4 - tile.getAdjacentPassableNeighbors().length;
                    tile.monster.hit(numWalls * 2);
                }
            }
        }

        Renderer.getInstance().setShakeAmount(20);
    },
    TORNADO: function () {
        let monsters = Mapper.getInstance().getMonsters();
        for (let i = 0; i < monsters.length; i++) {
            let monster = monsters[i];
            if (monster) {
                let randomTile = Mapper.getInstance().randomPassableTile();
                if (randomTile) {
                    monster.move(randomTile);
                    monster.teleportCounter = 2;
                }
            }

        }
    },
    AURA: function (caster: Monster) {
        caster.tile.getAdjacentNeighbors().forEach(function (t) {
            if (t) {
                t.setEffect(EFFECT_SPRITE_INDICES.Heal);
                if (t.monster) {
                    t.monster.heal(1);
                }
            }
        });
        caster.tile.setEffect(EFFECT_SPRITE_INDICES.Heal);
        caster.heal(3);
    },
    DASH: function (caster: Monster) {
        let newTile = caster.tile;
        while (true) {
            let testTile = newTile.getNeighbor(caster.lastMove[0], caster.lastMove[1]);
            if (testTile && testTile.passable && !testTile.monster) {
                newTile = testTile;
            } else {
                break;
            }
        }
        if (caster.tile != newTile) {
            caster.move(newTile);
            newTile.getAdjacentNeighbors().forEach(t => {
                if (t && t.monster) {
                    t.setEffect(EFFECT_SPRITE_INDICES.Flame);
                    t.monster.stunned = true;
                    t.monster.hit(1);
                }
            });
        }
    },
    FLATTEN: function (caster: Monster) {
        for (let i = 1; i < numTiles - 1; i++) {
            for (let j = 1; j < numTiles - 1; j++) {
                let tile = Mapper.getInstance().getTile(i, j);
                if (tile && !tile.passable) {
                    Mapper.getInstance().replaceTile(i, j, Floor);
                }
            }
        }
        caster.tile.setEffect(EFFECT_SPRITE_INDICES.Flame);
        caster.heal(2);
    },
    ALCHEMY: function (caster: Monster) {
        caster.tile.getAdjacentNeighbors().forEach(function (t) {
            if (t && !t.passable && Mapper.getInstance().inBounds(t.x, t.y)) {
                Mapper.getInstance().replaceTile(t.x, t.y, Floor);
                let tile = Mapper.getInstance().getTile(t.x, t.y);
                if (tile) {
                    tile.book = true;
                }
            }
        });
    },
    POWERATTACK: function (caster: Monster) {
        caster.bonusAttack = 5;
    },
    PROTECT: function (caster: Monster) {
        caster.shield = 2;
        for (let i = 0; i < Mapper.getInstance().getMonsters().length; i++) {
            Mapper.getInstance().getMonsters()[i].stunned = true;
        }
    },
    BOLT: function (caster: Monster) {
        boltTravel(caster, caster.lastMove, 15 + Math.abs(caster.lastMove[1]), 4);
    },
    CROSS: function (caster: Monster) {
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
    EX: function (caster: Monster) {
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

function boltTravel(caster: Monster, direction: Array<number>, effect: any, damage: number) {
    let newTile = caster.tile;
    while (true) {
        let testTile = newTile.getNeighbor(direction[0], direction[1]);
        if (testTile && testTile.passable) {
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
