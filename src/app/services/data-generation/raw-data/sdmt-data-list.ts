import { SDMTImageEnum, SDMTImageToNumberMapping, SDMTTaskSimulus } from '../stimuli-models';

export const getSDMTPracticeStimuli = (imageToNumberMapping: SDMTImageToNumberMapping): SDMTTaskSimulus[][] => [
    [
        {
            imageURL: SDMTImageEnum.IMAGE3,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE3],
        },
        {
            imageURL: SDMTImageEnum.IMAGE1,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE1],
        },
        {
            imageURL: SDMTImageEnum.IMAGE5,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE5],
        },
        {
            imageURL: SDMTImageEnum.IMAGE4,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE4],
        },
        {
            imageURL: SDMTImageEnum.IMAGE9,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE9],
        },
        {
            imageURL: SDMTImageEnum.IMAGE7,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE7],
        },
        {
            imageURL: SDMTImageEnum.IMAGE2,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE2],
        },
        {
            imageURL: SDMTImageEnum.IMAGE8,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE8],
        },
        {
            imageURL: SDMTImageEnum.IMAGE6,
            expectedNumber: imageToNumberMapping[SDMTImageEnum.IMAGE6],
        },
    ],
];
