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
  frames: 581,
  millisecondsPerFrame: 50,
  titleFrames: 55,
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
        rect: { centerX: 687, centerY: 404, width: 227, height: 393 },
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
        rect: { centerX: 99, centerY: 430, width: 200, height: 341 },
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
        rect: { centerX: 687, centerY: 410, width: 227, height: 379 },
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
        rect: { centerX: 107, centerY: 393, width: 215, height: 415 },
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
        rect: { centerX: 684, centerY: 435, width: 231, height: 330 },
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
        rect: { centerX: 110, centerY: 419, width: 221, height: 362 },
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
  final: {
    image: "intro-slut",
    alt: "Saving Ryan-holdet med teksten Nogle gange er projektarbejdet en dræber",
    startsAtFrame: 523,
    fullyVisibleAtFrame: 574,
    rect: { centerX: 397, centerY: 298, width: 699, height: 603 },
  },
} as const;

export const INTRO_DURATION_MILLISECONDS =
  INTRO_SCORE.frames * INTRO_SCORE.millisecondsPerFrame;

/*
 * Recovered from the later Director movie's Tekst-Start cast member. The
 * preceding sentence in that member ("Intro, der hurtigt gennemløber den
 * første dag.") is a production direction, so it is retained in the audit
 * rather than shown to the player.
 */
export const START_PROLOGUE_PARAGRAPHS = [
  "De seks studerende er sneet inde på universitetet, hvilket dog ikke generer dem. De har meget arbejde, der skal gøres. Dagen får dog en uheldig drejning, da gruppens onde ånd, Ryan, bliver slået ihjel.",
  "Der er ikke andre end gruppens medlemmer til stede på universitetet, så gerningsmanden må findes internt i gruppen.",
  "Jørgen ville ønske, han kunne gøre noget for at forhindre mordet, og hans ønske går i opfyldelse. Han får mulighed for at gennemleve dagen igen og igen, indtil han har opklaret mordet.",
  "Han er den eneste af gruppemedlemmerne, der har sin hukommelse i behold, når dagen gentager sig, og den viden kan han måske bruge til at finde den skyldige…",
] as const;
