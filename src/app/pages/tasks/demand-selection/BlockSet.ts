import { Color } from 'src/app/models/InternalDTOs';

export enum DScounterbalance {
    SELECTEASYPATCH = "Select easy patch",
    SELECTHARDPATCH = "Select hard patch",
    NONE = "No Counterbalance"
}

export class Block {
    blockConfig: {
        firstPatchImg: string;
        secondPatchImg: string;
        rotation: number;
        counterbalance: DScounterbalance;
    };
    trialConfigs: {
        firstPatch: Color;
        secondPatch: Color;
        digit: number;
    }[];

    constructor() {
        this.blockConfig = {
            firstPatchImg: "",
            secondPatchImg: "",
            rotation: null,
            counterbalance: DScounterbalance.NONE
        }
        this.trialConfigs = []
    }
}

export class BlockSet {

    private static readonly colorStims = [
        'abst01a.png',
        'abst01b.png',
        'abst02a.png',
        'abst02b.png',
        'abst03a.png',
        'abst03b.png',
        'abst04a.png',
        'abst04b.png',
        'abst05a.png',
        'abst05b.png',
        'abst06a.png',
        'abst06b.png',
        'abst07a.png',
        'abst07b.png',
        'abst08a.png',
        'abst08b.png',
        'abst09a.png',
        'abst09b.png',
        'abst10a.png',
        'abst10b.png',
        'abst11a.png',
        'abst11b.png',
        'abst12a.png',
        'abst12b.png',
    ]

    private static readonly practiceColorStims = [
        'abstPa.png',
        'abstPb.png',
    ]

    blocks: Block[];

    constructor(
        trialsPerBlock: number[] = [50, 50, 50, 50, 35, 35],    // array of num trials to generate (for each block)
        probOfShiftFirstPatch: number = 10,                     // probability that the color will shift for the first patch, by default the easier patch
        probOfShiftSecondPatch: number = 90,                    // probability that the color will shift for the second patch, by default the harder patch
        oddEvenColor: Color = Color.BLUE,
        ltGtColor: Color = Color.ORANGE,
        isPractice: boolean = false                             // if set to true, creates a BlockSet with practice stims
    ) {
        this.blocks = [];
        const usedColorStims: string[] = [];

        // create x number of blocks where x is the size of trialsPerBlock
        for(let blockNum = 0; blockNum < trialsPerBlock.length; blockNum++) {

            const block = new Block();            

            // 1st: populate configs
            const blockConfig = block.blockConfig;
            if(isPractice) {
                blockConfig.firstPatchImg = BlockSet.practiceColorStims[0];
                blockConfig.secondPatchImg = BlockSet.practiceColorStims[1];
            } else {
                blockConfig.firstPatchImg = this.getColorStim(usedColorStims);
                usedColorStims.push(blockConfig.firstPatchImg);
                blockConfig.secondPatchImg = this.getColorStim(usedColorStims);
                usedColorStims.push(blockConfig.secondPatchImg);
            }
    
            // choose a degree of rotation between 0 and 359 (because 0 and 360 are the same)
            blockConfig.rotation = this.getRandomInt(360);

            // set counterbalance for blocks 5 & 6 so that choosing the harder or easier patch first
            // is randomized
            if(blockNum == 4) {
                blockConfig.counterbalance = this.getRandomInt(10) > 4 ? DScounterbalance.SELECTEASYPATCH : DScounterbalance.SELECTHARDPATCH
            } else if(blockNum == 5) {
                const block4CounterBalance = this.blocks[4].blockConfig.counterbalance;
                blockConfig.counterbalance = block4CounterBalance === DScounterbalance.SELECTHARDPATCH ? DScounterbalance.SELECTEASYPATCH : DScounterbalance.SELECTHARDPATCH
            }

            // 2nd: populate TrialConfigs
            for(let i = 0; i < trialsPerBlock[blockNum]; i++) {
                let firstPatch: Color;
                let secondPatch: Color;
                
                // for the first time, just choose a color at random
                if(block.trialConfigs.length == 0) {
                    firstPatch = Math.random() > 0.5 ? oddEvenColor : ltGtColor;
                    secondPatch = Math.random() > 0.5 ? oddEvenColor : ltGtColor;
                } else {
                    const lastMatrixElement = block.trialConfigs[block.trialConfigs.length - 1]
                    firstPatch = this.shouldShift(probOfShiftFirstPatch) ? (lastMatrixElement.firstPatch === oddEvenColor ? ltGtColor : oddEvenColor) : lastMatrixElement.firstPatch;
                    secondPatch = this.shouldShift(probOfShiftSecondPatch) ? (lastMatrixElement.secondPatch === oddEvenColor ? ltGtColor : oddEvenColor) : lastMatrixElement.secondPatch;
                }
    
                block.trialConfigs.push({
                    firstPatch: firstPatch,
                    secondPatch: secondPatch,
                    digit: this.getDigit(block)
                });
            }
            this.blocks.push(block);
        }
    }

    private getColorStim(usedColorStims: string[]): string {
        let randIndex = Math.floor(Math.random() * BlockSet.length);
        let randColorStim = BlockSet.colorStims[randIndex];
        while(usedColorStims.includes(randColorStim)) {
            randIndex = Math.floor(Math.random() * BlockSet.colorStims.length);
            randColorStim = BlockSet.colorStims[randIndex];
        }
        return randColorStim;
    }

    private shouldShift(probability: number): boolean {
        const prob = 100 - probability;
        return Math.random() >= (prob/100);
    }

    private getDigit(block: Block): number {
        let digit = this.getRandomInt(10);
        const prevDigit = block.trialConfigs.length > 0 ? block.trialConfigs[block.trialConfigs.length - 1].digit : null;
        //  digits are 1,2,3,4,6,7,8,9 - don't repeat same digit twice
        while(digit == 0 || digit == 5 || digit == prevDigit) {
            digit = this.getRandomInt(10);
        }
        return digit;
    }

    // gets a random number from 0 to (max - 1)
    private getRandomInt(max: number) {
        return Math.floor(Math.random() * max);
    }

}