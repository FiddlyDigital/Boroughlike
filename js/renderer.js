class Renderer {
    constructor() {
        if (!Renderer.instance){
            this.spritesheet = new Image();
            this.shake = {
                amount: 0,
                x: 0,
                y: 0
            };

            this.tileSize = 48;
            this.numTiles = 16;
            this.uiWidth = 4;

            this.canvas = document.querySelector("canvas");
            this.ctx = this.canvas.getContext("2d");

            Renderer.instance = this;
        }

        return Renderer.instance;
    }

    initSpriteSheet(callback) {        
        this.spritesheet.src = 'spritesheet.png';
        this.spritesheet.onload = callback;
    }

    setupCanvas() {
        this.canvas.width = this.tileSize * (this.numTiles + this.uiWidth);
        this.canvas.height = this.tileSize * this.numTiles;
        this.canvas.style.width = this.canvas.width + 'px';
        this.canvas.style.height = this.canvas.height + 'px';
        this.ctx.imageSmoothingEnabled = false;
    }

    drawSprite(sprite, x, y, effectCounter) {
        this.ctx.globalAlpha = effectCounter / 30;

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

        this.ctx.globalAlpha = 1;
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

    showTitle() {
        this.ctx.fillStyle = 'rgba(0,0,0,.75)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawText("WASD to Move, 1-9 for Spells", 40, true, this.canvas.height / 2 - 110, "white");
        this.drawText("Boroughlike", 70, true, this.canvas.height / 2 - 50, "white");
    }

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
            Utilities.rightPad(["RUN", "SCORE", "TOTAL"]),
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
