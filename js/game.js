const GAME = (function () {
    var version = 'alpha';
    var level = 1;
    var FSM = null;

    function getLevel() {
        return level;
    }

    function init() {
        // Define our States and how they change based on events raised
        const stateMatrix = {};
        stateMatrix[GAME_STATES.LOADING] = new State(GAME_STATES.LOADING, { "AssetsLoaded": GAME_STATES.TITLE }, loadAssets);
        stateMatrix[GAME_STATES.TITLE] = new State(GAME_STATES.TITLE, { "KeyPress": GAME_STATES.RUNNING }, showTitle);
        stateMatrix[GAME_STATES.RUNNING] = new State(GAME_STATES.RUNNING, { "PlayerLose": GAME_STATES.GAMEOVER, "PlayerWin": GAME_STATES.GAMEWIN }, startGame);
        stateMatrix[GAME_STATES.GAMEOVER] = new State(GAME_STATES.GAMEOVER, { "KeyPress": GAME_STATES.TITLE, }, showGameLose);
        stateMatrix[GAME_STATES.GAMEWIN] = new State(GAME_STATES.GAMEWIN, { "KeyPress": GAME_STATES.TITLE }, showGameWin);
        FSM = new FiniteStateMachine(stateMatrix, GAME_STATES.LOADING);

        renderer.setupCanvas();
        addEventHandlers();

        setInterval(draw, 15); // ever 15ms, or 60 fps
    }

    function loadAssets() {
        audioPlayer.initSounds();
        renderer.initSpriteSheet(function () {
            FSM.triggerEvent(GAME_EVENTS.ASSETSLOADED);
        });
    }

    function addEventHandlers() {
        document.querySelector("html").onkeydown = function (e) {
            switch (FSM.currentState.name) {
                case GAME_STATES.GAMEWIN:
                case GAME_STATES.GAMEOVER:
                case GAME_STATES.TITLE:
                    FSM.triggerEvent(GAME_EVENTS.KEYPRESS);
                    break;
                case GAME_STATES.RUNNING:
                    handleKeypress(e);
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
            case " ": // Spacebar; 'Pass' a turn
                player.tryMove(0, 0);
                break;
            case 1: case "1": case 2: case "2": case 3: case "3":
            case 4: case "4": case 5: case "5": case 6: case "6":
            case 7: case "7": case 8: case "8": case 9: case "9":
                player.castSpell(parseInt(e.key) - 1);
                break;
        }
    }

    function draw() {
        if (FSM.currentState.name == GAME_STATES.RUNNING) {
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
            renderer.updateSidebar(level, score, player.spells);
        }
    }

    function tick() {
        if (FSM.currentState.name == GAME_STATES.RUNNING) {
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
                FSM.triggerEvent(GAME_EVENTS.PLAYERLOSE);
            }

            spawnCounter--;
            if (spawnCounter <= 0) {
                MAP.spawnMonster();
                spawnCounter = spawnRate;
                spawnRate--;
            }
        }
    }

    function showTitle() {
        renderer.showTitle(getScores());
    }

    function showGameWin() {
        // TODO: audioPlayer.playSound(SOUNDFX.GAMEWIN);
        addScore(score, true);
        renderer.showGameWin(score);
    }

    function showGameLose() {
        // TODO: audioPlayer.playSound(SOUNDFX.GAMELOSE);
        addScore(score, true);
        renderer.showGameLose(score);
    }

    function startGame() {
        level = 1;
        score = 0;
        numSpells = 1;
        startLevel(startingHp);
    }

    function startLevel(playerHp, playerSpells) {
        spawnRate = 15;
        spawnCounter = spawnRate;

        MAP.generateLevel(level);

        player = new Player(MAP.randomPassableTile());
        player.hp = playerHp;
        //player.tile.replace(StairUp); // PG: Future bi-directional travel

        if (playerSpells) {
            player.spells = playerSpells;
        }

        MAP.randomPassableTile().replace(StairDown);
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

    function nextLevel() {
        if (level == numLevels) {
            FSM.triggerEvent(GAME_EVENTS.PLAYERWIN);
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
        GAMESTATES: GAME_STATES,
        getLevel: getLevel,        
        getPlayerTile: getPlayerTile,
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
