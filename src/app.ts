import { Game } from './game';

export default class App {
    constructor() { }

    init() {
        Game.getInstance().init();
    }
}
