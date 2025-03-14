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
    level: number;
    player: PlayerActor;
    FSM: FiniteStateMachine;
    localStorage: Dictionary<string>;
    lastAnimateUpdate: number;
    numSpells: number;
    score: number;
    spawnCounter: number;
    spawnRate: number;
    sidebarNeedsUpdate: boolean;

    constructor(
        @inject("IAudioPlayer") private audioPlayer: IAudioPlayer,
        @inject("IMapper") private mapper: IMapper,
        @inject("IRenderer") private renderer: IRenderer
    ) {
        this.localStorage = {};
        this.level = 1;
        this.player = new PlayerActor(null);
        this.numSpells = 1;
        this.score = 0;
        this.spawnCounter = 0;
        this.spawnRate = 15;
        this.sidebarNeedsUpdate = false;
        //this.version = version;          

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
                this.player.tryMove(0, -1)
                break;
            case "Down": case "ArrowDown":
            case "s": case "S":
                this.player.tryMove(0, 1);
                break;
            case "Left": case "ArrowLeft":
            case "a": case "A":
                this.player.tryMove(-1, 0);
                break;
            case "Right": case "ArrowRight":
            case "d": case "D":
                this.player.tryMove(1, 0);
                break;
            case " ": // Spacebar; 'Pass' a turn
                this.player.tryMove(0, 0);
                break;
            case "Enter":
            case "Return":
                this.player.activateTile();
                break;
            // case 1: case "1": case 2: case "2": case 3: case "3":
            // case 4: case "4": case 5: case "5": case 6: case "6":
            // case 7: case "7": case 8: case "8": case 9: case "9":
            //     this.player.castSpell(parseInt(e.key) - 1);
            //     this.sidebarNeedsUpdate = true;
            //     break;
        }

        this.tick();
    }

    /**
     * This is the animation loop, which is called every at 60fps regardless of the gamestate
     */
    private draw(): void {
        if (this.FSM.currentState.name == GAME_STATES.RUNNING) {
            const nowMs = new Date().getTime();
            if (nowMs >= this.lastAnimateUpdate + refreshRate) {
                this.lastAnimateUpdate = nowMs;

                this.renderer.updateScreen(this.mapper.getCurrentLevel());

                if (this.sidebarNeedsUpdate) {
                    this.sidebarNeedsUpdate = false;
                    this.renderer.updateSidebar(this.level, this.score, null);
                }
            }

            requestAnimationFrame(this.draw.bind(this));
        }
    }

    /**
     * This is an update to the gamestate, usually only triggered by player input
     */
    private tick(): void {
        const currentLevel = this.mapper.getCurrentLevel();
        if (currentLevel) {
            const currentLevelMonsters = currentLevel.getMonsters();
            for (let k = currentLevelMonsters.length - 1; k >= 0; k--) {
                if (!currentLevelMonsters[k].isDead()) {
                    currentLevelMonsters[k].tickUpdate();
                } else {
                    currentLevel.removeActor(currentLevelMonsters[k]);
                }
            }

            this.player.tickUpdate();

            if (this.player.isDead()) {
                this.AddScoreAndGetList(this.score, false);
                this.sidebarNeedsUpdate = true;
                this.FSM.triggerEvent(GAME_EVENTS.PLAYERLOSE);
            }

            this.spawnCounter--;
            if (this.spawnCounter <= 0) {
                currentLevel.spawnMonster();
                this.spawnCounter = this.spawnRate;
                this.spawnRate--;
            }
        }
    }

    private showTitle(): void {
        this.renderer.showTitle(this.getScores());
    }

    private showGameWin() {
        // TODO: audioPlayer.playSound(SOUNDFX.GAMEWIN);    
        const updatedScores: Score[] = this.AddScoreAndGetList(this.score, true);
        this.renderer.showGameWin(updatedScores);
    }

    private showGameLose() {
        // TODO: audioPlayer.playSound(SOUNDFX.GAMELOSE);
        const updatedScores: Score[] = this.AddScoreAndGetList(this.score, true);
        this.renderer.showGameLose(updatedScores);
    }

    private startGame() {
        this.renderer.hideOverlays();
        this.level = 1;
        this.score = 0;
        this.numSpells = 1;

        // Reset the mapper first
        this.mapper.reset();
        
        // Create the first level before moving to it
        const firstLevel = this.mapper.getOrCreateLevel(this.level);
        if (!firstLevel) {
            console.error("Failed to create first level");
            return;
        }

        // Now move to the level
        this.moveToLevel(this.level);
        this.tick();
        this.draw();
    }

    private moveToLevel(levelNum: number, movingUp: boolean = false) {
        this.spawnRate = 15;
        this.spawnCounter = this.spawnRate;
        
        // Get the new level first to ensure it exists
        const levelToMoveTo = this.mapper.getOrCreateLevel(levelNum);
        const currLevel = this.mapper.getCurrentLevel();

        // Only remove player from current level if we have one and the player is in it
        if (currLevel && this.player && this.player.tile) {
            currLevel.removeActor(this.player);
        } else {
            this.player = new PlayerActor(null);
        }

        // player reset method?
        this.player.offsetX = 0;
        this.player.offsetY = 0;
        this.player.stunned = false;
        this.player.lastMove = [0, 0];

        levelToMoveTo.addActor(this.player, movingUp);

        this.sidebarNeedsUpdate = true;
    }

    private AddScoreAndGetList(score: number, won: boolean): Array<Score> {
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
        return scores;
    }

    private getScores() {
        if (this.localStorage["scores"]) {
            return JSON.parse(this.localStorage["scores"]);
        } else {
            return [];
        }
    }

    private prevLevel() {
        if (this.level > 1) {
            this.level--;
            this.moveToLevel(this.level, true);
        }
        else {
            // TODO: Notify they can't leave
        }
    }

    private nextLevel() {
        if (this.level == numLevels) {
            this.FSM.triggerEvent(GAME_EVENTS.PLAYERWIN);
        } else {
            this.audioPlayer.playSound(SOUNDFX.NEWLEVEL);
            this.level++;
            this.moveToLevel(this.level);
        }
    }
}
