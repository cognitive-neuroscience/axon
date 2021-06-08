import { generateRandomNonrepeatingNumberList, getRandomNumber } from "../../../../common/commonMethods";
import { HttpClient } from "@angular/common/http";
import { forkJoin, Observable, of } from "rxjs";
import { catchError, map, take } from "rxjs/operators";
export class OddballTrial {
    stimuli: string;
    blob: Blob;
    isTarget: boolean;
}

export class ImageBlob {
    [imgName: string]: Blob;
}

export class BlockGenerator {
    trials: OddballTrial[];

    // injected http client
    private static http: HttpClient;

    // hardcoded names of files
    private static readonly imageNames: string[] = [
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
        "square.png",
        "triangle.png",
    ];

    // list of novel objects (not triangle or square)
    private static novelBlobs: ImageBlob = {};
    // list of stimuli objects (triangle and square)
    private static stimuliBlobs: ImageBlob = {};

    // called once on nginit to initialize the class and populate ImageBlobs
    // we need to do this so that we don't get browser cache issues - images are preloaded
    public static initialize(http: HttpClient): Observable<boolean> {
        BlockGenerator.http = http;
        const getArray = BlockGenerator.imageNames.map((img) =>
            BlockGenerator.http.get(`/assets/images/stimuli/oddball/${img}`, { responseType: "blob" })
        );
        // load up all of the get requests and sort them into the distinct ImageBlob objects, return true to oddball component when are done
        return forkJoin(getArray).pipe(
            take(1),
            map((arr) => {
                arr.forEach((element: Blob, index) => {
                    const name = BlockGenerator.imageNames[index];
                    const imageBlobs =
                        name === "square.png" || name === "triangle.png"
                            ? BlockGenerator.stimuliBlobs
                            : BlockGenerator.novelBlobs;
                    imageBlobs[name] = element;
                });
                return true;
            }),
            catchError((err) => {
                console.error(err);
                return of(false);
            })
        );
    }

    get novelBlobSize(): number {
        return Object.keys(BlockGenerator.novelBlobs).length;
    }

    get novelBlobKeys(): string[] {
        return Object.keys(BlockGenerator.novelBlobs);
    }

    get stimuliBlobSize(): number {
        return Object.keys(BlockGenerator).length;
    }

    constructor(
        targetTrial: "square.png" | "triangle.png",
        numTargetTrials: number,
        numNovelTrials: number,
        numTotalTrials: number,
        scenesToExclude: string[] = []
    ) {
        if (numTotalTrials - numTargetTrials - numNovelTrials < 0)
            throw new Error("Number of total trials must be bigger or equal to the number of other types of trials");
        if (numNovelTrials > this.novelBlobSize - scenesToExclude.length)
            throw new Error("Cannot create given number of novel stimuli without repeats");

        this.trials = new Array<OddballTrial>(numTotalTrials);

        // fill with non target trials
        this.trials.fill({
            stimuli: targetTrial === "square.png" ? "triange.png" : "square.png",
            blob:
                targetTrial === "square.png"
                    ? BlockGenerator.stimuliBlobs["triangle.png"]
                    : BlockGenerator.stimuliBlobs["square.png"],
            isTarget: false,
        });

        const randIndices = generateRandomNonrepeatingNumberList(numTargetTrials + numNovelTrials, 0, numTotalTrials);

        // add the target trials
        for (let i = 0; i < numTargetTrials; i++) {
            const randIndex = randIndices[i];
            this.trials[randIndex] = {
                stimuli: targetTrial,
                blob: BlockGenerator.stimuliBlobs[targetTrial],
                isTarget: true,
            };
        }

        // add novel stimuli
        for (let i = numTargetTrials; i < numTargetTrials + numNovelTrials; i++) {
            const novelStimuli = this.getNovelStimuli(scenesToExclude);
            const randIndex = randIndices[i];
            this.trials[randIndex] = {
                stimuli: novelStimuli,
                blob: BlockGenerator.novelBlobs[novelStimuli],
                isTarget: false,
            };
        }
    }

    private getNovelStimuli(scenesToExclude: string[]): string {
        let scene = this.novelBlobKeys[getRandomNumber(0, this.novelBlobSize)];
        while (scenesToExclude.includes(scene)) {
            scene = this.novelBlobKeys[getRandomNumber(0, this.novelBlobSize)];
        }
        scenesToExclude.push(scene);
        return scene;
    }
}
