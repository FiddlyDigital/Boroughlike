import { singleton } from "tsyringe";
import { SOUNDFX } from './constants';
import { Hub } from './hub';
import { IAudioPlayer } from "./interfaces/IAudioPlayer";

@singleton()
export class AudioPlayer implements IAudioPlayer {
    sounds: any = {};

    constructor() {
        this.initSounds()
        Hub.getInstance().subscribe("PLAYSOUND", this.playSound.bind(this));
    }

    private initSounds() {
        // Load each sound
        for (let [key, value] of Object.entries(SOUNDFX)) {
            this.sounds[value] = new Audio(`assets/sounds/${value}`);
        }
    }

    playSound(soundName: string) {
        if (soundName && this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play();
        }
    }
}
