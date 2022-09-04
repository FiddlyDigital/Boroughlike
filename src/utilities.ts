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

export function rightPad(textArray: Array<string>): string {
    let finalText = "";

    textArray.forEach(text => {
        text += "";
        for (let i = text.length; i < 10; i++) {
            text += " ";
        }
        finalText += text;
    });

    return finalText;
}

export interface Dictionary<T> {
    [key: string] : T;
}

//https://www.delftstack.com/howto/typescript/typescript-cloning-an-object/
export function deepCopy<T>(instance : T) : T {
    if ( instance == null){
        return instance;
    }

    // handle Dates
    if (instance instanceof Date) {
        return new Date(instance.getTime()) as any;
    }

    // handle Array types
    if (instance instanceof Array){
        var cloneArr = [] as any[];
        (instance as any[]).forEach((value)  => {cloneArr.push(value)});
        // for nested objects
        return cloneArr.map((value: any) => deepCopy<any>(value)) as any;
    }

    // handle objects
    if (instance instanceof Object) {
        var copyInstance = { ...(instance as { [key: string]: any }
        ) } as { [key: string]: any };
        for (var attr in instance) {
            if ( (instance as Object).hasOwnProperty(attr)) 
                copyInstance[attr] = deepCopy<any>(instance[attr]);
        }
        return copyInstance as T;
    }

    // handling primitive data types
    return instance;
}