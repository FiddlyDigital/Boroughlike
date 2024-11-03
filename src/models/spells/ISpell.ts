import { IActor } from "../actors/IActor";

export interface ISpell {
    name: string;
    caster: IActor;
    cast(): void;
}
