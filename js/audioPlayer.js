const SOUNDFX = {
    PLAYERHIT: "hit1",
    MONSTERHIT: "hit2",
    BOOK: "book",
    NEWLEVEL: "newLevel",
    SPELL: "spell",
}

class AudioPlayer {
    constructor() {
        if(!AudioPlayer.instance){
            this.sounds = {
                hit1: null,
                hit2: null,
                book: null,
                newLevel: null,
                spell: null,
            };

            AudioPlayer.instance = this;
        }

        return AudioPlayer.instance;
    }

    initSounds() {        
        this.sounds['hit1'] = new Audio('sounds/hit1.wav');
        this.sounds['hit2'] = new Audio('sounds/hit2.wav');
        this.sounds['book'] = new Audio('sounds/book.wav');
        this.sounds['newLevel'] = new Audio('sounds/newLevel.wav');
        this.sounds['spell'] = new Audio('sounds/spell.wav');
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