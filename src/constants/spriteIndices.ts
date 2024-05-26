import { Dictionary } from "../utilities";

export const EFFECT_SPRITE_INDICES: Dictionary<Array<number>> = {
    Heal: [0, 0],
    Flame: [1, 0],
    Bolt_Horizontal: [2, 0],
    Bolt_Vertical: [3, 0],
};

export const ITEM_SPRITE_INDICES: Dictionary<Array<number>> = {
    Book: [0, 0]
};

export const MONSTER_SPRITE_INDICES: Dictionary<Array<number>> = {
    Player: [0, 0],
    Player_Dead: [1, 0],
    Bird: [2, 0],
    Snake: [3, 0],
    Tank: [4, 0],
    Eater: [5, 0],
    Jester: [6, 0],
    HP: [7, 0],
    MonsterLoad: [8, 0],
    Turret_N: [9, 0],
    Turret_E: [10, 0],
    Turret_S: [11, 0],
    Turret_W: [12, 0],
};

export const TILE_SPRITE_INDICES: Dictionary<Array<number>> = {
    //Floor: [0,0], // Standalone    
    StairDown: [1, 0],
    StairUp: [1, 1],
    SpikePit: [2, 0],
    FountainActive: [3, 0],
    FountainInactive: [3, 1],
    Wall: [0, 2], // Standalone
    Wall_L: [1, 2],
    Wall_R: [2, 2],
    Wall_LR: [3, 2],
    Wall_T: [0, 3],
    Wall_B: [1, 3],
    Wall_TB: [2, 3],
    Wall_LT: [3, 3],
    Wall_RT: [0, 4],
    Wall_LRT: [1, 4],
    Wall_LB: [2, 4],
    Wall_RB: [3, 4],
    Wall_LRB: [0, 5],
    Wall_LTB: [1, 5],
    Wall_RTB: [2, 5],
    Wall_LRTB: [3, 5],
    Floor: [0, 6], // Standalone
    Floor_L: [1, 6],
    Floor_R: [2, 6],
    Floor_LR: [3, 6],
    Floor_T: [0, 7],
    Floor_B: [1, 7],
    Floor_TB: [2, 7],
    Floor_LT: [3, 7],
    Floor_RT: [0, 8],
    Floor_LRT: [1, 8],
    Floor_LB: [2, 8],
    Floor_RB: [3, 8],
    Floor_LRB: [0, 9],
    Floor_LTB: [1, 9],
    Floor_RTB: [2, 9],
    Floor_LRTB: [3, 9]
};