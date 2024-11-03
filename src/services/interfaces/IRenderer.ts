import { Dictionary } from "../../utilities";
import { IMap } from "../../models/maps/IMap";
import { ISpell } from "../../models/spells/ISpell";

export interface IRenderer {
    hideOverlays(): void;
    initSpriteSheet(callback: Function): void;
    showTitle(scores: Array<any>): void;
    showGameWin(scores: Array<any>): void;
    showGameLose(scores: Array<any>): void;
    updateScreen(mapperLevel: IMap): void
    updateSidebar(level: number, score: number, spells: Dictionary<ISpell>): void
}
