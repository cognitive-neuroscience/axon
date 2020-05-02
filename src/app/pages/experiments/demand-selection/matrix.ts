export class Matrix {

    colors: number[] = [];
    digits: number[] = [];

    constructor(trials: number = 10, prob = 50) {

        while (this.digits.length < trials) {
            const digit = this.getRandomInt(10);
            if (digit > 0 && digit !== 5) {
                this.digits.push(digit);
            }
        }

        let color = Math.random() > 0.5 ? 1 : 2;
        while (this.colors.length < trials) {
            const shouldShift = Math.random() > (prob / 100);
            if (shouldShift) {
                color = 3 - color;
            }
            this.colors.push(color);
        }
    }

    getRandomInt(max: number) {
        return Math.floor(Math.random() * Math.floor(max));
    }

}