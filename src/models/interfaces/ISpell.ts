import { IActor } from "./IActor";

export interface ISpell {
    name: string;
    caster: IActor;
    cast(): void;
}
