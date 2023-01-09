import { SOUNDFX } from './constants';
import { Hub } from './hub';

export class AudioPlayer {
    private static instance: AudioPlayer;
    sounds: any = {};

    private constructor() {
        this.initSounds()
        Hub.getInstance().subscribe("PLAYSOUND", (soundName : string) => { 
            AudioPlayer.getInstance().playSound(soundName);
        });
    }

    public static getInstance(): AudioPlayer {
        if (!AudioPlayer.instance) {
            AudioPlayer.instance = new AudioPlayer();
        }

        return AudioPlayer.instance;
    }

    initSounds() {
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
