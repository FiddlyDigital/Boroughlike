import { Dictionary } from "../utilities";
import { IMap } from "./IMap";
import { ISpell } from "./ISpell";

export interface IRenderer {
    checkAllSpriteSheetsLoaded(): void;
    drawDarkBackground(): void;
    drawScores(scores: Array<any>): void;
    getSpriteSheet(spriteType: string): HTMLImageElement;
    hideOverlays(): void;
    initSpriteSheet(callback: Function): void;
    showTitle(scores: Array<any>): void;
    showGameWin(scores: Array<any>): void;
    showGameLose(scores: Array<any>): void;
    updateScreen(mapperLevel: IMap): void
    updateSidebar(level: number, score: number, spells: Dictionary<ISpell>): void
}