import { getRandomNumber, shuffle } from 'src/app/common/commonMethods';
import { SDMTImageEnum, SDMTImageToNumberMapping, SDMTTaskSimulus } from '../stimuli-models';

// this is only run once and we use the output from that time for everything. I've kept the code here for provenance.
function generateStaticSDMTData(imageToNumberMapping: SDMTImageToNumberMapping, blockSize: number) {
    const possibleAnswers = [
        {
            imageURL: SDMTImageEnum.IMAGE1,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE1],
            userAnswer: '',
        },
        {
            imageURL: SDMTImageEnum.IMAGE2,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE2],
            userAnswer: '',
        },
        {
            imageURL: SDMTImageEnum.IMAGE3,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE3],
            userAnswer: '',
        },
        {
            imageURL: SDMTImageEnum.IMAGE4,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE4],
            userAnswer: '',
        },
        {
            imageURL: SDMTImageEnum.IMAGE5,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE5],
            userAnswer: '',
        },
        {
            imageURL: SDMTImageEnum.IMAGE6,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE6],
            userAnswer: '',
        },
        {
            imageURL: SDMTImageEnum.IMAGE7,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE7],
            userAnswer: '',
        },
        {
            imageURL: SDMTImageEnum.IMAGE8,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE8],
            userAnswer: '',
        },
        {
            imageURL: SDMTImageEnum.IMAGE9,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE9],
            userAnswer: '',
        },
    ];

    const stimuli: SDMTTaskSimulus[] = [];

    for (let i = 0; i < 12; i++) {
        let newBlock = shuffle(possibleAnswers);

        for (let j = 0; j < blockSize - possibleAnswers.length; j++) {
            let newStimulus = possibleAnswers[getRandomNumber(0, possibleAnswers.length)];
            while (newStimulus.imageURL === newBlock[newBlock.length - 1].imageURL) {
                newStimulus = possibleAnswers[getRandomNumber(0, possibleAnswers.length)];
            }
            newBlock.push(newStimulus);
        }

        while (
            (i > 0 && newBlock[0].imageURL === stimuli[stimuli.length - 1].imageURL) ||
            newBlock.find((_, index) => newBlock[index].imageURL === newBlock[index + 1]?.imageURL) // index + 1 will yield undefined at the end so this works
        ) {
            newBlock = shuffle(newBlock);
        }

        stimuli.push(...newBlock);
    }
    return stimuli;
}

export const getSDMTPracticeStimuli = (imageToNumberMapping: SDMTImageToNumberMapping): SDMTTaskSimulus[][] => [
    [
        {
            imageURL: SDMTImageEnum.IMAGE3,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE3],
            userAnswer: '3',
        },
        {
            imageURL: SDMTImageEnum.IMAGE1,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE1],
            userAnswer: '1',
        },
        {
            imageURL: SDMTImageEnum.IMAGE5,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE5],
            userAnswer: '5',
        },
        {
            imageURL: SDMTImageEnum.IMAGE4,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE4],
            userAnswer: '',
        },
        {
            imageURL: SDMTImageEnum.IMAGE9,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE9],
            userAnswer: '',
        },
        {
            imageURL: SDMTImageEnum.IMAGE7,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE7],
            userAnswer: '',
        },
        {
            imageURL: SDMTImageEnum.IMAGE2,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE2],
            userAnswer: '',
        },
        {
            imageURL: SDMTImageEnum.IMAGE8,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE8],
            userAnswer: '',
        },
        {
            imageURL: SDMTImageEnum.IMAGE6,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE6],
            userAnswer: '',
        },
    ],
];

export const getSDMTRealStimuli = (imageToNumberMapping: SDMTImageToNumberMapping): SDMTTaskSimulus[][] => [
    generateStaticSDMTData(imageToNumberMapping, 18),
];
