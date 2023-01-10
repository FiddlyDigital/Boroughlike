import "reflect-metadata";
import { container, injectable } from 'tsyringe';
import { Game } from './game';

@injectable()
export default class App {
    game: Game;

    constructor() { 
        this.game = container.resolve(Game);
    }

    init() {
        this.game.init();
    }
}
