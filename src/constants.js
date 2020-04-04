export const maxHp = 6;
export const numLevels = 10;
export const numTiles = 12;
export const startingHp = 3;
export const tileSize = 64;
export const uiWidth = 3;

export const EFFECT_SPRITE_INDICES = {
    Heal: 0,
    Flame: 1,
    Bolt_Horizontal: 2,
    Bolt_Vertical: 3
};

export const GAME_EVENTS = {
    ASSETSLOADED: "AssetsLoaded",
    KEYPRESS: "KeyPress",
    PLAYERLOSE: "PlayerLose",
    PLAYERWIN: "PlayerWin"
};

export const GAME_STATES = {
    GAMEOVER: "GameOver",
    GAMEWIN: "GameWin",
    LOADING: "Loading",
    RUNNING: "Running",
    TITLE: "Title"
};

export const ITEM_SPRITE_INDICES = {
    Book: 0
};

export const MONSTER_SPRITE_INDICES = {
    Player: 0,
    Player_Dead: 1,
    Bird: 2,
    Snake: 3,
    Tank: 4,
    Eater: 5,
    Jester: 6,
    HP: 7,
    MonsterLoad: 8,
    Turret_N: 9,
    Turret_E: 10,
    Turret_S: 11,
    Turret_W: 12,
};

export const SOUNDFX = {
    BOOK: "book.wav",
    MONSTERHIT: "hit2.wav",
    NEWLEVEL: "newLevel.wav",
    PLAYERHIT: "hit1.wav",
    SPELL: "spell.wav"
};

export const SPRITETYPES = {
    EFFECTS: "effect",
    ITEMS: "item",
    MONSTER: "Monster",
    TILE: "tile",
};

export const TILE_SPRITE_INDICES = {
    Floor: 0,
    Wall: 1,
    StairDown: 2,
    StairUp: 3,
    SpikePit: 4,
    FountainActive: 5,
    FountainInactive: 6
};
