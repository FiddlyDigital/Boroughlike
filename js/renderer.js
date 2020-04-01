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
        this.tileSpriteSheet.src = "assets/images/library.png";
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
     * @param {number} spriteIdx - Index of the sprite to show
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
            spriteIdx * 16,
            0,
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

    showTitle(scores) {
        this.drawDarkBackground();

        this.drawSprite(SPRITETYPES.ITEMS, ITEM_SPRITE_INDICES.Book, 6, 1);
        this.drawSprite(SPRITETYPES.MONSTER, MONSTER_SPRITE_INDICES.Player, 7, 1);
        this.drawSprite(SPRITETYPES.ITEMS, ITEM_SPRITE_INDICES.Book, 8, 1);
        
        this.drawText("Boroughlike", 64, true, this.canvas.height / 2 - 150, "white");
        this.drawText("Arrow Keys or WASD to Move", 32, true, this.canvas.height / 2 - 90, "white");
        this.drawText("1-9 to use spells", 32, true, this.canvas.height / 2 - 40, "white");

        if (scores && scores.length > 0) {
            this.drawScores(scores);
        }

        this.drawText("Press any key to continue...", 20, true, this.canvas.height -40, "white");
    }

    showGameWin(score) {
        this.drawDarkBackground();

        this.drawSprite(SPRITETYPES.ITEMS, ITEM_SPRITE_INDICES.Book, 6, 1);
        this.drawSprite(SPRITETYPES.MONSTER, MONSTER_SPRITE_INDICES.Player, 7, 1);
        this.drawSprite(SPRITETYPES.ITEMS, ITEM_SPRITE_INDICES.Book, 8, 1);

        this.drawText("Congratulations", 64, true, this.canvas.height / 2 - 150, "white");
        this.drawText("You successfully escaped the Library", 32, true, this.canvas.height / 2 - 90, "white");

        this.drawText("Press any key to continue...", 20, true, this.canvas.height -40, "white");
    }

    showGameLose(score) {
        this.drawDarkBackground();
        
        this.drawSprite(SPRITETYPES.EFFECTS, EFFECT_SPRITE_INDICES.Flame, 6, 1);
        this.drawSprite(SPRITETYPES.MONSTER, MONSTER_SPRITE_INDICES.Player_Dead, 7, 1);
        this.drawSprite(SPRITETYPES.EFFECTS, EFFECT_SPRITE_INDICES.Flame, 8, 1);

        this.drawText("You didn't make it out!", 64, true, this.canvas.height / 2 - 150, "white");
        this.drawText("Better luck next time!", 32, true, this.canvas.height / 2 - 90, "white");

        this.drawText("Press any key to continue...", 20, true, this.canvas.height -40, "white");
    }

    updateSidebar(level, score, spells) {
        renderer.drawText("Level: " + level, 30, false, 40, "violet");
        renderer.drawText("Books: " + score, 30, false, 70, "violet");

        for (let i = 0; i < spells.length; i++) {
            let spellText = (i + 1) + ") " + (spells[i] || "");
            renderer.drawText(spellText, 20, false, 110 + i * 40, "aqua");
        }
    }

    /**
     * Draws text on the Canvas
     * @param {string} text - The text to display
     * @param {number} size - The fontsize of the text
     * @param {boolean} centered - is the text centered?
     * @param {number} textY - Y value of the text
     * @param {string} color - color of the text
     */
    drawText(text, size, centered, textY, color) {
        this.ctx.fillStyle = color;
        this.ctx.font = size + "px monospace";

        let textX;
        if (centered) {
            textX = (this.canvas.width - this.ctx.measureText(text).width) / 2;
        } else {
            textX = this.canvas.width - uiWidth * tileSize + 25;
        }

        this.ctx.fillText(text, textX, textY);
    }

    drawScores(scores) {
        this.drawText(
            Utilities.rightPad(["RUN", "BOOKS", "TOTAL"]),
            18,
            true,
            this.canvas.height / 2,
            "white"
        );

        let newestScore = scores.pop();
        scores.sort(function (a, b) {
            return b.totalScore - a.totalScore;
        });
        scores.unshift(newestScore);

        for (let i = 0; i < Math.min(10, scores.length); i++) {
            let scoreText = Utilities.rightPad([scores[i].run, scores[i].score, scores[i].totalScore]);
            this.drawText(
                scoreText,
                18,
                true,
                this.canvas.height / 2 + 24 + i * 24,
                i == 0 ? "aqua" : "violet"
            );
        }
    }

    setShakeAmount(amt) {
        this.shake.amount = amt;
    }
}

const renderer = new Renderer();
Object.freeze(renderer);

//export default renderer;
