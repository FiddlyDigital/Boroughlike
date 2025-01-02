/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { numLevels, refreshRate } from "../constants/values";
import { GAME_STATES, GAME_EVENTS, SOUNDFX, HUBEVENTS } from "../constants/enums";
import { FiniteStateMachine, State } from "./FiniteStateMachine";
import { Hub } from "./hub";
import { Dictionary } from "../utilities";
import { inject, singleton } from "tsyringe";
import { IMapper } from "./interfaces/IMapper";
import { IAudioPlayer } from "./interfaces/IAudioPlayer";
import { IRenderer } from "./interfaces/IRenderer";
import { Score } from "../models/score";
import { PlayerActor } from "../models/actors/PlayerActor";
//import { version } from '../package.json';

@singleton()
export class GameEngine {
    props: any;
    FSM: FiniteStateMachine;
    localStorage: Dictionary<string>;
    lastAnimateUpdate: number;

    constructor(
        @inject("IAudioPlayer") private audioPlayer: IAudioPlayer,
        @inject("IMapper") private mapper: IMapper,
        @inject("IRenderer") private renderer: IRenderer
    ) {
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
            "Loading": new State(GAME_STATES.LOADING, { "AssetsLoaded": GAME_STATES.TITLE }, this.loadAssets.bind(this), null),
            "Title": new State(GAME_STATES.TITLE, { "KeyPress": GAME_STATES.RUNNING }, this.showTitle.bind(this), null),
            "Running": new State(GAME_STATES.RUNNING, { "PlayerLose": GAME_STATES.GAMEOVER, "PlayerWin": GAME_STATES.GAMEWIN }, this.startGame.bind(this), null),
            "GameOver": new State(GAME_STATES.GAMEOVER, { "KeyPress": GAME_STATES.TITLE, }, this.showGameLose.bind(this), null),
            "GameWin": new State(GAME_STATES.GAMEWIN, { "KeyPress": GAME_STATES.TITLE }, this.showGameWin.bind(this), null)
        };

        this.FSM = new FiniteStateMachine(stateMatrix, GAME_STATES.LOADING);
        this.lastAnimateUpdate = new Date().getTime();
    }

    public init(): void {
        this.addEventHandlers();
        requestAnimationFrame(this.draw.bind(this));
    }

    private loadAssets(): void {
        this.renderer.initSpriteSheet(() => {
            this.FSM.triggerEvent(GAME_EVENTS.ASSETSLOADED);
        });
    }

    private addEventHandlers(): void {
        const self = this;

        const htmlElem = document.querySelector("html");
        if (htmlElem) {
            htmlElem.onkeydown = self.handleInteraction.bind(this);
        }

        window.addEventListener('touchstart', self.handleInteraction.bind(this));
        window.addEventListener('mousedown', self.handleInteraction.bind(this));

        Hub.getInstance().subscribe(HUBEVENTS.NEXTLEVEL, self.nextLevel.bind(this));
        Hub.getInstance().subscribe(HUBEVENTS.PREVLEVEL, self.prevLevel.bind(this));

    }

    private handleInteraction(e: any): void {
        switch (this.FSM.currentState.name) {
            case GAME_STATES.LOADING:
                break; // do nothing                
            case GAME_STATES.RUNNING:
                if (e) {
                    this.handleKeypress(e);
                }
                break;
            default:
                this.FSM.triggerEvent(GAME_EVENTS.KEYPRESS);
                break;
        }
    }

    private handleKeypress(e: any): void {
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
            case "Enter":
            case "Return":
                this.props.player.activateTile();
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
            const nowMs = new Date().getTime();
            if (nowMs >= this.lastAnimateUpdate + refreshRate) {
                this.lastAnimateUpdate = nowMs;

                this.renderer.updateScreen(this.mapper.getCurrentLevel());

                if (this.props.sidebarNeedsUpdate) {
                    this.props.sidebarNeedsUpdate = false;
                    this.renderer.updateSidebar(this.props.level, this.props.score, this.props.player.spells);
                }
            }

            requestAnimationFrame(this.draw.bind(this));
        }
    }

    private tick(): void {
        const currentLevel = this.mapper.getCurrentLevel();
        if (currentLevel) {
            const currentLevelMonsters = currentLevel.getMonsters();
            for (let k = currentLevelMonsters.length - 1; k >= 0; k--) {
                if (!currentLevelMonsters[k].dead) {
                    currentLevelMonsters[k].update();
                } else {
                    currentLevel.removeActor(currentLevelMonsters[k]);
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
                currentLevel.spawnMonster();
                this.props.spawnCounter = this.props.spawnRate;
                this.props.spawnRate--;
            }
        }
    }

    private showTitle(): void {
        this.renderer.showTitle(this.getScores());
    }

    private showGameWin() {
        // TODO: audioPlayer.playSound(SOUNDFX.GAMEWIN);    
        this.addScore(this.props.score, true);
        this.renderer.showGameWin(this.props.scores);
    }

    private showGameLose() {
        // TODO: audioPlayer.playSound(SOUNDFX.GAMELOSE);
        this.addScore(this.props.score, true);
        this.renderer.showGameLose(this.props.scores);
    }

    private startGame() {
        this.renderer.hideOverlays();
        this.props.level = 1;
        this.props.score = 0;
        this.props.numSpells = 1;

        this.mapper.reset();
        this.moveToLevel(this.props.level);
        this.tick();
        this.draw();
    }

    private moveToLevel(levelNum: number, movingUp: boolean = false) {
        this.props.spawnRate = 15;
        this.props.spawnCounter = this.props.spawnRate;

        if (this.props.player != null) {
            this.mapper.getCurrentLevel().removeActor(this.props.player);
        } else {
            this.props.player = new PlayerActor(null);
        }

        const levelToMoveTo = this.mapper.getOrCreateLevel(levelNum);

        // player reset method?
        this.props.player.offsetX = 0;
        this.props.player.offsetY = 0;
        this.props.player.stunned = false;
        this.props.player.lastMove = [0, 0];

        levelToMoveTo.addActor(this.props.player, movingUp);

        this.props.sidebarNeedsUpdate = true;
    }

    private addScore(score: number, won: boolean) {
        const scores = this.getScores();
        const scoreObject: Score = new Score(score, 1, score, won);
        const lastScore = scores.pop();

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

    private prevLevel() {
        if (this.props.level > 1) {
            this.props.level--;
            this.moveToLevel(this.props.level, true);
        }
        else {
            // TODO: Notify they can't leave
        }
    }

    private nextLevel() {
        if (this.props.level == numLevels) {
            this.FSM.triggerEvent(GAME_EVENTS.PLAYERWIN);
        } else {
            this.audioPlayer.playSound(SOUNDFX.NEWLEVEL);
            this.props.level++;
            this.moveToLevel(this.props.level);
        }
    }
}
