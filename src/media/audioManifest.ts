import { getPublicUrl } from "./publicUrl";

export function getIntroAudioUrl(baseUrl?: string): string {
  return getPublicUrl("assets/audio/intro.wav", baseUrl);
}
