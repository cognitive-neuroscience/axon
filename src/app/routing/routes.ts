import { ExperimentRoutingMap } from '../models/InternalDTOs';

export const RouteMap: ExperimentRoutingMap = {
    gonogo: {
      id: "gonogo",
      title: "Go-NoGo",
      description: "Description of Go-NoGo Task",
      type: "NAB",
      route: "experiments/gonogo"
    },
    digitspan: {
      id: "digitspan",
      title: "Digit Span",
      description: "Description of Digit Span Task",
      type: "NAB",
      route: "experiments/digitspan"
    },
    fingertapping: {
      id: "fingertapping",
          title: "Finger Tapping Task",
          description: "Description of Finger Tapping Task",
      type: "NAB",
      route: "experiments/fingertapping"
    },
    nback: {
      id: "nback",
          title: "N-Back",
          description: "Description of N-Back Task",
      type: "NAB",
      route: "experiments/nback"
    },
    stroop: {
      id: "stroop",
          title: "Stroop Task",
          description: "Description of the Stroop Task",
      type: "NAB",
      route: "experiments/stroop"
    },
    trailmaking: {
      id: "trailmaking",
          title: "Trail Making",
          description: "Description of Trail Making Task",
      type: "NAB",
      route: "experiments/trailmaking"
    },
    colorgame: {
      id: "colorgame",
          title: "Color Game",
          description: "Description of Color Game",
      type: "experimental",
      route: "experiments/colorgame"
    },
    shapegame: {
      id: "shapegame",
          title: "Shape Game",
          description: "Description of Shape Game",
      type: "experimental",
      route: "experiments/shapegame"
    },
    tsdst: {
      id: "tsdst",
          title: "TS & DST",
          description: "Description of TS & DST",
      type: "experimental",
      route: "experiments/tsdst"
    },
    simon: {
      id: "simon",
          title: "Simon Task",
          description: "Description of Simon Task",
      type: "experimental",
      route: "experiments/simontask"
    },
    smileyface: {
      id: "smileyface",
          title: "Smiley Face",
          description: "Description of Smiley Face Game",
      type: "experimental",
      route: "experiments/smileyface"
      }
  };