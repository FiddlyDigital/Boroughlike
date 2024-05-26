import { Dictionary } from "../utilities";
import { IMap } from "./IMap";
import { ISpell } from "./ISpell";

export interface IRenderer {
    hideOverlays(): void;
    initSpriteSheet(callback: Function): void;
    showTitle(scores: Array<any>): void;
    showGameWin(scores: Array<any>): void;
    showGameLose(scores: Array<any>): void;
    updateScreen(mapperLevel: IMap): void
    updateSidebar(level: number, score: number, spells: Dictionary<ISpell>): void
}