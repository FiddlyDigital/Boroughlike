const SOUNDPLAYER = (function(){    
    const SOUNDFX = {
        PLAYERHIT: "hit1",
        MONSTERHIT: "hit2",
        TREASURE: "treasure",
        NEWLEVEL: "newLevel",
        SPELL: "spell",
    };
    
    function initSounds() {
        sounds = {
            hit1: new Audio('sounds/hit1.wav'),
            hit2: new Audio('sounds/hit2.wav'),
            treasure: new Audio('sounds/treasure.wav'),
            newLevel: new Audio('sounds/newLevel.wav'),
            spell: new Audio('sounds/spell.wav'),
        };
    }
    
    function playSound(soundName) {
        if (soundName && sounds[soundName]) {
            sounds[soundName].currentTime = 0;
            sounds[soundName].play();
        }
    }

    return {
        SOUNDFX: SOUNDFX,
        initSounds: initSounds,
        playSound: playSound
    };
}());
