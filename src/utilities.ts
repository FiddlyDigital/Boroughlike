/* eslint-disable @typescript-eslint/no-explicit-any */
export function tryTo(description: string, callback: Function) {
    for (let timeout = 1000; timeout > 0; timeout--) {
        if (callback()) {
            return;
        }
    }

    throw 'Timeout while trying to ' + description;
}

export function randomRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle(arr: Array<any>): Array<any> {
    let temp, r;

    for (let i = 1; i < arr.length; i++) {
        r = randomRange(0, i);
        temp = arr[i];
        arr[i] = arr[r];
        arr[r] = temp;
    }

    return arr;
}

export interface Dictionary<T> {
    [key: string]: T;
}
