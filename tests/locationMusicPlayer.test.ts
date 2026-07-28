import { describe, expect, it } from "vitest";
import { LocationMusicPlayer } from "../src/media/LocationMusicPlayer";

class FakeAudioElement {
  src = "";
  loop = false;
  preload = "";
  muted = false;
  volume = 1;
  pauseCalls = 0;
  loadCalls = 0;
  playCalls = 0;
  playError: unknown = null;
  paused = true;

  load(): void {
    this.loadCalls += 1;
  }

  async play(): Promise<void> {
    this.playCalls += 1;
    if (this.playError) {
      throw this.playError;
    }
    this.paused = false;
  }

  pause(): void {
    this.pauseCalls += 1;
    this.paused = true;
  }

  removeAttribute(name: string): void {
    if (name === "src") {
      this.src = "";
    }
  }
}

async function flushPromises(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("LocationMusicPlayer", () => {
  it("changes track with location and does not restart the same track", async () => {
    const element = new FakeAudioElement();
    const player = new LocationMusicPlayer(
      element as unknown as HTMLAudioElement,
    );

    expect(element.loop).toBe(true);
    expect(element.volume).toBe(0.42);

    player.setLocation("A");
    await flushPromises();
    expect(element.src).toBe("/assets/audio/music/28.wav");
    expect(player.getState()).toMatchObject({
      status: "playing",
      location: "A",
      trackId: "28",
    });

    player.setLocation("A");
    expect(element.playCalls).toBe(1);

    player.setLocation("B");
    await flushPromises();
    expect(element.src).toBe("/assets/audio/music/29.wav");
    expect(element.pauseCalls).toBe(2);
    expect(element.playCalls).toBe(2);
  });

  it("mutes on request and ducks while narrative media is active", () => {
    const element = new FakeAudioElement();
    const player = new LocationMusicPlayer(
      element as unknown as HTMLAudioElement,
    );

    player.toggleMuted();
    expect(player.getState().muted).toBe(true);
    expect(element.muted).toBe(true);

    player.setDucked(true);
    expect(player.getState().ducked).toBe(true);
    expect(element.volume).toBe(0.08);

    player.setDucked(false);
    expect(element.volume).toBe(0.42);
  });

  it("resumes a browser-paused track after narrative media ends", async () => {
    const element = new FakeAudioElement();
    const player = new LocationMusicPlayer(
      element as unknown as HTMLAudioElement,
    );

    player.setLocation("A");
    await flushPromises();
    player.setDucked(true);
    element.pause();
    player.setDucked(false);
    await flushPromises();

    expect(element.playCalls).toBe(2);
    expect(element.paused).toBe(false);
    expect(player.getState()).toMatchObject({
      status: "playing",
      ducked: false,
      location: "A",
    });
  });

  it("reports autoplay blocking and retries from the music button", async () => {
    const element = new FakeAudioElement();
    element.playError = new DOMException(
      "Playback needs a user gesture",
      "NotAllowedError",
    );
    const player = new LocationMusicPlayer(
      element as unknown as HTMLAudioElement,
    );

    player.setLocation("C");
    await flushPromises();
    expect(player.getState().status).toBe("blocked");

    element.playError = null;
    player.toggleMuted();
    await flushPromises();
    expect(player.getState()).toMatchObject({
      status: "playing",
      muted: false,
      location: "C",
      trackId: "31",
    });
    expect(element.playCalls).toBe(2);
  });

  it("releases the audio source on teardown", async () => {
    const element = new FakeAudioElement();
    const player = new LocationMusicPlayer(
      element as unknown as HTMLAudioElement,
    );

    player.setLocation("D");
    await flushPromises();
    player.destroy();

    expect(element.src).toBe("");
    expect(player.getState()).toMatchObject({
      status: "idle",
      location: null,
      trackId: null,
    });
  });
});
