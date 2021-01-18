export class OddballTrial {
    stimuli: string;
    isTarget: boolean;
}

export class BlockGenerator {
    
    trials: OddballTrial[];

    private readonly scenesStimuli = [
        "Scenes00010.png",
        "Scenes00015.png",
        "Scenes00047.png",
        "Scenes00086.png",
        "Scenes00104.png",
        "Scenes00162.png",
        "Scenes00197.png",
        "Scenes00263.png",
        "Scenes00500.png",
        "Scenes00539.png",
        "Scenes00768.png",
        "Scenes00790.png",
    ]

    constructor(targetTrial: 'square.png' | 'triangle.png', numTargetTrials: number, numNovelTrials: number, numTotalTrials: number, scenesToExclude: string[] = []) {
        if((numTotalTrials - numTargetTrials - numNovelTrials) < 0) throw new Error("Number of total trials must be bigger or equal to the number of other types of trials");
        if(numNovelTrials > (this.scenesStimuli.length - scenesToExclude.length)) throw new Error("Cannot create given number of novel stimuli without repeats")

        this.trials = new Array<OddballTrial>(numTotalTrials);

        // fill with non target trials
        this.trials.fill({
            stimuli: targetTrial === 'square.png' ? 'triange.png' : 'square.png',
            isTarget: false
        })

        const randIndices = this.generateRandomList(numTargetTrials + numNovelTrials, 0, numTotalTrials);

        // add the target trials
        for(let i = 0; i < numTargetTrials; i++) {
            const randIndex = randIndices[randIndices.length - 1];
            this.trials[randIndex] = {
                stimuli: targetTrial,
                isTarget: true
            }
            randIndices.pop();
        }

        // add novel stimuli
        for(let i = 0; i < numNovelTrials; i++) {
            const novelStimuli = this.getNovelStimuli(scenesToExclude);
            const randIndex = randIndices[randIndices.length - 1];
            this.trials[randIndex] = {
                stimuli: novelStimuli,
                isTarget: false
            }
            randIndices.pop();
        }

    }

    private getNovelStimuli(scenesToExclude: string[]): string {
        let scene = this.scenesStimuli[this.getRandomNumber(0, this.scenesStimuli.length)];
        while(scenesToExclude.includes(scene)) {
            scene = this.scenesStimuli[this.getRandomNumber(0, this.scenesStimuli.length)];
        }
        scenesToExclude.push(scene)
        return scene;
    }

    // generates a list of length <size> of non repeating random numbers
    // random numbers generated are lowerbound inclusive and upperbound exclusive: [lowerbound, upperbound)
    private generateRandomList(size: number, lowerBound: number, upperBound: number): number[] {
        if(size > (upperBound - lowerBound)) throw new Error("Size cannot be greater than the bounds")
        const randList = [];
        while(randList.length < size) {
            const randNum = this.getRandomNumber(lowerBound, upperBound);
            if(!randList.includes(randNum)) {
                randList.push(randNum);
            }
        }
        return randList;
    }

    private getRandomNumber(lowerbound: number, upperbound: number): number {
        return Math.floor(Math.random() * (upperbound - lowerbound)) + lowerbound;
    }
}