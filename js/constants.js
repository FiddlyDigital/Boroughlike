const maxHp = 6;
const numLevels = 10; 
const numTiles = 12;
const startingHp = 3;
const tileSize = 64;
const uiWidth = 3;
var numSpells = 1;

const EFFECT_SPRITE_INDICES = {
    Heal : 0,
    Flame : 1,
    Bolt_Horizontal: 2,
    Bolt_Vertical: 3
};

const GAME_EVENTS = {
    ASSETSLOADED: "AssetsLoaded",
    KEYPRESS: "KeyPress",
    PLAYERLOSE: "PlayerLose",
    PLAYERWIN: "PlayerWin"
};

const GAME_STATES = {
    GAMEOVER: "GameOver",
    GAMEWIN: "GameWin",
    LOADING: "Loading",
    RUNNING: "Running",
    TITLE: "Title"
};

const ITEM_SPRITE_INDICES = {
    Book : 0
};

const MONSTER_SPRITE_INDICES = {
    Player: 0,
    Player_Dead: 1,
    Bird: 2,
    Snake: 3,
    Tank: 4,
    Eater: 5,
    Jester: 6,
    HP : 7,
    MonsterLoad : 8,
    Turret_N: 9,
    Turret_E: 10,
    Turret_S: 11,
    Turret_W: 12,
};

const SOUNDFX = {
    BOOK: "book.wav",
    MONSTERHIT: "hit2.wav",
    NEWLEVEL: "newLevel.wav",
    PLAYERHIT: "hit1.wav",
    SPELL: "spell.wav"
};

const SPRITETYPES = {
    EFFECTS: "effect",
    ITEMS: "item",
    MONSTER: "Monster",
    TILE: "tile",
};

const TILE_SPRITE_INDICES = {
    Floor: 0,
    Wall: 1,
    StairDown: 2,
    StairUp: 3,
    SpikePit: 4,
    FountainActive: 5,
    FountainInactive: 6
};
