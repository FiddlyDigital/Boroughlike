import { singleton } from "tsyringe";
import { HUBEVENTS, SOUNDFX } from '../constants/enums';
import { Hub } from './hub';
import { IAudioPlayer } from "./interfaces/IAudioPlayer";
import { sfxAssetPath } from "../constants/values";

@singleton()
export class AudioPlayer implements IAudioPlayer {
    sounds: any = {};

    constructor() {
        this.initSounds()
        Hub.getInstance().subscribe(HUBEVENTS.PLAYSOUND, this.playSound.bind(this));
    }

    private initSounds() {
        // Load each sound
        for (const [_key, value] of Object.entries(SOUNDFX)) {
            this.sounds[value] = new Audio(`${sfxAssetPath}${value}`);
        }
    }

    playSound(soundName: string) {
        if (soundName && this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play();
        }
    }
}
