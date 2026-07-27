import type {
  CharacterId,
  SceneId,
} from "../app/types";

/*
 * Start with occupants confirmed both by transition behavior and the named
 * Director film-loop frames. More scenes can be added as score placement is
 * verified; dialogue availability must not be guessed from a background alone.
 */
export const SCENE_OCCUPANTS = {
  B1: ["Barbara"],
  D1: ["David", "Marie"],
} as const satisfies Partial<Record<SceneId, readonly CharacterId[]>>;

export function getSceneOccupants(
  sceneId: SceneId,
): readonly CharacterId[] {
  return SCENE_OCCUPANTS[sceneId as keyof typeof SCENE_OCCUPANTS] ?? [];
}

export function isCharacterInScene(
  sceneId: SceneId,
  person: CharacterId,
): boolean {
  return getSceneOccupants(sceneId).includes(person);
}
