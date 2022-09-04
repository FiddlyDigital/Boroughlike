import { SOUNDFX } from './constants';

export class AudioPlayer {
    private static instance: AudioPlayer;
    sounds: any;

    private constructor() {
        this.sounds = {};
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
