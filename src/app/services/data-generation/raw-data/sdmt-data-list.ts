import { SDMTImageEnum, SDMTImageToNumberMapping, SDMTTaskSimulus } from '../stimuli-models';

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
