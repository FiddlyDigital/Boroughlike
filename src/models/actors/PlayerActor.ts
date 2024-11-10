
import { SOUNDFX } from "../../constants/enums.js";
import { MONSTER_SPRITE_INDICES } from "../../constants/spriteIndices.js";
import { Spells as ALLSPELLS } from "../spells/spell.js";
import { FloorTile } from "../tiles/FloorTile.js";
import { shuffle } from "../../utilities.js";
import { ISpell } from "../spells/ISpell.js";
import { BaseActor } from "./base/baseActor.js";

export class PlayerActor extends BaseActor {
    score: number = 0;
    spells: Array<ISpell>;

    constructor(tile: FloorTile) {
        super(tile, MONSTER_SPRITE_INDICES.Player, 3);
        this.isPlayer = true;
        this.teleportCounter = 0;
        this.spells = shuffle(ALLSPELLS)[0]; // Get starting spell
        this.hitSFX = SOUNDFX.PLAYERHIT;
    }

    update(): void {
        this.shield--;
    };

    addSpell(): void {
        let spellType = shuffle(ALLSPELLS)[0];
        if (spellType) {
            let spell = new spellType(this);
            this.spells.push(spell);
        }
    };

    castSpell(index: number): void {
        let spell: ISpell = this.spells[index];
        if (spell) {
            this.spells.splice(index, 1);
            spell.cast();
        }
    };

    incrementScore() {
        this.score++;
    }
}



