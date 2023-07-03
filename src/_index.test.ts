import * as vt from "vitest";
import { test } from "@fast-check/vitest";

import * as T from "./_index";

vt.describe("forward", () => {
  test.each([
    {
      fps: [-2, -2, -2, -1, -2, -2, -2],
      bps: [2, 2, 2, 2, 2, 2, 2],
      p: 0,
      xs: [1, 2],
      ix1: 0,
      ix2: 2,
      ys: [1, 2],
      iy1: 0,
      iy2: 2,
      isEqual: T._isEqual,
      expected: {
        below: [-2, -2, -2, -1, -2, -2, -2],
        above: [-2, -2, -2, -1, -2, -2, -2],
        at: [-2, -2, -2, 1, -2, -2, -2],
      },
    },
    {
      fps: [-2, -2, -2, -1, -2, -2, -2, -2],
      bps: [3, 3, 3, 3, 3, 3, 3, 3],
      p: 0,
      xs: [1, 2],
      ix1: 0,
      ix2: 2,
      ys: [1, 2, 3],
      iy1: 0,
      iy2: 3,
      isEqual: T._isEqual,
      expected: {
        below: [-2, -2, -2, 1, -2, -2, -2, -2],
        above: [-2, -2, -2, 1, -2, -2, -2, -2],
        at: [-2, -2, -2, 1, 2, -2, -2, -2],
      },
    },
    {
      fps: [-2, -2, -2, -1, -2, -2, -2, -2],
      bps: [3, 3, 3, 3, 3, 3, 3, 3],
      p: 0,
      xs: [1, 2],
      ix1: 0,
      ix2: 2,
      ys: [1, 3, 2],
      iy1: 0,
      iy2: 3,
      isEqual: T._isEqual,
      expected: {
        below: [-2, -2, -2, 0, -2, -2, -2, -2],
        above: [-2, -2, -2, 0, -2, -2, -2, -2],
        at: [-2, -2, -2, 0, 2, -2, -2, -2],
      },
    },
  ])(
    "forward: %j",
    ({ fps, bps, p, xs, ix1, ix2, ys, iy1, iy2, isEqual, expected }) => {
      T.forwardBelowDelta(fps, bps, p, xs, ix1, ix2, ys, iy1, iy2, isEqual);
      vt.expect(fps).toStrictEqual(expected.below);
      T.forwardAboveDelta(fps, bps, p, xs, ix1, ix2, ys, iy1, iy2, isEqual);
      vt.expect(fps).toStrictEqual(expected.above);
      T.forwardAtDelta(fps, bps, xs, ix1, ix2, ys, iy1, iy2, isEqual);
      vt.expect(fps).toStrictEqual(expected.at);
    },
  );
});

vt.describe("backwardAtDelta", () => {
  test.each([
    {
      fps: [-2, -2, -2, -2, -2, -2, -2],
      bps: [-1, 0, 1, 2, 2, 2, 2],
      xs: [1, 2],
      ix1: 0,
      ix2: 2,
      ys: [1, 2],
      iy1: 0,
      iy2: 2,
      isEqual: T._isEqual,
      expected: {
        at: [-1, 0, 1, -1, 2, 2, 2],
      },
    },
  ])(
    "backward: %j",
    ({ fps, bps, xs, ix1, ix2, ys, iy1, iy2, isEqual, expected }) => {
      T.backwardAtDelta(fps, bps, xs, ix1, ix2, ys, iy1, iy2, isEqual);
      vt.expect(bps).toStrictEqual(expected.at);
    },
  );
});
