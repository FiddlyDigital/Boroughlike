import { BSPTreemapLevel } from './generic/bspLevel';
import { Branches } from '../constants/enums';
import { IMap } from '../interfaces/IMap';
import { ILevelGenerator } from '../interfaces/ILevelGenerator';

export class LevelGenerator implements ILevelGenerator {
    generateLevel(levelNum: number, branch: string): IMap | null {
        switch (branch) {
            case Branches.LIBRARY:
                return this.generateLibraryLevel(levelNum);
            default:
                return null;
        }
    }

    private generateLibraryLevel(levelNum: number): IMap {
        switch (levelNum) {
            // case 1:
            //     level = new LibraryEntranceLevel();   // Consider Usage
            // case 7:
            //     level = new LibraryReadingRoom();     // Safe Area - NPCs only?
            // case 16:
            //     level = new LibraryTopFloorLevel();   // Boss Encounter?
            default:
                return new BSPTreemapLevel(levelNum).map;
        }
    }
}