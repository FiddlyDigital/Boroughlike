import { singleton } from "tsyringe";
import { HUBEVENTS, SOUNDFX } from '../constants/enums';
import { Hub } from './hub';
import { IAudioPlayer } from "./interfaces/IAudioPlayer";
import { sfxAssetPath } from "../constants/values";
import { Dictionary } from "../utilities";

@singleton()
export class AudioPlayer implements IAudioPlayer {
    sounds: Dictionary<HTMLAudioElement> = {};

    constructor() {
        this.initSounds()
        Hub.getInstance().subscribe(HUBEVENTS.PLAYSOUND, this.playSound.bind(this));
    }

    private initSounds() {
        // Load each sound
        for (const value of Object.values(SOUNDFX)) {
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
