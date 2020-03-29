class Renderer {
    constructor() {
        if (!Renderer.instance) {
            this.spritesheet = new Image();
            this.shake = {
                amount: 0,
                x: 0,
                y: 0
            };

            this.tileSize = 64;
            this.numTiles = 12;
            this.uiWidth = 3;

            this.canvas = document.querySelector("canvas");
            this.ctx = this.canvas.getContext("2d");

            Renderer.instance = this;
        }

        return Renderer.instance;
    }

    initSpriteSheet(callback) {
        this.spritesheet.src = 'assets/images/spritesheet.png';
        this.spritesheet.onload = callback;
    }

    setupCanvas() {
        this.canvas.width = this.tileSize * (this.numTiles + this.uiWidth);
        this.canvas.height = this.tileSize * this.numTiles;
        this.canvas.style.width = this.canvas.width + 'px';
        this.canvas.style.height = this.canvas.height + 'px';
        this.ctx.imageSmoothingEnabled = false;
    }

    /**
     * Draws a sprite on the canvas
     * @param {number} sprite - Index of the sprite to show
     * @param {number} x - X position of the sprite on the map
     * @param {number} y - X position of the sprite on the map
     * @param {?number} effectCounter - Used for alpha effects
     */
    drawSprite(sprite, x, y, effectCounter) {
        if (effectCounter && effectCounter > 0) {
            this.ctx.globalAlpha = effectCounter / 30;
        }

        this.ctx.drawImage(
            this.spritesheet,
            sprite * 16,
            0,
            16,
            16,
            x * this.tileSize + this.shake.x,
            y * this.tileSize + this.shake.y,
            this.tileSize,
            this.tileSize
        );

        if (!effectCounter || effectCounter <= 0) {
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

        this.drawText("Boroughlike", 64, true, this.canvas.height / 2 - 150, "white");
        this.drawText("Arrow Keys or WASD to Move", 32, true, this.canvas.height / 2 - 90, "white");
        this.drawText("1-9 to use spells", 32, true, this.canvas.height / 2 - 40, "white");

        if (scores && scores.length > 0) {
            this.drawScores(scores);
        }
    }

    showGameWin(score) {
        this.drawDarkBackground();        
        this.drawText("Congratulations", 64, true, this.canvas.height / 2 - 150, "white");
        this.drawText("You successfully escaped the Library", 32, true, this.canvas.height / 2 - 90, "white");
    }

    showGameLose(score) {
        this.drawDarkBackground();
        this.drawText("Uh-oh!", 64, true, this.canvas.height / 2 - 150, "white");
        this.drawText("You didn't make it out. Better luck next time!", 32, true, this.canvas.height / 2 - 90, "white");
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
            textX = this.canvas.width - this.uiWidth * this.tileSize + 25;
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
