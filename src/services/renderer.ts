/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { HUBEVENTS, SPRITETYPES } from '../constants/enums';
import { ITEM_SPRITE_INDICES, MONSTER_SPRITE_INDICES } from '../constants/spriteIndices';
import { numTilesInViewport, tileRenderSizePX, refreshRate, imgAssetPath, alternateSpriteTimeMS } from '../constants/values';
import { Dictionary } from '../utilities';
import { Hub } from './hub';
import { singleton } from 'tsyringe';
import { ITile } from '../models/tiles/base/ITile';
import { ISpell } from '../models/spells/ISpell';
import { IRenderer } from './interfaces/IRenderer';
import { IActor } from '../models/actors/base/IActor';
import { IMap } from '../models/maps/IMap';
import { Shake } from '../models/shake';
import { Score } from '../models/score';

@singleton()
export class Renderer implements IRenderer {
    shake: Shake;
    monsterSpriteSheet: HTMLImageElement;
    tileSpriteSheet: HTMLImageElement;
    effectSpriteSheet: HTMLImageElement;
    itemSpriteSheet: HTMLImageElement;
    onLoadCompletedCallback: Function | null;
    playerLocationElem: HTMLElement;
    playerBooksElem: HTMLElement;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    lastAlternateSpriteTimeMS: number;
    showAlternateSprites: boolean = false;
    viewportWidth: number = numTilesInViewport;
    viewportHeight: number = numTilesInViewport;
    viewportX: number = 0;
    viewportY: number = 0;
    map: IMap | null = null;

    public constructor() {
        this.lastAlternateSpriteTimeMS = Date.now();

        this.monsterSpriteSheet = new Image();
        this.tileSpriteSheet = new Image();
        this.effectSpriteSheet = new Image();
        this.itemSpriteSheet = new Image();

        this.onLoadCompletedCallback = null;

        const playerLocElemTemp = document.getElementById("playerLocation");
        if (playerLocElemTemp) {
            this.playerLocationElem = playerLocElemTemp;
        } else {
            throw "can't load pleyer location elem";
        }

        const playerBooksElemTemp = document.getElementById("playerBooks")
        if (playerBooksElemTemp) {
            this.playerBooksElem = playerBooksElemTemp;
        } else {
            throw "can't load Player Books elem";
        }

        this.shake = new Shake();

        const canvasTemp = document.querySelector("canvas");
        if (canvasTemp) {
            this.canvas = canvasTemp;
            const ctxtemp = this.canvas.getContext("2d");
            if (ctxtemp) {
                this.ctx = ctxtemp;
            }
            else {
                throw "Ctx can't load";
            }
        } else {
            throw "Canvas can't load";
        }
        this.setupCanvas();

        Hub.getInstance().subscribe(HUBEVENTS.SETSHAKE, this.setShakeAmount.bind(this));
    }

    // TODO: Async
    public initSpriteSheet(callback: Function): void {
        this.onLoadCompletedCallback = callback; // store for later

        this.monsterSpriteSheet.onload = this.checkAllSpriteSheetsLoaded.bind(this);
        this.tileSpriteSheet.onload = this.checkAllSpriteSheetsLoaded.bind(this);
        this.effectSpriteSheet.onload = this.checkAllSpriteSheetsLoaded.bind(this);
        this.itemSpriteSheet.onload = this.checkAllSpriteSheetsLoaded.bind(this);

        this.monsterSpriteSheet.src = imgAssetPath + "monsters1.png"; // "monsters2.png"
        this.tileSpriteSheet.src = imgAssetPath + "library_new.png";
        this.effectSpriteSheet.src = imgAssetPath + "effects.png";
        this.itemSpriteSheet.src = imgAssetPath + "items.png";
    }

    private checkAllSpriteSheetsLoaded(): void {
        if (this.monsterSpriteSheet.complete
            && this.tileSpriteSheet.complete
            && this.effectSpriteSheet.complete
            && this.itemSpriteSheet.complete) {
            if (this.onLoadCompletedCallback !== null) {
                this.onLoadCompletedCallback()
            }
        }
    }

    private setupCanvas(): void {
        if (this.canvas && this.ctx) {
            this.canvas.width = tileRenderSizePX * this.viewportWidth;
            this.canvas.height = tileRenderSizePX * this.viewportHeight;
            this.canvas.style.width = this.canvas.width + 'px';
            this.canvas.style.height = this.canvas.height + 'px';
            this.ctx.imageSmoothingEnabled = false;
            this.ctx.font = "consolas, monospace";
        }
    }

    private getSpriteSheet(spriteType: string): HTMLImageElement {
        switch (spriteType) {
            case SPRITETYPES.MONSTER:
                return this.monsterSpriteSheet;
            case SPRITETYPES.TILE:
                return this.tileSpriteSheet;
            case SPRITETYPES.EFFECTS:
                return this.effectSpriteSheet;
            case SPRITETYPES.ITEMS:
                return this.itemSpriteSheet;
            default:
                throw "Sprite sheet does not exist!";
        }
    }

    private updateViewportPosition(player: IActor): void {
        if (!player.tile || !this.map) return;

        // Calculate the target viewport position (centered on player)
        const targetViewportX = player.tile.x - Math.floor(this.viewportWidth / 2);
        const targetViewportY = player.tile.y - Math.floor(this.viewportHeight / 2);

        // Calculate the maximum viewport positions
        const maxViewportX = this.map.width - this.viewportWidth;
        const maxViewportY = this.map.height - this.viewportHeight;

        // Clamp the viewport position to valid bounds with a small buffer
        // This creates a "dead zone" where the viewport won't move if the player is near the center
        const deadZone = 3; // Number of tiles from center before camera starts moving
        const currentCenterX = this.viewportX + Math.floor(this.viewportWidth / 2);
        const currentCenterY = this.viewportY + Math.floor(this.viewportHeight / 2);
        const playerOffsetX = player.tile.x - currentCenterX;
        const playerOffsetY = player.tile.y - currentCenterY;

        // Only move the viewport if the player is outside the dead zone
        if (Math.abs(playerOffsetX) > deadZone) {
            this.viewportX = Math.max(0, Math.min(maxViewportX, targetViewportX));
        }
        if (Math.abs(playerOffsetY) > deadZone) {
            this.viewportY = Math.max(0, Math.min(maxViewportY, targetViewportY));
        }
    }

    public updateScreen(mapperLevel: IMap): void {
        this.clearCanvas();
        this.screenshake();
        this.map = mapperLevel;

        const newRenderingSecond = Date.now();
        if ((newRenderingSecond - this.lastAlternateSpriteTimeMS) > alternateSpriteTimeMS) {
            this.showAlternateSprites = !this.showAlternateSprites;
            this.lastAlternateSpriteTimeMS = newRenderingSecond;
        }

        const monsters: IActor[] = [];
        const player = mapperLevel.getPlayer();
        
        if (player && player.tile) {
            this.updateViewportPosition(player);
        }

        // Only render tiles within the viewport
        for (let i = this.viewportX; i < Math.min(this.viewportX + this.viewportWidth, mapperLevel.width); i++) {
            for (let j = this.viewportY; j < Math.min(this.viewportY + this.viewportHeight, mapperLevel.height); j++) {
                const tile = mapperLevel.getTile(i, j);
                if (!tile) {
                    continue;
                }

                this.drawTile(tile);
                if (tile.monster) {
                    monsters.push(tile.monster);
                }
            }
        }

        // Draw monsters within viewport
        for (let m = 0; m < monsters.length; m++) {
            const monster = monsters[m];
            if (!monster.tile) continue;
            
            const monsterX = monster.tile.x;
            const monsterY = monster.tile.y;
            if (monsterX >= this.viewportX && monsterX < this.viewportX + this.viewportWidth &&
                monsterY >= this.viewportY && monsterY < this.viewportY + this.viewportHeight) {
                this.drawMonster(monster);
            }
        }
    }

    private drawTile(tile: ITile): void {
        if (!tile) {
            throw "tile cannot be null";
        }

        // Adjust coordinates relative to viewport
        const screenX = tile.x - this.viewportX;
        const screenY = tile.y - this.viewportY;

        this.drawSprite(SPRITETYPES.TILE, tile.sprite, screenX, screenY);

        if (tile.book) {
            this.drawSprite(SPRITETYPES.ITEMS, ITEM_SPRITE_INDICES.Book, screenX, screenY);
        }

        if (tile.effectCounter > 0) {
            tile.effectCounter--;
            this.drawSprite(SPRITETYPES.EFFECTS, tile.effectIndex, screenX, screenY, tile.effectCounter);
        }
    }

    private drawMonster(monster: IActor): void {
        if (!monster) {
            throw "Monster cannot be null";
        }

        // Adjust coordinates relative to viewport
        const screenX = monster.getDisplayX() - this.viewportX;
        const screenY = monster.getDisplayY() - this.viewportY;

        if (monster.teleportCounter > 0) {
            this.drawSprite(SPRITETYPES.MONSTER, MONSTER_SPRITE_INDICES.MonsterLoad, screenX, screenY);
        } else {
            this.drawSprite(SPRITETYPES.MONSTER, monster.sprite, screenX, screenY);

            for (let i = 0; i < monster.hp; i++) {
                this.drawSprite(
                    SPRITETYPES.MONSTER,
                    MONSTER_SPRITE_INDICES.HP,
                    screenX + (i % 3) * (5 / 16),
                    screenY - Math.floor(i / 3) * (5 / 16)
                );
            }
        }

        monster.offsetX -= Math.sign(monster.offsetX) * (1 / 8);
        monster.offsetY -= Math.sign(monster.offsetY) * (1 / 8)
    }

    private drawSprite(spriteType: string, spriteIdx: Array<number> | null, x: number, y: number, effectCounter: number = 0): void {
        if (spriteType === SPRITETYPES.EFFECTS && effectCounter && effectCounter > 0) {
            this.ctx.globalAlpha = effectCounter / refreshRate;
        }

        if (spriteIdx) {

            const spriteXIdx = spriteIdx[0]
            let spriteYIdx = spriteIdx[1];

            // if it's a monster and we should alternate, use the secondary sprite
            if (spriteType === SPRITETYPES.MONSTER && (this.showAlternateSprites)) {
                spriteYIdx = 1;
            }

            this.ctx.drawImage(
                this.getSpriteSheet(spriteType),
                spriteXIdx * 16,
                spriteYIdx * 16,
                16,
                16,
                x * tileRenderSizePX + this.shake.x,
                y * tileRenderSizePX + this.shake.y,
                tileRenderSizePX,
                tileRenderSizePX
            );

            if (spriteType === SPRITETYPES.EFFECTS && (!effectCounter || effectCounter <= 0)) {
                this.ctx.globalAlpha = 1;
            }
        }
    }

    private clearCanvas(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private screenshake(): void {
        if (this.shake.amount) {
            this.shake.amount--;
        }

        const shakeAngle = Math.random() * Math.PI * 2;
        this.shake.x = Math.round(Math.cos(shakeAngle) * this.shake.amount);
        this.shake.y = Math.round(Math.sin(shakeAngle) * this.shake.amount);
    }

    public hideOverlays(): void {
        const overlays = document.getElementsByClassName("overlay");
        if (overlays) {
            for (let i = 0; i < overlays.length; i++) {
                if (overlays[i]) {
                    const overlay = overlays[i] as HTMLElement;
                    overlay.style.display = "none";
                }
            }
        }
    }

    public showTitle(scores: Array<Score>) {
        const titleOverlay = document.getElementById("TitleOverlay");
        if (titleOverlay) {
            if (scores && scores.length > 0) {
                this.drawScores(scores);
            }
            titleOverlay.style.display = "block";
        }
    }

    public showGameWin(scores: Array<Score>) {
        const gameWinOverlay = document.getElementById("GameWinOverlay");
        if (gameWinOverlay) {
            if (scores && scores.length > 0) {
                this.drawScores(scores);
            }
            gameWinOverlay.style.display = "block";
        }
    }

    public showGameLose(scores: Array<Score>) {
        const gameLoseOverlay = document.getElementById("GameLoseOverlay");
        if (gameLoseOverlay) {
            if (scores && scores.length > 0) {
                this.drawScores(scores);
            }
            gameLoseOverlay.style.display = "block";
        }
    }

    public updateSidebar(level: number, score: number, spells: Dictionary<ISpell> | null): void {
        this.playerBooksElem.innerText = score.toString();
        this.playerLocationElem.innerText = level.toString();

        const spellList = document.getElementById("spells");
        if (spellList) {
            while (spellList.hasChildNodes()) {
                if (spellList.firstChild) {
                    spellList.removeChild(spellList.firstChild);
                }
            }

            const docFrag = document.createDocumentFragment();
            if (spells != null) {
                for (let i = 0; i < Object.keys(spells).length; i++) {
                    const btn = document.createElement('button');
                    btn.className = "spellButton";
                    btn.innerText = "(" + (i + 1) + ") " + (spells[i].name || "");
                    // btn.addEventListener("click", () => {
                    //     this.game.handleInteraction({ key: "" + (i + 1) });
                    // });
                    docFrag.append(btn);
                }
            }
            spellList.appendChild(docFrag)
        }
    }

    private drawScores(scores: Array<Score>): void {
        const newestScore: Score | undefined = scores.pop();
        if (newestScore !== undefined) {
            scores.sort(function (a, b) {
                return b.totalScore - a.totalScore;
            });
            scores.unshift(newestScore);
        }

        const scoreBoards = document.getElementsByClassName("scores");
        for (let i = 0; i < scoreBoards.length; i++) {
            const existingTbodyRows = scoreBoards[i].children[1];
            if (existingTbodyRows) {
                while (existingTbodyRows.hasChildNodes()) {
                    if (existingTbodyRows.firstChild) {
                        existingTbodyRows.removeChild(existingTbodyRows.firstChild);
                    }
                }
            }

            const docFrag = new DocumentFragment();
            for (let i = 0; i < Math.min(10, scores.length); i++) {
                const tr = document.createElement('tr');
                const td1 = document.createElement('td');
                const td2 = document.createElement('td');
                const td3 = document.createElement('td');
                td1.innerHTML = scores[i].run.toString();
                td2.innerHTML = scores[i].score.toString();
                td3.innerHTML = scores[i].totalScore.toString();
                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td3);
                docFrag.appendChild(tr);
            }
            existingTbodyRows.appendChild(docFrag);
        }
    }

    private setShakeAmount(amt: number): void {
        this.shake.amount = amt;
    }
}
