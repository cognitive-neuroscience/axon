export class Matrix {

    digits: number[] = [];

    constructor(trials: number = 10, prob = 50) {

        while (this.digits.length < trials) {
            const digit = this.getRandomInt(10);
            if (digit > 0 && digit !== 5) {
                this.digits.push(digit);
            }
        }
    }

    getRandomInt(max: number) {
        return Math.floor(Math.random() * Math.floor(max));
    }

}