import { ExperimentRoutingMap } from '../models/InternalDTOs';

export const RouteMap: ExperimentRoutingMap = {
    gonogo: {
      id: "gonogo",
      title: "Go-NoGo",
      description: "Description of Go-NoGo Task",
      type: "NAB",
      route: "task/gonogo"
    },
    digitspan: {
      id: "digitspan",
      title: "Digit Span",
      description: "Description of Digit Span Task",
      type: "NAB",
      route: "task/digitspan"
    },
    fingertapping: {
      id: "fingertapping",
      title: "Finger Tapping Task",
      description: "Description of Finger Tapping Task",
      type: "NAB",
      route: "task/fingertapping"
    },
    nback: {
      id: "nback",
      title: "N-Back",
      description: "Description of N-Back Task",
      type: "NAB",
      route: "task/nback"
    },
    stroop: {
      id: "stroop",
      title: "Stroop Task",
      description: "Description of the Stroop Task",
      type: "NAB",
      route: "task/stroop"
    },
    trailmaking: {
      id: "trailmaking",
      title: "Trail Making",
      description: "Description of Trail Making Task",
      type: "NAB",
      route: "task/trailmaking"
    },
    colorgame: {
      id: "colorgame",
      title: "Color Game",
      description: "Description of Color Game",
      type: "experimental",
      route: "task/colorgame"
    },
    shapegame: {
      id: "shapegame",
      title: "Shape Game",
      description: "Description of Shape Game",
      type: "experimental",
      route: "task/shapegame"
    },
    taskswitching: {
      id: "taskswitching",
      title: "Task Switching",
      description: "Description of TS",
      type: "experimental",
      route: "task/taskswitching"
    },
    demandselection: {
      id: "demandselection",
      title: "Demand Selection",
      description: "Description of demand selection",
      type: "experimental",
      route: "task/demandselection"
    },
    simon: {
      id: "simon",
          title: "Simon Task",
          description: "Description of Simon Task",
      type: "experimental",
      route: "task/simontask"
    },
    smileyface: {
      id: "smileyface",
          title: "Smiley Face",
          description: "Description of Smiley Face Game",
      type: "experimental",
      route: "task/smileyface"
    },
  };