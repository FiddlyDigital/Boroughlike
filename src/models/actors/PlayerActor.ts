
import { SOUNDFX } from "../../constants/enums.js";
import { MONSTER_SPRITE_INDICES } from "../../constants/spriteIndices.js";
import { Spells as ALLSPELLS } from "../spells/spell.js";
import { shuffle } from "../../utilities.js";
import { ISpell } from "../spells/ISpell.js";
import { BaseActor } from "./base/baseActor.js";
import { startingHp } from "../../constants/values.js";
import { ITile } from "../tiles/base/ITile.js";

export class PlayerActor extends BaseActor {
    score: number = 0;
    spells: Array<ISpell>;

    constructor(tile: ITile | null) {
        super(tile, MONSTER_SPRITE_INDICES.Player, 3);
        this.hp = startingHp;
        this.isPlayer = true;
        this.teleportCounter = 0;
        this.spells = shuffle(ALLSPELLS)[0]; // Get starting spell
        this.hitSFX = SOUNDFX.PLAYERHIT;
    }

    public tickUpdate(): void {
    };

    public activateTile(): void {
        if (this.tile) {
            this.tile.activate(this);
        }
    }
}
