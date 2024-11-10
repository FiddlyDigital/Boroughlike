import { HUBEVENTS, SOUNDFX } from "../../constants/enums";
import { Hub } from "../../services/hub";
import { IActor } from "../actors/base/IActor";
import { ISpell } from "./ISpell";

export abstract class BaseSpell implements ISpell {
    public caster: IActor;
    public name: string;

    protected constructor(caster: IActor, name: string) {
        this.caster = caster;
        this.name = name;
    }

    public cast(): void {
        Hub.getInstance().publish(HUBEVENTS.PLAYSOUND, SOUNDFX.SPELL);
    };

    protected boltTravel(caster: IActor, direction: Array<number>, effect: any, damage: number): void {
        let newTile = caster.tile;
        while (true) {
            const testTile = newTile.getNeighbor(direction[0], direction[1]);
            if (testTile && testTile.passable) {
                newTile = testTile;

                if (newTile.monster) {
                    newTile.monster.hit(damage);
                }

                newTile.setEffect(effect);
            } else {
                break;
            }
        }
    }
}