var RENDERER = (function () {
    var spritesheet = null;

    var tileSize = 48;
    var numTiles = 16;
    var uiWidth = 4;

    var shakeAmount = 0;
    var shakeX = 0;
    var shakeY = 0;

    var canvas = null;
    var ctx = null;

    function initSpriteSheet(callback) {
        spritesheet = new Image();
        spritesheet.src = 'spritesheet.png';
        spritesheet.onload = callback;
    }

    function setupCanvas(nt) {
        numTiles = nt;
        canvas = document.querySelector("canvas");
        ctx = canvas.getContext("2d");

        canvas.width = tileSize * (numTiles + uiWidth);
        canvas.height = tileSize * numTiles;
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';
        ctx.imageSmoothingEnabled = false;
    }

    function drawSprite(sprite, x, y, effectCounter) {
        ctx.globalAlpha = effectCounter / 30;

        ctx.drawImage(
            spritesheet,
            sprite * 16,
            0,
            16,
            16,
            x * tileSize + shakeX,
            y * tileSize + shakeY,
            tileSize,
            tileSize
        );

        ctx.globalAlpha = 1;
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function screenshake() {
        if (shakeAmount) {
            shakeAmount--;
        }

        let shakeAngle = Math.random() * Math.PI * 2;
        shakeX = Math.round(Math.cos(shakeAngle) * shakeAmount);
        shakeY = Math.round(Math.sin(shakeAngle) * shakeAmount);
    }

    function showTitle() {
        ctx.fillStyle = 'rgba(0,0,0,.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawText("WASD to Move, 1-9 for Spells", 40, true, canvas.height / 2 - 110, "white");
        drawText("Boroughlike", 70, true, canvas.height / 2 - 50, "white");

    }

    function drawText(text, size, centered, textY, color) {
        ctx.fillStyle = color;
        ctx.font = size + "px monospace";

        let textX;
        if (centered) {
            textX = (canvas.width - ctx.measureText(text).width) / 2;
        } else {
            textX = canvas.width - uiWidth * tileSize + 25;
        }

        ctx.fillText(text, textX, textY);
    }

    function drawScores(scores) {
        drawText(
            Utilities.rightPad(["RUN", "SCORE", "TOTAL"]),
            18,
            true,
            canvas.height / 2,
            "white"
        );

        let newestScore = scores.pop();
        scores.sort(function (a, b) {
            return b.totalScore - a.totalScore;
        });
        scores.unshift(newestScore);

        for (let i = 0; i < Math.min(10, scores.length); i++) {
            let scoreText = Utilities.rightPad([scores[i].run, scores[i].score, scores[i].totalScore]);
            drawText(
                scoreText,
                18,
                true,
                canvas.height / 2 + 24 + i * 24,
                i == 0 ? "aqua" : "violet"
            );
        }
    }

    function setShakeAmount(amt) {
        shakeAmount = amt;
    }

    return {
        clearCanvas: clearCanvas,
        drawSprite: drawSprite,
        drawScores: drawScores,
        drawText: drawText,
        initSpriteSheet: initSpriteSheet,
        screenshake: screenshake,
        setShakeAmount: setShakeAmount,
        setupCanvas: setupCanvas,
        showTitle: showTitle
    }
}());
