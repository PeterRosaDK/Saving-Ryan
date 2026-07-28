import { describe, expect, it } from "vitest";
import {
  VideoPlayer,
  type VideoPlaybackState,
} from "../src/media/VideoPlayer";
import { getVideoStatusLabel } from "../src/ui/NarrativeHost";

class FakeVideoElement extends EventTarget {
  src = "";
  error: MediaError | null = null;
  pauseCalls = 0;
  loadCalls = 0;
  playCalls = 0;
  playError: unknown = null;

  load(): void {
    this.loadCalls += 1;
  }

  async play(): Promise<void> {
    this.playCalls += 1;
    if (this.playError) {
      throw this.playError;
    }
  }

  pause(): void {
    this.pauseCalls += 1;
  }

  removeAttribute(name: string): void {
    if (name === "src") {
      this.src = "";
    }
  }
}

function createPlayer(): {
  element: FakeVideoElement;
  player: VideoPlayer;
  states: VideoPlaybackState[];
} {
  const element = new FakeVideoElement();
  const player = new VideoPlayer(element as unknown as HTMLVideoElement);
  const states: VideoPlaybackState[] = [];
  player.subscribe((state) => states.push(state));
  return { element, player, states };
}

async function flushPromises(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("VideoPlayer", () => {
  it("keeps routine playback visually quiet while retaining useful errors", () => {
    expect(getVideoStatusLabel("playing")).toBe("");
    expect(getVideoStatusLabel("missing-media")).toBe(
      "Videofilen mangler.",
    );
  });

  it("loads, plays, and resolves an ended clip", async () => {
    const { element, player, states } = createPlayer();

    const playback = player.play("LauraSuspekt");
    expect(player.getState()).toEqual({
      status: "loading",
      clipId: "LauraSuspekt",
    });
    expect(element.src).toBe("/Video/LauraSuspekt.mp4");

    element.dispatchEvent(new Event("loadedmetadata"));
    await flushPromises();
    expect(player.getState().status).toBe("playing");

    element.dispatchEvent(new Event("ended"));
    await expect(playback).resolves.toEqual({
      status: "ended",
      clipId: "LauraSuspekt",
    });
    expect(states.map(({ status }) => status)).toEqual([
      "idle",
      "loading",
      "playing",
      "ended",
    ]);
  });

  it("keeps skipped distinct from ended", async () => {
    const { element, player } = createPlayer();
    const playback = player.play("Peter-omRyan");

    expect(player.skip()).toBe(true);
    await expect(playback).resolves.toEqual({
      status: "skipped",
      clipId: "Peter-omRyan",
    });
    expect(element.pauseCalls).toBe(1);
    expect(player.skip()).toBe(false);
  });

  it("skips an actively playing video when its image is clicked", async () => {
    const { element, player } = createPlayer();
    const playback = player.play("Peter-omRyan");

    element.dispatchEvent(new Event("click"));
    expect(player.getState().status).toBe("loading");

    element.dispatchEvent(new Event("loadedmetadata"));
    await flushPromises();
    expect(player.getState().status).toBe("playing");

    element.dispatchEvent(new Event("click"));
    await expect(playback).resolves.toEqual({
      status: "skipped",
      clipId: "Peter-omRyan",
    });
    expect(element.pauseCalls).toBe(1);
  });

  it("reports autoplay blocking from play()", async () => {
    const { element, player } = createPlayer();
    element.playError = new DOMException(
      "Playback needs a user gesture",
      "NotAllowedError",
    );
    const playback = player.play("LauraSuspekt");

    element.dispatchEvent(new Event("loadedmetadata"));

    await expect(playback).resolves.toEqual({
      status: "autoplay-blocked",
      clipId: "LauraSuspekt",
    });
  });

  it.each([
    [2, "network-error"],
    [3, "decode-error"],
    [4, "missing-media"],
  ] as const)("maps media error %s to %s", async (code, expected) => {
    const { element, player } = createPlayer();
    const playback = player.play("LauraSuspekt");
    element.error = { code } as MediaError;

    element.dispatchEvent(new Event("error"));

    await expect(playback).resolves.toEqual({
      status: expected,
      clipId: "LauraSuspekt",
    });
  });

  it("aborts the old session and ignores its stale callbacks", async () => {
    const { element, player } = createPlayer();
    const first = player.play("Peter-omRyan");
    const second = player.play("LauraSuspekt");

    await expect(first).resolves.toEqual({
      status: "aborted",
      clipId: "Peter-omRyan",
    });

    element.dispatchEvent(new Event("loadedmetadata"));
    await flushPromises();
    element.dispatchEvent(new Event("ended"));

    await expect(second).resolves.toEqual({
      status: "ended",
      clipId: "LauraSuspekt",
    });
    expect(player.getState().clipId).toBe("LauraSuspekt");
  });
});
