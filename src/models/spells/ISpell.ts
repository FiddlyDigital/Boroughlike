import { IActor } from "../actors/base/IActor";

export interface ISpell {
    name: string;
    caster: IActor;
    cast(): void;
}
