const SOUNDFX = {
    PLAYERHIT: "hit1.wav",
    MONSTERHIT: "hit2.wav",
    BOOK: "book.wav",
    NEWLEVEL: "newLevel.wav",
    SPELL: "spell.wav",
}

class AudioPlayer {
    constructor() {
        if(!AudioPlayer.instance){
            this.sounds = {};

            // Populate all values with nulls now
            // as we won't be able to add entries/props after freezing this instance
            for (let [key, value] of Object.entries(SOUNDFX)) {                
                this.sounds[value] = null;
            }
                
            AudioPlayer.instance = this;
        }

        return AudioPlayer.instance;
    }

    initSounds() {  
        // Load each sound
        for (let [key, value] of Object.entries(SOUNDFX)) {                
            this.sounds[value] = new Audio(`assets/sounds/${value}`);
        }                
    }

    playSound(soundName) {        
        if (soundName && this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play();
        }
    }
}

const audioPlayer = new AudioPlayer();
Object.freeze(audioPlayer);

//export default audioPlayer;