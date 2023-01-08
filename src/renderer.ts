import { SPRITETYPES, ITEM_SPRITE_INDICES, MONSTER_SPRITE_INDICES, numTiles, tileSize, uiWidth } from './constants';
import { Game } from './game';
import { ISpell } from './spell';
import { ITile, Tile } from './tile';
import { Dictionary } from './utilities';

export class Renderer {
    private static instance: Renderer;

    shake: any;
    monsterSpriteSheet: HTMLImageElement;
    tileSpriteSheet: HTMLImageElement;
    effectSpriteSheet: HTMLImageElement;
    itemSpriteSheet: HTMLImageElement;
    callback: any;
    playerLocationElem: HTMLElement;
    playerBooksElem: HTMLElement;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D

    private constructor() {
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
    }

    public static getInstance(): Renderer {
        if (!Renderer.instance) {
            Renderer.instance = new Renderer();
        }

        return Renderer.instance;
    }

    public initSpriteSheet(callback: Function) {
        this.callback.onLoadCompleted = callback; // store for later

        this.monsterSpriteSheet.onload = this.checkAllSpriteSheetsLoaded.bind(this);
        this.tileSpriteSheet.onload = this.checkAllSpriteSheetsLoaded.bind(this);
        this.effectSpriteSheet.onload = this.checkAllSpriteSheetsLoaded.bind(this);
        this.itemSpriteSheet.onload = this.checkAllSpriteSheetsLoaded.bind(this);

        this.monsterSpriteSheet.src = "assets/images/monsters.png";
        this.tileSpriteSheet.src = "assets/images/library_new.png";
        this.effectSpriteSheet.src = "assets/images/effects.png";
        this.itemSpriteSheet.src = "assets/images/items.png";
    }

    public checkAllSpriteSheetsLoaded() {
        if (this.monsterSpriteSheet.complete
            && this.tileSpriteSheet.complete
            && this.effectSpriteSheet.complete
            && this.itemSpriteSheet.complete) {
            this.callback.onLoadCompleted();
        }
    }

    public setupCanvas() {
        if (this.canvas && this.ctx) {
            this.canvas.width = tileSize * (numTiles + uiWidth);
            this.canvas.height = tileSize * numTiles;
            this.canvas.style.width = this.canvas.width + 'px';
            this.canvas.style.height = this.canvas.height + 'px';
            this.ctx.imageSmoothingEnabled = false;
            this.ctx.font = "consolas, monospace";
        }
    }

    public getSpriteSheet(spriteType: string): HTMLImageElement {
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

    public drawTile(tile: ITile) {
        if (tile) {
            this.drawSprite(SPRITETYPES.TILE, tile.sprite, tile.x, tile.y);

            if (tile.book) {
                this.drawSprite(SPRITETYPES.ITEMS, ITEM_SPRITE_INDICES.Book, tile.x, tile.y);
            }

            if (tile.effectCounter) {
                tile.effectCounter--;
                this.drawSprite(SPRITETYPES.EFFECTS, tile.effectIndex, tile.x, tile.y, tile.effectCounter);
            }

            if (tile.monster) {
                if (tile.monster.teleportCounter > 0) {
                    this.drawSprite(SPRITETYPES.MONSTER, MONSTER_SPRITE_INDICES.MonsterLoad, tile.monster.getDisplayX(), tile.monster.getDisplayY());
                } else {
                    this.drawSprite(SPRITETYPES.MONSTER, tile.monster.sprite, tile.monster.getDisplayX(), tile.monster.getDisplayY());

                    for (let i = 0; i < tile.monster.hp; i++) {
                        this.drawSprite(
                            SPRITETYPES.MONSTER,
                            MONSTER_SPRITE_INDICES.HP,
                            tile.monster.getDisplayX() + (i % 3) * (5 / 16),
                            tile.monster.getDisplayY() - Math.floor(i / 3) * (5 / 16)
                        );

                    }
                }

                tile.monster.offsetX -= Math.sign(tile.monster.offsetX) * (1 / 8);
                tile.monster.offsetY -= Math.sign(tile.monster.offsetY) * (1 / 8);
            }
        }
    }

    private drawSprite(spriteType: string, spriteIdx: Array<number> | null, x: number, y: number, effectCounter: number = 0) {
        if (spriteType === SPRITETYPES.EFFECTS && effectCounter && effectCounter > 0) {
            this.ctx.globalAlpha = effectCounter / 30;
        }

        if (spriteIdx) {
            this.ctx.drawImage(
                this.getSpriteSheet(spriteType),
                spriteIdx[0] * 16,
                spriteIdx[1] * 16,
                16,
                16,
                x * tileSize + this.shake.x,
                y * tileSize + this.shake.y,
                tileSize,
                tileSize
            );

            if (spriteType === SPRITETYPES.EFFECTS && (!effectCounter || effectCounter <= 0)) {
                this.ctx.globalAlpha = 1;
            }
        }
    }

    public clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public screenshake() {
        if (this.shake.amount) {
            this.shake.amount--;
        }

        let shakeAngle = Math.random() * Math.PI * 2;
        this.shake.x = Math.round(Math.cos(shakeAngle) * this.shake.amount);
        this.shake.y = Math.round(Math.sin(shakeAngle) * this.shake.amount);
    }

    public drawDarkBackground() {
        this.clearCanvas();
        this.ctx.fillStyle = 'rgba(0,0,0,.75)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public hideOverlays() {
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

    public updateSidebar(level: number, score: number, spells: Dictionary<ISpell>) {
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
                btn.addEventListener("click", function () {
                    Game.getInstance().handleInteraction({ key: "" + (i + 1) });
                });
                docFrag.append(btn);
            }
            spellList.appendChild(docFrag)
        }
    }

    public drawScores(scores: Array<any>) {
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

    public setShakeAmount(amt: number) {
        this.shake.amount = amt;
    }
}
