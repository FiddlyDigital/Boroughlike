export class Room {
    x: number = 0;
    y: number = 0;
    width: number = 0;
    height: number = 0;
    maxX: number = 0;
    maxY: number = 0;
    centerX: number = 0;
    centerY: number = 0;

    constructor(x: number | null, y: number | null, width: number | null, height: number | null) {
        this.x = (x || 0);
        this.y = (y || 0);
        this.width = (width || 0);
        this.height = (height || 0);
        this.maxX = (this.x + this.width);
        this.maxY = (this.y + this.height);
        this.centerX = (this.width > 0) ? Math.ceil(this.x + (this.width / 2)) : 0;
        this.centerY = (this.height > 0) ? Math.ceil(this.y + (this.height / 2)) : 0;
    }

    isZero() {
        return (
            this.x === 0
            && this.y === 0
            && this.width === 0
            && this.height === 0
        );
    }
}
