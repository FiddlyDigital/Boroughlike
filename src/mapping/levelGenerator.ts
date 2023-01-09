// In progress!
import { DefaultLevel } from './generic/defaultLevel';
import { CellularAutomationLevel } from './generic/cellularAutomatonLevel';
import { BSPTreemapLevel } from './generic/bspLevel';
import { IMap } from '../map';
import { Branches } from '../constants';

export class LevelGenerator {
    generateLevel(levelNum: number, branch: string): IMap | null {
        switch (branch) {
            case Branches.LIBRARY:
                return this.generateLibraryLevel(levelNum);
            default:
                return null;
        }
    }

    generateLibraryLevel(levelNum: number): IMap {
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
                return new BSPTreemapLevel(levelNum).map;
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