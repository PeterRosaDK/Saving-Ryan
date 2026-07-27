import type { LocationId, SceneId, TimeSlot } from "../app/types";

export interface LocationDefinition {
  id: LocationId;
  name: string;
  shortName: string;
}

export interface TimeDefinition {
  id: TimeSlot;
  name: string;
}

export interface SceneDefinition {
  id: SceneId;
  location: LocationDefinition;
  time: TimeDefinition;
}

export const LOCATIONS: readonly LocationDefinition[] = [
  { id: "A", name: "Kantinen", shortName: "Kantine" },
  { id: "B", name: "Computerrummet", shortName: "Computer" },
  { id: "C", name: "Læsesalen", shortName: "Læsning" },
  { id: "D", name: "Grupperummet", shortName: "Gruppe" },
  { id: "E", name: "Gangarealet", shortName: "Gang" },
];

export const TIMES: readonly TimeDefinition[] = [
  { id: 1, name: "Morgen" },
  { id: 2, name: "Middag" },
  { id: 3, name: "Eftermiddag" },
  { id: 4, name: "Aften" },
];

export function toSceneId(location: LocationId, time: TimeSlot): SceneId {
  return `${location}${time}`;
}

export const SCENES: readonly SceneDefinition[] = LOCATIONS.flatMap((location) =>
  TIMES.map((time) => ({
    id: toSceneId(location.id, time.id),
    location,
    time,
  })),
);

export function getScene(sceneId: SceneId): SceneDefinition {
  const scene = SCENES.find(({ id }) => id === sceneId);

  if (!scene) {
    throw new Error(`Unknown scene: ${sceneId}`);
  }

  return scene;
}
