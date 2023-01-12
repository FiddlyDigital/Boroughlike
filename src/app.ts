import "reflect-metadata";
import { container, injectable } from 'tsyringe';
import { AudioPlayer } from "./audioPlayer";
import { GameEngine } from './gameEngine';
import { LevelGenerator } from "./mapping/levelGenerator";
import { Mapper } from "./mapper";
import { Renderer } from "./renderer";

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
