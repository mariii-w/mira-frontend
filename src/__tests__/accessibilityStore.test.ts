import { afterEach, describe, expect, it } from "vitest";
import { useAccessibilityStore } from "../stores/accessibility";

afterEach(() => {
  useAccessibilityStore.setState({ easyRead: false, reducedMotion: false });
});

describe("accessibility store", () => {
  it("defaults both preferences to off", () => {
    const state = useAccessibilityStore.getState();

    expect(state.easyRead).toBe(false);
    expect(state.reducedMotion).toBe(false);
  });

  it("updates easyRead independently of reducedMotion", () => {
    useAccessibilityStore.getState().setEasyRead(true);

    expect(useAccessibilityStore.getState()).toMatchObject({
      easyRead: true,
      reducedMotion: false,
    });
  });

  it("updates reducedMotion independently of easyRead", () => {
    useAccessibilityStore.getState().setReducedMotion(true);

    expect(useAccessibilityStore.getState()).toMatchObject({
      easyRead: false,
      reducedMotion: true,
    });
  });

  it("mirrors both preferences onto document.documentElement's dataset", () => {
    useAccessibilityStore.getState().setEasyRead(true);
    useAccessibilityStore.getState().setReducedMotion(true);

    expect(document.documentElement.dataset.easyRead).toBe("true");
    expect(document.documentElement.dataset.reducedMotion).toBe("true");
  });
});
