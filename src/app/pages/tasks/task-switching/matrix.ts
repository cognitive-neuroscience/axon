import { Color } from 'src/app/models/InternalDTOs';


export class Matrix {

    colors: Color[] = [];
    digits: number[] = [];

    constructor(
        trials: number = 10, 
        probOfShift: number = 50, 
        oddEvenColor: Color = Color.BLUE, 
        ltGtColor: Color = Color.ORANGE
    ) {
        
        //  digits are 1,2,3,4,6,7,8,9 - don't repeat same digit twice
        while (this.digits.length < trials) {
            const digit = this.getRandomInt(10);
            const prevDigit = this.digits.length > 0 ? this.digits[this.digits.length - 1] : null;
            if (digit > 0 && digit !== 5 && digit != prevDigit) {
                this.digits.push(digit);
            }
        }

        // chose initial color
        let color = Math.random() > 0.5 ? oddEvenColor : ltGtColor;

        // populate array with the color, randomly switch color based on given probability
        while (this.colors.length < trials) {
            const shouldShift = this.shouldShift(probOfShift)
            if (shouldShift) color = (color === oddEvenColor ? ltGtColor : oddEvenColor);
            this.colors.push(color);
        }
    }

    private shouldShift(probability: number): boolean {
        const prob = 100 - probability;
        return Math.random() >= (prob/100);
    }

    private getRandomInt(max: number) {
        return Math.floor(Math.random() * max);
    }

}