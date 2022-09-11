import { GAME_STATES, GAME_EVENTS, numTiles, numLevels, startingHp, SPRITETYPES, maxHp, SOUNDFX } from "./constants";
import { AudioPlayer } from "./audioPlayer";
import { FiniteStateMachine, State } from "./FiniteStateMachine";
import { Mapper } from "./mapper";
import { Player } from "./monster";
import { Renderer } from "./renderer";
import { StairDown } from "./tile";
import { Dictionary } from "./utilities";
//import { version } from '../package.json';

export default class Game {
    private static instance: Game;
    props: any;
    FSM: FiniteStateMachine;
    localStorage: Dictionary<string>;

    private constructor() {
        this.localStorage = {};
        //this.version = version;          
        this.props = {
            level: 1,
            numSpells: 1,
            player: null,
            score: 0,
            spawnCounter: 0,
            spawnRate: 15,
        };

        const stateMatrix: Dictionary<State> = {
            "Loading": new State(GAME_STATES.LOADING, { "AssetsLoaded": GAME_STATES.TITLE }, this.loadAssets, null),
            "Title": new State(GAME_STATES.TITLE, { "KeyPress": GAME_STATES.RUNNING }, this.showTitle.bind(this), null),
            "Running": new State(GAME_STATES.RUNNING, { "PlayerLose": GAME_STATES.GAMEOVER, "PlayerWin": GAME_STATES.GAMEWIN }, this.startGame.bind(this), null),
            "GameOver": new State(GAME_STATES.GAMEOVER, { "KeyPress": GAME_STATES.TITLE, }, this.showGameLose.bind(this), null),
            "GameWin": new State(GAME_STATES.GAMEWIN, { "KeyPress": GAME_STATES.TITLE }, this.showGameWin.bind(this), null)
        };

        this.FSM = new FiniteStateMachine(stateMatrix, GAME_STATES.LOADING);
    }

    public static getInstance(): Game {
        if (!Game.instance) {
            Game.instance = new Game();
        }

        return Game.instance;
    }

    init() {
        Renderer.getInstance().setupCanvas();
        this.addEventHandlers();
        setInterval(this.draw.bind(this), 15); // ever 15ms, or 60 fps
    }

    loadAssets() {
        AudioPlayer.getInstance().initSounds();
        Renderer.getInstance().initSpriteSheet(function () {
            Game.getInstance().FSM.triggerEvent(GAME_EVENTS.ASSETSLOADED);
        });
    }

    addEventHandlers() {
        let htmlElem = document.querySelector("html");
        if (htmlElem) {
            htmlElem.onkeydown = Game.getInstance().handleInteraction;
        }

        window.addEventListener('touchstart', function () { Game.getInstance().handleInteraction(null); });
        window.addEventListener('mousedown', function () { Game.getInstance().handleInteraction(null); });
    }

    handleInteraction(e: any) {
        switch (Game.getInstance().FSM.currentState.name) {
            case GAME_STATES.LOADING:
                break; // do nothing                
            case GAME_STATES.RUNNING:
                if (e) {
                    Game.getInstance().handleKeypress(e);
                }
                break;
            default:
                Game.getInstance().FSM.triggerEvent(GAME_EVENTS.KEYPRESS);
                break;
        }
    }

    handleKeypress(e: any) {
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
                this.props.sidebarNeedsUpdate = true;
                break;
        }

        this.tick();
    }

    private draw(): void {
        if (this.FSM.currentState.name == GAME_STATES.RUNNING) {
            Renderer.getInstance().clearCanvas();
            Renderer.getInstance().screenshake();

            // This will handle drawing the tiles, and the monsters/items on them.
            for (let i = 0; i < numTiles; i++) {
                for (let j = 0; j < numTiles; j++) {
                    let t = Mapper.getInstance().getTile(i, j);
                    if (t) {
                        Renderer.getInstance().drawTile(t);
                    }
                }
            }

            if (this.props.sidebarNeedsUpdate) {
                this.props.sidebarNeedsUpdate = false;
                Renderer.getInstance().updateSidebar(this.props.level, this.props.score, this.props.player.spells);
            }
        }
    }

    private tick(): void {
        if (this.FSM.currentState.name == GAME_STATES.RUNNING) {
            for (let k = Mapper.getInstance().getMonsters().length - 1; k >= 0; k--) {
                if (!Mapper.getInstance().getMonsters()[k].dead) {
                    Mapper.getInstance().getMonsters()[k].update();
                } else {
                    Mapper.getInstance().getMonsters().splice(k, 1);
                }
            }

            this.props.player.update();

            if (this.props.player.dead) {
                this.addScore(this.props.score, false);
                this.props.sidebarNeedsUpdate = true;
                this.FSM.triggerEvent(GAME_EVENTS.PLAYERLOSE);
            }

            this.props.spawnCounter--;
            if (this.props.spawnCounter <= 0) {
                Mapper.getInstance().spawnMonster();
                this.props.spawnCounter = this.props.spawnRate;
                this.props.spawnRate--;
            }

            this.draw();
        }
    }

    private showTitle(): void {
        Renderer.getInstance().showTitle(this.getScores());
    }

    private showGameWin() {
        // TODO: audioPlayer.playSound(SOUNDFX.GAMEWIN);
        this.addScore(this.props.score, true);
        Renderer.getInstance().showGameWin(this.props.scores);
    }

    private showGameLose() {
        // TODO: audioPlayer.playSound(SOUNDFX.GAMELOSE);
        this.addScore(this.props.score, true);
        Renderer.getInstance().showGameLose(this.props.scores);
    }

    private startGame() {
        Renderer.getInstance().hideOverlays();
        this.props.level = 1;
        this.props.score = 0;
        this.props.numSpells = 1;
        this.startLevel(startingHp, []);
        this.props.sidebarNeedsUpdate = true;
    }

    private startLevel(playerHp: number, playerSpells: any) {
        this.props.spawnRate = 15;
        this.props.spawnCounter = this.props.spawnRate;

        Mapper.getInstance().generateLevel(this.props.level);
        let freeTile = Mapper.getInstance().randomPassableTile();
        if (freeTile) {
            this.props.player = new Player(freeTile);
        }
        this.props.player.hp = playerHp;

        // PG: Future bi-directional travel
        //map.replaceTile(player.tile.x, player.tile.y, StairDown); 

        if (playerSpells) {
            this.props.player.spells = playerSpells;
        }

        let levelExit = Mapper.getInstance().randomPassableTile();
        if (levelExit) {
            Mapper.getInstance().replaceTile(levelExit.x, levelExit.y, StairDown);
        }

        this.props.sidebarNeedsUpdate = true;
    }

    private addScore(score: number, won: boolean) {
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

        this.localStorage["scores"] = JSON.stringify(scores);

    }

    private getScores() {
        if (this.localStorage["scores"]) {
            return JSON.parse(this.localStorage["scores"]);
        } else {
            return [];
        }
    }

    nextLevel() {
        if (this.props.level == numLevels) {
            this.FSM.triggerEvent(GAME_EVENTS.PLAYERWIN);
        } else {
            AudioPlayer.getInstance().playSound(SOUNDFX.NEWLEVEL);
            this.props.level++;
            this.startLevel(Math.min(maxHp, this.props.player.hp + 1), null);
            this.props.sidebarNeedsUpdate = true;
        }
    }

    incrementScore() {
        AudioPlayer.getInstance().playSound(SOUNDFX.BOOK);

        this.props.score++;

        if (this.props.score % 3 == 0 && this.props.numSpells < 9) {
            this.props.numSpells++;
            this.props.player.addSpell();
        }

        Mapper.getInstance().spawnMonster();
        this.props.sidebarNeedsUpdate = true;
    }
}
