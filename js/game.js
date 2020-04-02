import { GAME_STATES, GAME_EVENTS, numTiles, numLevels, startingHp, maxHp, SOUNDFX } from "./constants.js";
import audioPlayer from "./audioPlayer.js";
import { FiniteStateMachine, State } from "./FiniteStateMachine.js";
import map from "./map.js";
import { Player } from "./monster.js";
import renderer from "./renderer.js";
import { StairDown } from "./tile.js";

class Game {
    constructor() {
        if (!Game.instance) {
            this.version = 'alpha-0.1';
            this.props = {
                level: 1,
                numSpells: 1,
                player: null,
                score: 0,
                spawnCounter: 0,
                spawnRate: 15,
            };

            const stateMatrix = {};
            stateMatrix[GAME_STATES.LOADING] = new State(GAME_STATES.LOADING, { "AssetsLoaded": GAME_STATES.TITLE }, this.loadAssets);
            stateMatrix[GAME_STATES.TITLE] = new State(GAME_STATES.TITLE, { "KeyPress": GAME_STATES.RUNNING }, this.showTitle.bind(this));
            stateMatrix[GAME_STATES.RUNNING] = new State(GAME_STATES.RUNNING, { "PlayerLose": GAME_STATES.GAMEOVER, "PlayerWin": GAME_STATES.GAMEWIN }, this.startGame.bind(this));
            stateMatrix[GAME_STATES.GAMEOVER] = new State(GAME_STATES.GAMEOVER, { "KeyPress": GAME_STATES.TITLE, }, this.showGameLose.bind(this));
            stateMatrix[GAME_STATES.GAMEWIN] = new State(GAME_STATES.GAMEWIN, { "KeyPress": GAME_STATES.TITLE }, this.showGameWin.bind(this));

            this.FSM = new FiniteStateMachine(stateMatrix, GAME_STATES.LOADING);

            Game.instance = this;
        }

        return Game.instance;
    }

    init() {
        renderer.setupCanvas();
        this.addEventHandlers();
        setInterval(this.draw.bind(this), 15); // ever 15ms, or 60 fps
    }

    loadAssets() {
        audioPlayer.initSounds();
        renderer.initSpriteSheet(function () {
            game.FSM.triggerEvent(GAME_EVENTS.ASSETSLOADED);
        });
    }

    addEventHandlers() {
        document.querySelector("html").onkeydown = function (e) {
            switch (game.FSM.currentState.name) {
                case GAME_STATES.GAMEWIN:
                case GAME_STATES.GAMEOVER:
                case GAME_STATES.TITLE:
                    game.FSM.triggerEvent(GAME_EVENTS.KEYPRESS);
                    break;
                case GAME_STATES.RUNNING:
                    game.handleKeypress(e);
                    break;
            }
        };
    }

    handleKeypress(e) {
        e = e || window.event;
        if (e.defaultPrevented) {
            return; // Do nothing if the event was already processed
        }

        switch (e.key) {
            case "Up": case "ArrowUp":
            case "w": case "W":
                this.props.player.tryMove(0, -1)
                break;
            case "Down": case "ArrowDown":
            case "s": case "S":
                this.props.player.tryMove(0, 1);
                break;
            case "Left": case "ArrowLeft":
            case "a": case "A":
                this.props.player.tryMove(-1, 0);
                break;
            case "Right": case "ArrowRight":
            case "d": case "D":
                this.props.player.tryMove(1, 0);
                break;
            case " ": // Spacebar; 'Pass' a turn
                this.props.player.tryMove(0, 0);
                break;
            case 1: case "1": case 2: case "2": case 3: case "3":
            case 4: case "4": case 5: case "5": case 6: case "6":
            case 7: case "7": case 8: case "8": case 9: case "9":
                this.props.player.castSpell(parseInt(e.key) - 1);
                break;
        }
    }

    draw() {
        if (this.FSM.currentState.name == GAME_STATES.RUNNING) {
            renderer.clearCanvas();
            renderer.screenshake();

            for (let i = 0; i < numTiles; i++) {
                for (let j = 0; j < numTiles; j++) {
                    map.getTile(i, j).draw();
                }
            }

            for (let i = 0; i < map.getMonsters().length; i++) {
                map.getMonsters()[i].draw();
            }

            this.props.player.draw();
            renderer.updateSidebar(this.props.level, this.props.score, this.props.player.spells);
        }
    }

    tick() {
        if (this.FSM.currentState.name == GAME_STATES.RUNNING) {
            for (let k = map.getMonsters().length - 1; k >= 0; k--) {
                if (!map.getMonsters()[k].dead) {
                    map.getMonsters()[k].update();
                } else {
                    map.getMonsters().splice(k, 1);
                }
            }

            this.props.player.update();

            if (this.props.player.dead) {
                this.addScore(this.props.score, false);
                this.FSM.triggerEvent(GAME_EVENTS.PLAYERLOSE);
            }

            this.props.spawnCounter--;
            if (this.props.spawnCounter <= 0) {
                map.spawnMonster();
                this.props.spawnCounter = this.props.spawnRate;
                this.props.spawnRate--;
            }
        }
    }

    showTitle() {
        renderer.showTitle(this.getScores());
    }

    showGameWin() {
        // TODO: audioPlayer.playSound(SOUNDFX.GAMEWIN);
        this.addScore(this.props.score, true);
        renderer.showGameWin(this.props.score);
    }

    showGameLose() {
        // TODO: audioPlayer.playSound(SOUNDFX.GAMELOSE);
        this.addScore(this.props.score, true);
        renderer.showGameLose(this.props.score);
    }

    startGame() {
        this.props.level = 1;
        this.props.score = 0;
        this.props.numSpells = 1;
        this.startLevel(startingHp);
    }

    startLevel(playerHp, playerSpells) {
        this.props.spawnRate = 15;
        this.props.spawnCounter = this.props.spawnRate;

        map.generateLevel(this.props.level);

        this.props.player = new Player(map.randomPassableTile());
        this.props.player.hp = playerHp;

        // PG: Future bi-directional travel
        //map.replaceTile(player.tile.x, player.tile.y, StairDown); 

        if (playerSpells) {
            this.props.player.spells = playerSpells;
        }

        let levelExit = map.randomPassableTile();
        map.replaceTile(levelExit.x, levelExit.y, StairDown);
    }

    addScore(score, won) {
        let scores = this.getScores();
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

    getScores() {
        if (localStorage["scores"]) {
            return JSON.parse(localStorage["scores"]);
        } else {
            return [];
        }
    }

    nextLevel() {
        if (this.props.level == numLevels) {
            this.FSM.triggerEvent(GAME_EVENTS.PLAYERWIN);
        } else {
            audioPlayer.playSound(SOUNDFX.NEWLEVEL);
            this.props.level++;
            this.startLevel(Math.min(maxHp, this.props.player.hp + 1));
        }
    }

    incrementScore() {
        audioPlayer.playSound(SOUNDFX.BOOK);

        this.props.score++;

        if (this.props.score % 3 == 0 && this.props.numSpells < 9) {
            this.props.numSpells++;
            this.props.player.addSpell();
        }

        map.spawnMonster();
    }

    getPlayerTile() {
        return this.props.player.tile;
    }
}

const game = new Game();
Object.freeze(game);
export default game;