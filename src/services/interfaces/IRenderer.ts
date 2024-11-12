/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { Dictionary } from "../../utilities";
import { IMap } from "../../models/maps/IMap";
import { ISpell } from "../../models/spells/ISpell";
import { Score } from "../../models/score";

export interface IRenderer {
    hideOverlays(): void;
    initSpriteSheet(callback: Function): void;
    showTitle(scores: Array<Score>): void;
    showGameWin(scores: Array<Score>): void;
    showGameLose(scores: Array<Score>): void;
    updateScreen(mapperLevel: IMap): void
    updateSidebar(level: number, score: number, spells: Dictionary<ISpell>): void
}
