import { HUBEVENTS, SOUNDFX } from "../../constants/enums";
import { Hub } from "../../services/hub";
import { BaseActor } from "../actors/baseActor";

export abstract class BaseSpell {
    public caster: BaseActor;
    public name: string;

    protected constructor(caster: BaseActor, name: string) {
        this.caster = caster;
        this.name = name;
    }

    public cast(): void {
        Hub.getInstance().publish(HUBEVENTS.PLAYSOUND, SOUNDFX.SPELL);
    };

    protected boltTravel(caster: BaseActor, direction: Array<number>, effect: any, damage: number): void {
        let newTile = caster.tile;
        while (true) {
            let testTile = newTile.getNeighbor(direction[0], direction[1]);
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