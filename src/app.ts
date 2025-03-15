import "reflect-metadata";
import { container, injectable } from 'tsyringe';
import { AudioPlayer } from "./services/audioPlayer";
import { GameEngine } from './services/gameEngine';
import { LevelGenerator } from "./services/mapping/levelGenerator";
import { Mapper } from "./services/mapper";
import { Renderer } from "./services/renderer";
//import './style/index.css';

@injectable()
export default class App {
    game: GameEngine;

    constructor() {
        // DI Registry
        container.register("IAudioPlayer", { useClass: AudioPlayer });
        container.register("ILevelGenerator", { useClass: LevelGenerator });
        container.register("IMapper", { useClass: Mapper });
        container.register("IRenderer", { useClass: Renderer });

        // Service-locator pattern
        this.game = container.resolve(GameEngine);
    }

    init() {
        this.game.init();
    }
}
