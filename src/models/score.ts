export class Score {
    score: number = 0;
    run: number = 1;
    totalScore: number = 0;
    active: boolean = false;

    public constructor(score: number | undefined, run: number | undefined, totalScore: number | undefined, active: boolean | undefined) {
        this.score = score ?? 0;
        this.run = run ?? 1;
        this.totalScore = totalScore ?? 0;
        this.active = active ?? false
    }
}