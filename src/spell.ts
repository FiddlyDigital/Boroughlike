import { HUBEVENTS, SOUNDFX } from "./constants/enums";
import { EFFECT_SPRITE_INDICES} from "./constants/spriteIndices";
import { numTiles } from "./constants/values";
import { BaseActor } from "./actor";
import { FloorTile } from "./tile";
import { Hub } from "./hub";

export abstract class BaseSpell {
    public caster: BaseActor;
    public name: string;

    protected constructor(caster: BaseActor, name: string) {
        this.caster = caster;
        this.name = name;
    }

    public cast(): void {
        Hub.getInstance().publish(HUBEVENTS.PLAYSOUND, SOUNDFX.SPELL);
    };

    protected boltTravel(caster: BaseActor, direction: Array<number>, effect: any, damage: number): void {
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
}

export class WOOP extends BaseSpell {
    public constructor(caster: BaseActor) {
        super(caster, "WOOP");
    }

    cast(): void {
        super.cast();
        let newTile = this.caster.tile.map.randomPassableTile();
        if (newTile) {
            this.caster.move(newTile);
        }
    }
}

export class Quake extends BaseSpell {
    public constructor(caster: BaseActor) {
        super(caster, "Quake");
    }

    cast(): void {
        super.cast();
        for (let i = 0; i < numTiles; i++) {
            for (let j = 0; j < numTiles; j++) {
                let tile = this.caster.tile.map.getTile(i, j);

                if (tile && tile.monster && tile.monster != this.caster) {
                    let numWalls = 4 - tile.getAdjacentPassableNeighbors().length;
                    tile.monster.hit(numWalls * 2);
                }
            }
        }

        Hub.getInstance().publish(HUBEVENTS.SETSHAKE, 20);
    }
}

export class Tornado extends BaseSpell {
    public constructor(caster: BaseActor) {
        super(caster, "Tornado");
    }

    cast(): void {
        super.cast();
        let monsters = this.caster.tile.map.getMonsters();
        for (let i = 0; i < monsters.length; i++) {
            let monster = monsters[i];
            if (monster) {
                let randomTile = this.caster.tile.map.randomPassableTile();
                if (randomTile) {
                    monster.move(randomTile);
                    monster.teleportCounter = 2;
                }
            }
        }
    }
}

export class AURA extends BaseSpell {
    public constructor(caster: BaseActor) {
        super(caster, "AURA");
    }

    cast(): void {
        super.cast();
        this.caster.tile.getAdjacentNeighbors().forEach(function (t) {
            if (t) {
                t.setEffect(EFFECT_SPRITE_INDICES.Heal);
                if (t.monster) {
                    t.monster.heal(1);
                }
            }
        });

        this.caster.tile.setEffect(EFFECT_SPRITE_INDICES.Heal);
        this.caster.heal(3);
    }
}

export class DASH extends BaseSpell {
    public constructor(caster: BaseActor) {
        super(caster, "DASH");
    }

    cast(): void {
        super.cast();
        let newTile = this.caster.tile;

        while (true) {
            let testTile = newTile.getNeighbor(this.caster.lastMove[0], this.caster.lastMove[1]);
            if (testTile && testTile.passable && !testTile.monster) {
                newTile = testTile;
            } else {
                break;
            }
        }

        if (this.caster.tile != newTile) {
            this.caster.move(newTile);
            newTile.getAdjacentNeighbors().forEach(t => {
                if (t && t.monster) {
                    t.setEffect(EFFECT_SPRITE_INDICES.Flame);
                    t.monster.stunned = true;
                    t.monster.hit(1);
                }
            });
        }
    }
}

export class FLATTEN extends BaseSpell {
    public constructor(caster: BaseActor) {
        super(caster, "FLATTEN");
    }

    cast(): void {
        super.cast();
        for (let i = 1; i < numTiles - 1; i++) {
            for (let j = 1; j < numTiles - 1; j++) {
                let tile = this.caster.tile.map.getTile(i, j);
                if (tile && !tile.passable) {
                    tile.map.replaceTile(i, j, new FloorTile(tile.map, i, j));
                }
            }
        }

        this.caster.tile.setEffect(EFFECT_SPRITE_INDICES.Flame);
        this.caster.heal(2);
    }
}

export class ALCHEMY extends BaseSpell {
    public constructor(caster: BaseActor) {
        super(caster, "ALCHEMY");
    }

    cast(): void {
        super.cast();
        this.caster.tile.getAdjacentNeighbors().forEach(function (tile) {
            if (tile && !tile.passable) {
                tile.map.replaceTile(tile.x, tile.y, new FloorTile(tile.map, tile.x, tile.y));
            }
        });
    }
}

export class POWERATTACK extends BaseSpell {
    public constructor(caster: BaseActor) {
        super(caster, "POWERATTACK");
    }

    cast(): void {
        super.cast();
        this.caster.bonusAttack = 5;
    }
}

export class PROTECT extends BaseSpell {
    public constructor(caster: BaseActor) {
        super(caster, "PROTECT");
    }

    cast(): void {
        super.cast();
        this.caster.shield = 2;
        let monsters = this.caster.tile.map.getMonsters();

        for (let i = 0; i < monsters.length; i++) {
            monsters[i].stunned = true;
        }
    }
}

export class BOLT extends BaseSpell {
    public constructor(caster: BaseActor) {
        super(caster, "BOLT");
    }

    cast(): void {
        super.cast();
        super.boltTravel(this.caster, this.caster.lastMove, 15 + Math.abs(this.caster.lastMove[1]), 4);
    }
}

export class CROSS extends BaseSpell {
    directions = [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0]
    ];

    public constructor(caster: BaseActor) {
        super(caster, "CROSS");
    }

    cast(): void {
        super.cast();
        for (let k = 0; k < this.directions.length; k++) {
            let dirSprite = Math.abs(this.directions[k][1]) == 0 ? EFFECT_SPRITE_INDICES.Bolt_Horizontal : EFFECT_SPRITE_INDICES.Bolt_Vertical;
            super.boltTravel(this.caster, this.directions[k], dirSprite, 2);
        }
    }
}

export class EX extends BaseSpell {
    directions = [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1]
    ];

    public constructor(caster: BaseActor) {
        super(caster, "EX");
    }

    cast(): void {
        super.cast();
        for (let k = 0; k < this.directions.length; k++) {
            super.boltTravel(this.caster, this.directions[k], EFFECT_SPRITE_INDICES.Flame, 3);
        }
    }
}

export const Spells = [
    WOOP,
    Quake,
    Tornado,
    AURA,
    DASH,
    FLATTEN,
    ALCHEMY,
    POWERATTACK,
    PROTECT,
    PROTECT,
    BOLT,
    CROSS,
    EX
];
