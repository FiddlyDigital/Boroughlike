import { Dictionary } from "../utilities";
import { ISpell } from "./ISpell";
import { ITile } from "./ITile";

export interface IRenderer {
    checkAllSpriteSheetsLoaded() : void;
    clearCanvas() : void;
    drawDarkBackground() : void;
    drawScores(scores: Array<any>) : void
    drawTile(tile: ITile) : void;        
    getSpriteSheet(spriteType: string): HTMLImageElement;
    hideOverlays() : void;
    initSpriteSheet(callback: Function): void;
    screenshake() : void;
    setShakeAmount(amt: number) : void;
    showTitle(scores: Array<any>) : void;
    showGameWin(scores: Array<any>) : void;
    showGameLose(scores: Array<any>) : void;
    updateSidebar(level: number, score: number, spells: Dictionary<ISpell>) : void
}