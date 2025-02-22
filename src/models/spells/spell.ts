import { HUBEVENTS } from "../../constants/enums";
import { EFFECT_SPRITE_INDICES} from "../../constants/spriteIndices";
import { numTiles } from "../../constants/values";
import { Hub } from "../../services/hub";
import { BaseSpell } from "./baseSpell";
import { FloorTile } from "../tiles/FloorTile";
import { IActor } from "../actors/base/IActor";

export class WOOP extends BaseSpell {
    public constructor(caster: IActor) {
        super(caster, "WOOP");
    }

    cast(): void {
        if (this.caster.tile === null){
            return;
        }

        super.cast();

        const newTile = this.caster.tile.map.randomPassableTile();
        if (newTile) {
            this.caster.setTile(newTile);
        }
    }
}

export class Quake extends BaseSpell {
    public constructor(caster: IActor) {
        super(caster, "Quake");
    }

    cast(): void {
        if (this.caster.tile === null){
            return;
        }

        super.cast();
        for (let i = 0; i < numTiles; i++) {
            for (let j = 0; j < numTiles; j++) {
                const tile = this.caster.tile.map.getTile(i, j);

                if (tile && tile.monster && tile.monster != this.caster) {
                    const numWalls = 4 - tile.getAdjacentPassableNeighbors().length;
                    tile.monster.hit(numWalls * 2);
                }
            }
        }

        Hub.getInstance().publish(HUBEVENTS.SETSHAKE, 20);
    }
}

export class Tornado extends BaseSpell {
    public constructor(caster: IActor) {
        super(caster, "Tornado");
    }

    cast(): void {
        if (this.caster.tile === null){
            return;
        }

        super.cast();
        const monsters = this.caster.tile.map.getMonsters();
        for (let i = 0; i < monsters.length; i++) {
            const monster = monsters[i];
            if (monster) {
                const randomTile = this.caster.tile.map.randomPassableTile();
                if (randomTile) {
                    monster.setTile(randomTile);
                    monster.teleportCounter = 2;
                }
            }
        }
    }
}

export class AURA extends BaseSpell {
    public constructor(caster: IActor) {
        super(caster, "AURA");
    }

    cast(): void {
        if (this.caster.tile === null){
            return;
        }

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
    public constructor(caster: IActor) {
        super(caster, "DASH");
    }

    cast(): void {
        if (this.caster.tile === null){
            return;
        }

        super.cast();
        let newTile = this.caster.tile;

        while (true) {
            const testTile = newTile.getNeighbor(this.caster.lastMove[0], this.caster.lastMove[1]);
            if (testTile && testTile.passable && !testTile.monster) {
                newTile = testTile;
            } else {
                break;
            }
        }

        if (this.caster.tile != newTile) {
            this.caster.setTile(newTile);
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
    public constructor(caster: IActor) {
        super(caster, "FLATTEN");
    }

    cast(): void {
        if (this.caster.tile === null){
            return;
        }

        super.cast();
        for (let i = 1; i < numTiles - 1; i++) {
            for (let j = 1; j < numTiles - 1; j++) {
                const tile = this.caster.tile.map.getTile(i, j);
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
    public constructor(caster: IActor) {
        super(caster, "ALCHEMY");
    }

    cast(): void {
        if (this.caster.tile === null){
            return;
        }

        super.cast();
        this.caster.tile.getAdjacentNeighbors().forEach(function (tile) {
            if (tile && !tile.passable) {
                tile.map.replaceTile(tile.x, tile.y, new FloorTile(tile.map, tile.x, tile.y));
            }
        });
    }
}

export class BOLT extends BaseSpell {
    public constructor(caster: IActor) {
        super(caster, "BOLT");
    }

    cast(): void {
        if (this.caster.tile === null){
            return;
        }

        super.cast();
        super.boltTravel(this.caster, this.caster.lastMove, [15 + Math.abs(this.caster.lastMove[1])], 4);
    }
}

export class CROSS extends BaseSpell {
    directions = [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0]
    ];

    public constructor(caster: IActor) {
        super(caster, "CROSS");
    }

    cast(): void {
        if (this.caster.tile === null){
            return;
        }

        super.cast();
        for (let k = 0; k < this.directions.length; k++) {
            const dirSprite = Math.abs(this.directions[k][1]) == 0 
                ? EFFECT_SPRITE_INDICES.Bolt_Horizontal 
                : EFFECT_SPRITE_INDICES.Bolt_Vertical;
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

    public constructor(caster: IActor) {
        super(caster, "EX");
    }

    cast(): void {
        if (this.caster.tile === null){
            return;
        }
        
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
    BOLT,
    CROSS,
    EX
];
