import type { ImageMemberName } from "../media/imageManifest";
import type { DirectorRect } from "./scenePresentation";

export interface IntroCreditCard {
  character: string;
  actor: string;
  startsAtFrame: number;
  portrait: {
    image: ImageMemberName;
    rect: DirectorRect;
  };
  title: {
    image: ImageMemberName;
    rect: DirectorRect;
  };
  actorTitle: {
    image: ImageMemberName;
    rect: DirectorRect;
  };
}

export const INTRO_SCORE = {
  frames: 535,
  millisecondsPerFrame: 50,
  titleFrames: 60,
  cardFrames: 75,
  title: [
    {
      image: "titel-saving",
      alt: "Saving",
      rect: { centerX: 254, centerY: 130, width: 282, height: 141 },
    },
    {
      image: "titel-ryan",
      alt: "Ryan",
      rect: { centerX: 563, centerY: 132, width: 224, height: 153 },
    },
  ],
  credits: [
    {
      character: "Barbara",
      actor: "Jane",
      startsAtFrame: 61,
      portrait: {
        image: "halv-Barbara",
        rect: { centerX: 724, centerY: 444, width: 152, height: 312 },
      },
      title: {
        image: "titel-jane1",
        rect: { centerX: 322, centerY: 245, width: 305, height: 49 },
      },
      actorTitle: {
        image: "titel-jane2",
        rect: { centerX: 191, centerY: 168, width: 215, height: 88 },
      },
    },
    {
      character: "David",
      actor: "Søren",
      startsAtFrame: 135,
      portrait: {
        image: "halv-David",
        rect: { centerX: 74, centerY: 474, width: 149, height: 252 },
      },
      title: {
        image: "titel-soren1",
        rect: { centerX: 469, centerY: 248, width: 391, height: 53 },
      },
      actorTitle: {
        image: "titel-soren2",
        rect: { centerX: 657, centerY: 166, width: 158, height: 86 },
      },
    },
    {
      character: "Marie",
      actor: "Bodil",
      startsAtFrame: 210,
      portrait: {
        image: "halv-Marie",
        rect: { centerX: 725, centerY: 456, width: 150, height: 287 },
      },
      title: {
        image: "titel-bodil1",
        rect: { centerX: 319, centerY: 245, width: 312, height: 60 },
      },
      actorTitle: {
        image: "titel-bodil2",
        rect: { centerX: 162, centerY: 164, width: 165, height: 82 },
      },
    },
    {
      character: "Jørgen",
      actor: "Peter",
      startsAtFrame: 285,
      portrait: {
        image: "halv-Peter",
        rect: { centerX: 74, centerY: 442, width: 149, height: 316 },
      },
      title: {
        image: "titel-peter1",
        rect: { centerX: 509, centerY: 246, width: 282, height: 52 },
      },
      actorTitle: {
        image: "titel-peter2",
        rect: { centerX: 619, centerY: 165, width: 222, height: 102 },
      },
    },
    {
      character: "Laura",
      actor: "Signe",
      startsAtFrame: 360,
      portrait: {
        image: "halv-Laura",
        rect: { centerX: 725, centerY: 489, width: 149, height: 222 },
      },
      title: {
        image: "titel-signe1",
        rect: { centerX: 333, centerY: 246, width: 344, height: 51 },
      },
      actorTitle: {
        image: "titel-signe2",
        rect: { centerX: 162, centerY: 159, width: 168, height: 93 },
      },
    },
    {
      character: "Ryan",
      actor: "Claus",
      startsAtFrame: 435,
      portrait: {
        image: "halv-Ryan",
        rect: { centerX: 74, centerY: 463, width: 149, height: 274 },
      },
      title: {
        image: "titel-claus1",
        rect: { centerX: 470, centerY: 238, width: 379, height: 84 },
      },
      actorTitle: {
        image: "titel-claus2",
        rect: { centerX: 655, centerY: 172, width: 145, height: 94 },
      },
    },
  ] as const satisfies readonly IntroCreditCard[],
} as const;

export const INTRO_DURATION_MILLISECONDS =
  INTRO_SCORE.frames * INTRO_SCORE.millisecondsPerFrame;
