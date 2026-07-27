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

const NEXT_TIME_SLOT: Readonly<Record<TimeSlot, TimeSlot>> = {
  1: 2,
  2: 3,
  3: 4,
  4: 1,
};

export function toSceneId(location: LocationId, time: TimeSlot): SceneId {
  return `${location}${time}`;
}

export function getNextTimeSlot(time: TimeSlot): TimeSlot {
  return NEXT_TIME_SLOT[time];
}

export function getWaitActionLabel(
  location: LocationId,
  time: TimeSlot,
): string {
  const scene = getScene(toSceneId(location, time));
  const destination =
    time === 4
      ? "næste morgen"
      : getScene(
          toSceneId(location, getNextTimeSlot(time)),
        ).time.name.toLowerCase();

  return `Vent i ${scene.location.name.toLowerCase()} til ${destination}`;
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
