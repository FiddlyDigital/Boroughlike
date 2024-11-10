import { HUBEVENTS, SPRITETYPES } from '../constants/enums';
import { ITEM_SPRITE_INDICES, MONSTER_SPRITE_INDICES } from '../constants/spriteIndices';
import { numTiles, tileRenderSizePX, refreshRate, imgAssetPath, alternateSpriteTimeMS } from '../constants/values';
import { Dictionary } from '../utilities';
import { Hub } from './hub';
import { singleton } from 'tsyringe';
import { ITile } from '../models/tiles/base/ITile';
import { ISpell } from '../models/spells/ISpell';
import { IRenderer } from './interfaces/IRenderer';
import { IActor } from '../models/actors/base/IActor';
import { IMap } from '../models/maps/IMap';

@singleton()
export class Renderer implements IRenderer {
    shake: any;
    monsterSpriteSheet: HTMLImageElement;
    tileSpriteSheet: HTMLImageElement;
    effectSpriteSheet: HTMLImageElement;
    itemSpriteSheet: HTMLImageElement;
    callback: any;
    playerLocationElem: HTMLElement;
    playerBooksElem: HTMLElement;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    lastAlternateSpriteTimeMS: number;
    showAlternateSprites: boolean = false;

    public constructor() {
        this.lastAlternateSpriteTimeMS = Date.now();
        
        this.monsterSpriteSheet = new Image();
        this.tileSpriteSheet = new Image();
        this.effectSpriteSheet = new Image();
        this.itemSpriteSheet = new Image();

        this.callback = {
            onLoadCompleted: null
        };

        let playerLocElemTemp = document.getElementById("playerLocation");
        if (playerLocElemTemp) {
            this.playerLocationElem = playerLocElemTemp;
        } else {
            throw "can't load pleyer location elem";
        }

        let playerBooksElemTemp = document.getElementById("playerBooks")
        if (playerBooksElemTemp) {
            this.playerBooksElem = playerBooksElemTemp;
        } else {
            throw "can't load Player Books elem";
        }

        this.shake = {
            amount: 0,
            x: 0,
            y: 0
        };

        let canvasTemp = document.querySelector("canvas");
        if (canvasTemp) {
            this.canvas = canvasTemp;
            let ctxtemp = this.canvas.getContext("2d");
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

    public initSpriteSheet(callback: Function): void {
        this.callback.onLoadCompleted = callback; // store for later

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
            this.callback.onLoadCompleted();
        }
    }

    private setupCanvas(): void {
        if (this.canvas && this.ctx) {
            this.canvas.width = tileRenderSizePX * numTiles;
            this.canvas.height = tileRenderSizePX * numTiles;
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

    public updateScreen(mapperLevel: IMap): void {
        this.clearCanvas();
        this.screenshake();

        let newRenderingSecond = Date.now();

        if ((newRenderingSecond - this.lastAlternateSpriteTimeMS) > alternateSpriteTimeMS) {
            this.showAlternateSprites = !this.showAlternateSprites;
            this.lastAlternateSpriteTimeMS = newRenderingSecond;
        }

        let monsters: IActor[] = [];

        for (let i = 0; i < numTiles; i++) {
            for (let j = 0; j < numTiles; j++) {
                let tile = mapperLevel.getTile(i, j);
                if (!tile) {
                    continue;
                }

                this.drawTile(tile);
                if (tile.monster) {
                    monsters.push(tile.monster);
                }
            }
        }

        for (let m = 0; m < monsters.length; m++) {
            this.drawMonster(monsters[m]);
        }

    }

    private drawTile(tile: ITile): void {
        if (!tile) {
            throw "tile cannot be null";
        }

        this.drawSprite(SPRITETYPES.TILE, tile.sprite, tile.x, tile.y);

        if (tile.book) {
            this.drawSprite(SPRITETYPES.ITEMS, ITEM_SPRITE_INDICES.Book, tile.x, tile.y);
        }

        if (tile.effectCounter > 0) {
            tile.effectCounter--;
            this.drawSprite(SPRITETYPES.EFFECTS, tile.effectIndex, tile.x, tile.y, tile.effectCounter);
        }
    }

    private drawMonster(monster: IActor): void {
        if (!monster) {
            throw "Monster cannot be null";
        }

        if (monster.teleportCounter > 0) {
            this.drawSprite(SPRITETYPES.MONSTER, MONSTER_SPRITE_INDICES.MonsterLoad, monster.getDisplayX(), monster.getDisplayY());
        } else {
            this.drawSprite(SPRITETYPES.MONSTER, monster.sprite, monster.getDisplayX(), monster.getDisplayY());

            for (let i = 0; i < monster.hp; i++) {
                this.drawSprite(
                    SPRITETYPES.MONSTER,
                    MONSTER_SPRITE_INDICES.HP,
                    monster.getDisplayX() + (i % 3) * (5 / 16),
                    monster.getDisplayY() - Math.floor(i / 3) * (5 / 16)
                );

            }
        }

        monster.offsetX -= Math.sign(monster.offsetX) * (1 / 8);
        monster.offsetY -= Math.sign(monster.offsetY) * (1 / 8)
    }

    private drawSprite(spriteType: string, spriteIdx: Array<number> | null, x: number, y: number, effectCounter: number = 0) : void {
        if (spriteType === SPRITETYPES.EFFECTS && effectCounter && effectCounter > 0) {
            this.ctx.globalAlpha = effectCounter / refreshRate;
        }

        if (spriteIdx) {

            let spriteXIdx = spriteIdx[0]
            let spriteYIdx = spriteIdx[1];

            // if it's a monster and we should alternate, use the secondary sprite
            if (spriteType === SPRITETYPES.MONSTER && (this.showAlternateSprites)) {
                spriteYIdx= 1;
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

        let shakeAngle = Math.random() * Math.PI * 2;
        this.shake.x = Math.round(Math.cos(shakeAngle) * this.shake.amount);
        this.shake.y = Math.round(Math.sin(shakeAngle) * this.shake.amount);
    }

    public hideOverlays(): void {
        let overlays = document.getElementsByClassName("overlay");
        if (overlays) {
            for (let i = 0; i < overlays.length; i++) {
                if (overlays[i]) {
                    let overlay = overlays[i] as HTMLElement;
                    overlay.style.display = "none";
                }
            }
        }
    }

    public showTitle(scores: Array<any>) {
        var titleOverlay = document.getElementById("TitleOverlay");
        if (titleOverlay) {
            if (scores && scores.length > 0) {
                this.drawScores(scores);
            }
            titleOverlay.style.display = "block";
        }
    }

    public showGameWin(scores: Array<any>) {
        var gameWinOverlay = document.getElementById("GameWinOverlay");
        if (gameWinOverlay) {
            if (scores && scores.length > 0) {
                this.drawScores(scores);
            }
            gameWinOverlay.style.display = "block";
        }
    }

    public showGameLose(scores: Array<any>) {
        var gameLoseOverlay = document.getElementById("GameLoseOverlay");
        if (gameLoseOverlay) {
            if (scores && scores.length > 0) {
                this.drawScores(scores);
            }
            gameLoseOverlay.style.display = "block";
        }
    }

    public updateSidebar(level: number, score: number, spells: Dictionary<ISpell>): void {
        this.playerBooksElem.innerText = score.toString();
        this.playerLocationElem.innerText = level.toString();

        var spellList = document.getElementById("spells");
        if (spellList) {
            while (spellList.hasChildNodes()) {
                if (spellList.firstChild) {
                    spellList.removeChild(spellList.firstChild);
                }
            }

            let docFrag = document.createDocumentFragment();
            for (let i = 0; i < Object.keys(spells).length; i++) {
                let btn = document.createElement('button');
                btn.className = "spellButton";
                btn.innerText = "(" + (i + 1) + ") " + (spells[i].name || "");
                // btn.addEventListener("click", () => {
                //     this.game.handleInteraction({ key: "" + (i + 1) });
                // });
                docFrag.append(btn);
            }
            spellList.appendChild(docFrag)
        }
    }

    private drawScores(scores: Array<any>): void {
        let newestScore = scores.pop();
        scores.sort(function (a, b) {
            return b.totalScore - a.totalScore;
        });
        scores.unshift(newestScore);

        var scoreBoards = document.getElementsByClassName("scores");
        for (let i = 0; i < scoreBoards.length; i++) {
            let existingTbodyRows = scoreBoards[i].children[1];
            if (existingTbodyRows) {
                while (existingTbodyRows.hasChildNodes()) {
                    if (existingTbodyRows.firstChild) {
                        existingTbodyRows.removeChild(existingTbodyRows.firstChild);
                    }
                }
            }

            let docFrag = new DocumentFragment();
            for (let i = 0; i < Math.min(10, scores.length); i++) {
                let tr = document.createElement('tr');
                let td1 = document.createElement('td');
                let td2 = document.createElement('td');
                let td3 = document.createElement('td');
                td1.innerHTML = scores[i].run;
                td2.innerHTML = scores[i].score;
                td3.innerHTML = scores[i].totalScore;
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
