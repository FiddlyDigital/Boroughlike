import { SPRITETYPES, numTiles, tileSize, uiWidth } from './constants.js';
import game from './game.js';

class Renderer {
    constructor() {
        if (!Renderer.instance) {
            this.monsterSpriteSheet = new Image();
            this.tileSpriteSheet = new Image();
            this.effectSpriteSheet = new Image();
            this.itemSpriteSheet = new Image();
            
            this.callback = {
                onLoadCompleted: null
            };

            this.playerLocationElem = document.getElementById("playerLocation");
            this.playerBooksElem = document.getElementById("playerBooks");

            this.shake = {
                amount: 0,
                x: 0,
                y: 0
            };

            this.canvas = document.querySelector("canvas");
            this.ctx = this.canvas.getContext("2d");

            Renderer.instance = this;
        }

        return Renderer.instance;
    }

    initSpriteSheet(callback) {
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

    checkAllSpriteSheetsLoaded() {
        if (this.monsterSpriteSheet.complete
            && this.tileSpriteSheet.complete
            && this.effectSpriteSheet.complete
            && this.itemSpriteSheet.complete) {
            this.callback.onLoadCompleted();
        }
    }

    setupCanvas() {
        this.canvas.width = tileSize * (numTiles + uiWidth);
        this.canvas.height = tileSize * numTiles;
        this.canvas.style.width = this.canvas.width + 'px';
        this.canvas.style.height = this.canvas.height + 'px';
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.font = "consolas, monospace";
    }

    getSpriteSheet(spriteType) {
        switch (spriteType) {
            case SPRITETYPES.MONSTER:
                return this.monsterSpriteSheet;
            case SPRITETYPES.TILE:
                return this.tileSpriteSheet;
            case SPRITETYPES.EFFECTS:
                return this.effectSpriteSheet;
            case SPRITETYPES.ITEMS:
                return this.itemSpriteSheet;
        }
    }

    /**
     * Draws a sprite on the canvas
     * @param {array} spriteIdx - Index [x,y] of the sprite to show
     * @param {number} x - X position of the sprite on the map
     * @param {number} y - X position of the sprite on the map
     * @param {?number} effectCounter - Used for alpha effects
     */
    drawSprite(spriteType, spriteIdx, x, y, effectCounter) {
        if (spriteType === SPRITETYPES.EFFECTS && effectCounter && effectCounter > 0) {
            this.ctx.globalAlpha = effectCounter / 30;
        }

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

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    screenshake() {
        if (this.shake.amount) {
            this.shake.amount--;
        }

        let shakeAngle = Math.random() * Math.PI * 2;
        this.shake.x = Math.round(Math.cos(shakeAngle) * this.shake.amount);
        this.shake.y = Math.round(Math.sin(shakeAngle) * this.shake.amount);
    }

    drawDarkBackground() {
        this.clearCanvas();
        this.ctx.fillStyle = 'rgba(0,0,0,.75)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    hideOverlays() {
        var overlays = document.getElementsByClassName("overlay");
        for(let i =0 ;i< overlays.length; i++) {
            overlays[i].style.display = "none";
        }
    }

    showTitle(scores) {
        var titleOverlay = document.getElementById("TitleOverlay");
        if (scores && scores.length > 0) {
            this.drawScores(scores);
        }
        titleOverlay.style.display = "block";
    }

    showGameWin(scores) {
        var gameWinOverlay = document.getElementById("GameWinOverlay");
        if (scores && scores.length > 0) {
            this.drawScores(scores);
        }
        gameWinOverlay.style.display = "block";
    }

    showGameLose(scores) {
        var gameLoseOverlay = document.getElementById("GameLoseOverlay");
        if (scores && scores.length > 0) {
            this.drawScores(scores);
        }
        gameLoseOverlay.style.display = "block";
    }

    updateSidebar(level, score, spells) {
        this.playerBooksElem.innerText = score;
        this.playerLocationElem.innerText = level;
        
        var spellList = document.getElementById("spells");
        while(spellList.hasChildNodes())
        {
            spellList.removeChild(spellList.firstChild);
        }

        let docFrag = document.createDocumentFragment();
        for (let i = 0; i < spells.length; i++) {
            let btn = document.createElement('button');
            btn.className = "spellButton";
            btn.innerText = "(" + (i + 1) + ") " + (spells[i] || "");
            btn.addEventListener("click", function(){
                game.handleInteraction({ key:"" + (i + 1)});
            });
            docFrag.append(btn);
        }
        spellList.appendChild(docFrag)
    }    

    drawScores(scores) {       
        let newestScore = scores.pop();
        scores.sort(function (a, b) {
            return b.totalScore - a.totalScore;
        });
        scores.unshift(newestScore);

        var scoreBoards = document.getElementsByClassName("scores");
        for (let i = 0; i< scoreBoards.length; i++) {
            let existingTbodyRows = scoreBoards[i].children[1];            
            while(existingTbodyRows.hasChildNodes())
            {
                existingTbodyRows.removeChild(existingTbodyRows.firstChild);
            }

            let docFrag = new DocumentFragment();
            for (let i = 0; i < Math.min(10, scores.length); i++) {
                let tr = document.createElement('tr');
                let td1 =document.createElement('td');
                let td2 =document.createElement('td');
                let td3 =document.createElement('td');
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

    setShakeAmount(amt) {
        this.shake.amount = amt;
    }
}

const renderer = new Renderer();
Object.freeze(renderer);

export default renderer;
