// In progress!
import { DefaultLevel } from './generic/defaultLevel.js';
import { CellularAutomationLevel } from './generic/cellularAutomatonLevel.js';
import { BSPTreemapLevel } from './generic/bspLevel.js';

export const Branches = {
    LIBRARY: "Library",     // Standard Dungeon - Hub for other areas
    ADVENTURE: "Adventure", // Pirates? boat required
    HORROR: "Horror",       // Nightime / limited LOS. Lamp or Torch reqd.
    SCIFI: "SciFi"          // Radiation Shield reqd.
}

export class LevelGenerator {
    generateLevel(levelNum, branch) {
        var level = null;

        switch (branch) {
            case Branches.LIBRARY:
                level = this.generateLibraryLevel(levelNum);
                break;
        }

        level.generate();
        return level;
    }

    generateLibraryLevel(levelNum) {
        switch (levelNum) {
            // case 1:
            //     level = new LibraryEntranceLevel();   // Consider Usage
            // case 7:
            //     level = new LibraryReadingRoom();     // Safe Area - NPCs only?
            // case 16:
            //     level = new LibraryTopFloorLevel();   // Boss Encounter?
            default:
                //return new CellularAutomationLevel(levelNum);
                //return new DefaultLevel(levelNum);
                return new BSPTreemapLevel(levelNum);
        }
    }

    // generateAdventureLevel() {
    //     switch (levelNum) {
    //         default:
    //         return new DefaultLevel(levelNum);
    //     }
    // }
    // generateHorrorLevel() {
    //     switch (levelNum) {
    //         default:
    //         return new DefaultLevel(levelNum);
    //     }
    // }
    // generateSciFiLevel() {
    //     switch (levelNum) {
    //         default:
    //         return new DefaultLevel(levelNum);
    //     }
    // }
}