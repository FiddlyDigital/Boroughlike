class Utilities {
    static tryTo(description, callback) {
        for (let timeout = 1000; timeout > 0; timeout--) {
            if (callback()) {
                return;
            }
        }
        throw 'Timeout while trying to ' + description;
    }

    static randomRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static shuffle(arr) {
        let temp, r;
        for (let i = 1; i < arr.length; i++) {
            r = Utilities.randomRange(0, i);
            temp = arr[i];
            arr[i] = arr[r];
            arr[r] = temp;
        }
        return arr;
    }

    static rightPad(textArray) {
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
}

export default Utilities;