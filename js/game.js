const GAMESTATES = {
    LOADING: "Loading",
    TITLE: "Title",
    RUNNING: "Running",
    GAMEOVER: "Gameover",
    GAMEWIN: "GameWin"
};

const GAME = (function () {
    var level = 1;
    var maxHp = 6;
    var startingHp = 3;
    var numLevels = 10;
    var numTiles = 12;
    var gameState = GAMESTATES.LOADING;

    function getState() {
        return gameState;
    }

    function getMaxHP() {
        return maxHp;
    }

    function getLevel() {
        return level;
    }

    function init() {
        loadAssets();
        
        renderer.setupCanvas(numTiles);
        addEventHandlers();
        
        setInterval(draw, 15); // ever 15ms, or 60 fps
    }

    function loadAssets() {
        audioPlayer.initSounds();
        renderer.initSpriteSheet(showTitle);
    }

    function addEventHandlers() {
        document.querySelector("html").onkeydown = function (e) {
            switch (getState()) {
                case GAMESTATES.GAMEWIN:
                case GAMESTATES.GAMEOVER:
                    showTitle();
                    break;
                case GAMESTATES.TITLE:
                    startGame();
                    break;
                case GAMESTATES.RUNNING:
                    handleKeypress(e);
                    break;
                case GAMESTATES.LOADING:
                    break;
            }
        };
    }

    function handleKeypress(e) {
        e = e || window.event;
        if (e.defaultPrevented) {
            return; // Do nothing if the event was already processed
        }

        switch (e.key) {
            case "Up": case "ArrowUp":
            case "w": case "W":
                player.tryMove(0, -1)
                break;
            case "Down": case "ArrowDown":
            case "s": case "S":
                player.tryMove(0, 1);
                break;
            case "Left": case "ArrowLeft":
            case "a": case "A":
                player.tryMove(-1, 0);
                break;
            case "Right": case "ArrowRight":
            case "d": case "D":
                player.tryMove(1, 0);
                break;
            case 1: case "1": case 2: case "2": case 3: case "3":
            case 4: case "4": case 5: case "5": case 6: case "6":
            case 7: case "7": case 8: case "8": case 9: case "9":
                player.castSpell(parseInt(e.key) - 1);
                break;
        }
    }

    function draw() {
        if (gameState == GAMESTATES.RUNNING || gameState == GAMESTATES.GAMEOVER) {
            renderer.clearCanvas();
            renderer.screenshake();

            for (let i = 0; i < numTiles; i++) {
                for (let j = 0; j < numTiles; j++) {
                    MAP.getTile(i, j).draw();
                }
            }

            for (let i = 0; i < MAP.getMonsters().length; i++) {
                MAP.getMonsters()[i].draw();
            }

            player.draw();

            renderer.drawText("Level: " + level, 30, false, 40, "violet");
            renderer.drawText("Books: " + score, 30, false, 70, "violet");

            for (let i = 0; i < player.spells.length; i++) {
                let spellText = (i + 1) + ") " + (player.spells[i] || "");
                renderer.drawText(spellText, 20, false, 110 + i * 40, "aqua");
            }
        }
    }

    function tick() {
        for (let k = MAP.getMonsters().length - 1; k >= 0; k--) {
            if (!MAP.getMonsters()[k].dead) {
                MAP.getMonsters()[k].update();
            } else {
                MAP.getMonsters().splice(k, 1);
            }
        }

        player.update();

        if (player.dead) {
            addScore(score, false);
            gameState = GAMESTATES.GAMEOVER;
            renderer.showGameOver(score);
        }

        spawnCounter--;
        if (spawnCounter <= 0) {
            MAP.spawnMonster();
            spawnCounter = spawnRate;
            spawnRate--;
        }
    }

    function showTitle() {
        gameState = GAMESTATES.TITLE;
        renderer.showTitle();
        drawScores();
    }

    function startGame() {
        gameState = GAMESTATES.RUNNING;

        level = 1;
        score = 0;
        numSpells = 1;
        startLevel(startingHp);
    }

    function startLevel(playerHp, playerSpells) {
        spawnRate = 15;
        spawnCounter = spawnRate;

        MAP.generateLevel(numTiles, level);

        player = new Player(MAP.randomPassableTile());
        player.hp = playerHp;

        if (playerSpells) {
            player.spells = playerSpells;
        }

        MAP.randomPassableTile().replace(Exit);
    }

    function getScores() {
        if (localStorage["scores"]) {
            return JSON.parse(localStorage["scores"]);
        } else {
            return [];
        }
    }

    function addScore(score, won) {
        let scores = getScores();
        let scoreObject = { score: score, run: 1, totalScore: score, active: won };
        let lastScore = scores.pop();

        if (lastScore) {
            if (lastScore.active) {
                scoreObject.run = lastScore.run + 1;
                scoreObject.totalScore += lastScore.totalScore;
            } else {
                scores.push(lastScore);
            }
        }
        scores.push(scoreObject);

        localStorage["scores"] = JSON.stringify(scores);
    }

    function drawScores() {
        let scores = getScores();
        if (scores.length) {
            renderer.drawScores(scores);
        }
    }

    function nextLevel() {
        if (level == numLevels) {
            // TODO: audioPlayer.playSound(SOUNDFX.GAMEWIN);
            addScore(score, true);
            //showTitle();
            renderer.showGameWin(score);
        } else {
            audioPlayer.playSound(SOUNDFX.NEWLEVEL);
            level++;
            startLevel(Math.min(maxHp, player.hp + 1));
        }
    }

    function incrementScore() {
        audioPlayer.playSound(SOUNDFX.BOOK);

        score++;

        if (score % 3 == 0 && numSpells < 9) {
            numSpells++;
            player.addSpell();
        }

        MAP.spawnMonster();
    }

    function getPlayerTile() {
        return player.tile;
    }

    return {
        addScore: addScore,
        draw: draw,
        GAMESTATES: GAMESTATES,
        getLevel: getLevel,
        getMaxHP: getMaxHP,
        getPlayerTile: getPlayerTile,
        getState: getState,
        incrementScore: incrementScore,
        init: init,
        loadAssets: loadAssets,
        nextLevel: nextLevel,
        showTitle: showTitle,
        startGame: startGame,
        startLevel: startLevel,
        tick: tick,
    }
}());
