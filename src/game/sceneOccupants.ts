import type {
  CharacterId,
  SceneId,
} from "../app/types";

/*
 * Occupants are added only where the Director score contains a dialogue-hotspot
 * sprite and/or a matching film loop. Ryan's post-murder stills are deliberately
 * not treated as talkable occupants.
 */
export const SCENE_OCCUPANTS = {
  A1: ["Laura"],
  A3: ["Laura"],
  A4: ["David"],
  B1: ["Barbara"],
  B2: ["Barbara", "Ryan"],
  B4: ["Laura", "Marie"],
  C1: ["Ryan"],
  C3: ["David"],
  C4: ["Barbara"],
  D1: ["David", "Marie"],
  D2: ["Marie"],
  D3: ["Barbara", "Marie"],
  E2: ["Laura", "David"],
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
