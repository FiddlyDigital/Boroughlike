import { Dictionary } from "../utilities";

export const GAME_EVENTS: Dictionary<string> = {
    ASSETSLOADED: "AssetsLoaded",
    KEYPRESS: "KeyPress",
    PLAYERLOSE: "PlayerLose",
    PLAYERWIN: "PlayerWin"
};

export const GAME_STATES: Dictionary<string> = {
    GAMEOVER: "GameOver",
    GAMEWIN: "GameWin",
    LOADING: "Loading",
    RUNNING: "Running",
    TITLE: "Title",
    POPUP: "Popup"
};

export const SOUNDFX: Dictionary<string> = {
    BOOK: "book.wav",
    MONSTERHIT: "hit2.wav",
    NEWLEVEL: "newLevel.wav",
    PLAYERHIT: "hit1.wav",
    SPELL: "spell.wav"
};

export const SPRITETYPES: Dictionary<string> = {
    EFFECTS: "effect",
    ITEMS: "item",
    MONSTER: "Monster",
    TILE: "tile",
};

export const Branches: Dictionary<string> = {
    LIBRARY: "Library",     // Standard Dungeon - Hub for other areas
    ADVENTURE: "Adventure", // Pirates? boat required
    HORROR: "Horror",       // Nightime / limited LOS. Lamp or Torch reqd.
    SCIFI: "SciFi"          // Radiation Shield reqd.
}

export const DIRECTION: Dictionary<string> = {
    N: "N",
    NE: "NE",
    E: "E",
    SE: "SE",
    S: "S",
    SW: "SW",
    W: "W",
    NW: "NW"
}