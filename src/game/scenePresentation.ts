import type {
  CharacterId,
  LocationId,
  SceneId,
  SceneInteractionId,
  TimeSlot,
} from "../app/types";
import type { DirectorFilmLoopName } from "../media/imageManifest";

export interface DirectorRect {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

export interface DirectorHotspotRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FilmLoopTimelineEntry {
  tick: number;
  frameIndex: number;
}

export interface FilmLoopPresentation {
  name: DirectorFilmLoopName;
  rect: DirectorRect;
  ticks: number;
  timeline: readonly FilmLoopTimelineEntry[];
}

export interface NavigationHotspot {
  target: LocationId;
  rect: DirectorHotspotRect;
}

export interface CharacterHotspot {
  person: CharacterId;
  rect: DirectorHotspotRect;
}

export interface InteractionHotspot {
  interactionId: SceneInteractionId;
  rect: DirectorHotspotRect;
}

export interface ScenePresentation {
  navigation: readonly NavigationHotspot[];
  characters: readonly CharacterHotspot[];
  interactions: readonly InteractionHotspot[];
  clock: DirectorRect;
  filmLoop?: FilmLoopPresentation;
}

const rect = (
  centerX: number,
  centerY: number,
  width: number,
  height: number,
): DirectorRect => ({ centerX, centerY, width, height });

const hotspotRect = (
  x: number,
  y: number,
  width: number,
  height: number,
): DirectorHotspotRect => ({ x, y, width, height });

const EXIT_TO_HALLWAY: Readonly<
  Record<Exclude<LocationId, "E">, DirectorHotspotRect>
> = {
  A: hotspotRect(81, 61, 226, 91),
  B: hotspotRect(606, 364, 114, 174),
  C: hotspotRect(561, 404, 157, 135),
  D: hotspotRect(548, 331, 172, 209),
};

const HALLWAY_DOORS: readonly NavigationHotspot[] = [
  { target: "A", rect: hotspotRect(333, 219, 148, 131) },
  { target: "B", rect: hotspotRect(106, 152, 85, 323) },
  { target: "C", rect: hotspotRect(602, 96, 96, 445) },
  { target: "D", rect: hotspotRect(253, 193, 35, 196) },
];

const CLOCK_RECTS: Readonly<Record<TimeSlot, DirectorRect>> = {
  1: rect(760, 90, 68, 65),
  2: rect(760, 90, 66, 65),
  3: rect(760, 90, 66, 67),
  4: rect(760, 90, 66, 66),
};

const navigationFor = (location: LocationId): readonly NavigationHotspot[] =>
  location === "E"
    ? HALLWAY_DOORS
    : [{ target: "E", rect: EXIT_TO_HALLWAY[location] }];

const timeline = (
  name: DirectorFilmLoopName,
  loopRect: DirectorRect,
  entries: readonly (readonly [number, number])[],
): FilmLoopPresentation => ({
  name,
  rect: loopRect,
  ticks: 87,
  timeline: entries.map(([tick, frameIndex]) => ({ tick, frameIndex })),
});

/*
 * Coordinates and film-loop tick changes come from the supplied Director
 * score. Bitmap and film-loop sprites are centre-registered, while the
 * invisible shape members used as hotspots are top-left-registered.
 */
const FILM_LOOPS = {
  A1: timeline("LoopA1", rect(433, 268, 136, 180), [
    [0, 0], [67, 2], [72, 1], [82, 2],
  ]),
  A3: timeline("LoopA3", rect(561, 326, 153, 174), [
    [0, 2], [47, 0], [54, 1], [83, 0],
  ]),
  A4: timeline("LoopA4", rect(405, 276, 161, 214), [
    [0, 1], [10, 2], [26, 1], [40, 0], [64, 2], [77, 1], [82, 2],
  ]),
  B1: timeline("LoopB1", rect(448, 364, 214, 352), [
    [0, 0], [10, 1], [14, 0], [57, 1], [61, 2],
  ]),
  B2: timeline("LoopB2", rect(274, 169, 164, 139), [
    [0, 1], [50, 2], [55, 0], [79, 2],
  ]),
  B4: timeline("LoopB4", rect(552, 289, 221, 239), [
    [0, 1], [14, 2], [28, 1], [42, 2], [63, 0],
  ]),
  C1: timeline("LoopC1", rect(385, 319, 201, 202), [
    [0, 0], [12, 1], [32, 0], [61, 1], [72, 2],
  ]),
  C3: timeline("LoopC3", rect(388, 340, 207, 186), [
    [0, 1], [19, 2], [29, 1], [39, 2], [48, 1], [58, 2], [71, 0],
  ]),
  C4: timeline("LoopC4", rect(394, 335, 214, 209), [
    [0, 0], [18, 1], [37, 0], [55, 1], [69, 0], [82, 1],
  ]),
  D1: timeline("LoopD1", rect(437, 255, 282, 147), [
    [0, 0], [64, 2], [70, 1], [82, 2],
  ]),
  D2: timeline("LoopD2", rect(497, 234, 149, 137), [
    [0, 2], [5, 0], [17, 2], [22, 1],
  ]),
  E2: timeline("LoopE2", rect(506, 353, 142, 308), [
    [0, 0], [11, 1], [28, 0], [47, 1], [67, 2], [75, 0], [78, 2],
  ]),
} as const satisfies Partial<Record<SceneId, FilmLoopPresentation>>;

const CHARACTERS = {
  A1: [{ person: "Laura", rect: hotspotRect(382, 186, 89, 157) }],
  A3: [{ person: "Laura", rect: hotspotRect(506, 240, 122, 169) }],
  A4: [{ person: "David", rect: hotspotRect(333, 176, 150, 204) }],
  B1: [{ person: "Barbara", rect: hotspotRect(356, 194, 183, 335) }],
  B2: [
    { person: "Ryan", rect: hotspotRect(216, 110, 75, 101) },
    { person: "Barbara", rect: hotspotRect(306, 133, 47, 102) },
  ],
  B4: [
    { person: "Laura", rect: hotspotRect(467, 190, 95, 206) },
    { person: "Marie", rect: hotspotRect(564, 174, 88, 166) },
  ],
  C1: [{ person: "Ryan", rect: hotspotRect(301, 215, 177, 199) }],
  C3: [{ person: "David", rect: hotspotRect(291, 256, 161, 162) }],
  C4: [{ person: "Barbara", rect: hotspotRect(307, 242, 168, 184) }],
  D1: [
    { person: "Marie", rect: hotspotRect(455, 189, 112, 104) },
    { person: "David", rect: hotspotRect(315, 190, 104, 105) },
  ],
  D2: [{ person: "Marie", rect: hotspotRect(438, 168, 118, 119) }],
  D3: [
    { person: "Marie", rect: hotspotRect(446, 194, 118, 98) },
    { person: "Barbara", rect: hotspotRect(318, 180, 109, 132) },
  ],
  E2: [
    { person: "Laura", rect: hotspotRect(445, 227, 57, 231) },
    { person: "David", rect: hotspotRect(504, 211, 67, 261) },
  ],
} as const satisfies Partial<Record<SceneId, readonly CharacterHotspot[]>>;

const INTERACTIONS = {
  A3: [{
    interactionId: "inspect_ryans_body_and_necklace",
    rect: hotspotRect(158, 383, 413, 119),
  }],
  B2: [
    {
      interactionId: "inspect_barbaras_computer",
      rect: hotspotRect(283, 244, 94, 104),
    },
    {
      interactionId: "eavesdrop_barbara_and_ryan",
      rect: hotspotRect(445, 235, 146, 118),
    },
  ],
  B3: [{
    interactionId: "inspect_barbaras_computer",
    rect: hotspotRect(283, 244, 94, 104),
  }],
  C1: [{
    interactionId: "inspect_secret_passage_book",
    rect: hotspotRect(117, 294, 14, 46),
  }],
  C2: [{
    interactionId: "inspect_secret_passage_book",
    rect: hotspotRect(117, 294, 14, 46),
  }],
  C3: [{
    interactionId: "inspect_secret_passage_book",
    rect: hotspotRect(117, 294, 14, 46),
  }],
  C4: [{
    interactionId: "inspect_secret_passage_book",
    rect: hotspotRect(117, 294, 14, 46),
  }],
  D4: [{
    interactionId: "inspect_girlfriend_letter",
    rect: hotspotRect(148, 384, 62, 24),
  }],
} as const satisfies Partial<Record<SceneId, readonly InteractionHotspot[]>>;

export const DIRECTOR_STAGE = {
  width: 800,
  height: 600,
  background: rect(400, 300, 640, 480),
  tickMilliseconds: 40,
} as const;

export function getScenePresentation(sceneId: SceneId): ScenePresentation {
  const location = sceneId[0] as LocationId;
  const timeSlot = Number(sceneId[1]) as TimeSlot;

  return {
    navigation: navigationFor(location),
    characters: CHARACTERS[sceneId as keyof typeof CHARACTERS] ?? [],
    interactions: INTERACTIONS[sceneId as keyof typeof INTERACTIONS] ?? [],
    clock: CLOCK_RECTS[timeSlot],
    filmLoop: FILM_LOOPS[sceneId as keyof typeof FILM_LOOPS],
  };
}

export function directorRectStyle(rectangle: DirectorRect): string {
  const left = rectangle.centerX - rectangle.width / 2;
  const top = rectangle.centerY - rectangle.height / 2;

  return [
    `left:${(left / DIRECTOR_STAGE.width) * 100}%`,
    `top:${(top / DIRECTOR_STAGE.height) * 100}%`,
    `width:${(rectangle.width / DIRECTOR_STAGE.width) * 100}%`,
    `height:${(rectangle.height / DIRECTOR_STAGE.height) * 100}%`,
  ].join(";");
}

export function directorHotspotRectStyle(
  rectangle: DirectorHotspotRect,
): string {
  return [
    `left:${(rectangle.x / DIRECTOR_STAGE.width) * 100}%`,
    `top:${(rectangle.y / DIRECTOR_STAGE.height) * 100}%`,
    `width:${(rectangle.width / DIRECTOR_STAGE.width) * 100}%`,
    `height:${(rectangle.height / DIRECTOR_STAGE.height) * 100}%`,
  ].join(";");
}
