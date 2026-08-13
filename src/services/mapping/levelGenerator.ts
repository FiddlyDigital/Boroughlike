import { BSPTreemapLevel } from './generic/bspLevel';
import { CellularAutomationLevel } from './generic/cellularAutomatonLevel';
import { DesertLevel } from './generic/desertLevel';
import { caveEndLevel, desertEndLevel } from '../../constants/values';
import { IMap } from '../../models/maps/IMap';
import { ILevelGenerator } from '../interfaces/ILevelGenerator';

export class LevelGenerator implements ILevelGenerator {
    // Biome progression by level number:
    //   1        -> vast desert with canyons (opening to the caves)
    //   2..6     -> cellular-automaton caves (no doors)
    //   7..end   -> BSP dungeon with rooms + doors
    public generateLevel(levelNum: number, branch: string): IMap {
        void branch;

        if (levelNum <= desertEndLevel) {
            return new DesertLevel(levelNum).map;
        }

        if (levelNum <= caveEndLevel) {
            return new CellularAutomationLevel(levelNum).map;
        }

        return new BSPTreemapLevel(levelNum).map;
    }
}
