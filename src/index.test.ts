import * as vt from "vitest";
import { fc, test } from "@fast-check/vitest";

import * as T from "./index";

vt.describe("diffWu", () => {
  test.each([
    [
      [1, 1, 1],
      [2, 2, 1, 2],
      [
        T.INSERT_OP,
        T.INSERT_OP,
        T.DELETE_OP,
        T.KEEP_OP,
        T.DELETE_OP,
        T.INSERT_OP,
        T.SENTINEL_OP,
      ],
    ],
    [
      [1, 1, 1],
      [2, 2, 2, 1],
      [
        T.INSERT_OP,
        T.INSERT_OP,
        T.DELETE_OP,
        T.DELETE_OP,
        T.INSERT_OP,
        T.KEEP_OP,
        T.SENTINEL_OP,
      ],
    ],
    [
      [2, 2, 1],
      [1, 1, 1, 1],
      [
        T.INSERT_OP,
        T.INSERT_OP,
        T.DELETE_OP,
        T.DELETE_OP,
        T.KEEP_OP,
        T.INSERT_OP,
        T.SENTINEL_OP,
      ],
    ],
    [
      [2, 1, 2],
      [1, 1, 1],
      [
        T.DELETE_OP,
        T.INSERT_OP,
        T.KEEP_OP,
        T.DELETE_OP,
        T.INSERT_OP,
        T.SENTINEL_OP,
      ],
    ],
    [
      [1, 1, 1],
      [2, 1, 2],
      [
        T.DELETE_OP,
        T.INSERT_OP,
        T.KEEP_OP,
        T.DELETE_OP,
        T.INSERT_OP,
        T.SENTINEL_OP,
      ],
    ],
    [
      [1, 1],
      [1, 1, 1],
      [T.KEEP_OP, T.KEEP_OP, T.INSERT_OP, T.SENTINEL_OP, T.SENTINEL_OP],
    ],
    [
      [1, 2, 1, 1],
      [1, 1, 1, 1],
      [
        T.KEEP_OP,
        T.DELETE_OP,
        T.KEEP_OP,
        T.KEEP_OP,
        T.INSERT_OP,
        T.SENTINEL_OP,
        T.SENTINEL_OP,
        T.SENTINEL_OP,
      ],
    ],
    [
      [2, 1],
      [1, 1, 1],
      [T.DELETE_OP, T.KEEP_OP, T.INSERT_OP, T.INSERT_OP, T.SENTINEL_OP],
    ],
    [[2], [1, 1], [T.INSERT_OP, T.INSERT_OP, T.DELETE_OP]],
    [
      [1, 2, 1, 1],
      [1, 1, 1, 1],
      [
        T.KEEP_OP,
        T.DELETE_OP,
        T.KEEP_OP,
        T.KEEP_OP,
        T.INSERT_OP,
        T.SENTINEL_OP,
        T.SENTINEL_OP,
        T.SENTINEL_OP,
      ],
    ],
    [
      [1, 1, 1, 1],
      [1, 2, 1, 1],
      [
        T.KEEP_OP,
        T.DELETE_OP,
        T.INSERT_OP,
        T.KEEP_OP,
        T.KEEP_OP,
        T.SENTINEL_OP,
        T.SENTINEL_OP,
        T.SENTINEL_OP,
      ],
    ],
    [
      [2, 2, 1],
      [1, 2, 2],
      [
        T.INSERT_OP,
        T.KEEP_OP,
        T.KEEP_OP,
        T.DELETE_OP,
        T.SENTINEL_OP,
        T.SENTINEL_OP,
      ],
    ],
    [
      [1, 1],
      [2, 2],
      [T.DELETE_OP, T.INSERT_OP, T.DELETE_OP, T.INSERT_OP],
    ],
    [
      [2, 1],
      [1, 1, 1],
      [T.DELETE_OP, T.KEEP_OP, T.INSERT_OP, T.INSERT_OP, T.SENTINEL_OP],
    ],
    [
      [1, 1, 1],
      [2, 1],
      [T.INSERT_OP, T.KEEP_OP, T.DELETE_OP, T.DELETE_OP, T.SENTINEL_OP],
    ],
    [
      [1, 2, 1],
      [2, 1, 2],
      [
        T.DELETE_OP,
        T.KEEP_OP,
        T.KEEP_OP,
        T.INSERT_OP,
        T.SENTINEL_OP,
        T.SENTINEL_OP,
      ],
    ],
    [
      [1, 1],
      [1, 1, 1, 1],
      [
        T.KEEP_OP,
        T.KEEP_OP,
        T.INSERT_OP,
        T.INSERT_OP,
        T.SENTINEL_OP,
        T.SENTINEL_OP,
      ],
    ],
    [[], [], []],
    [[1], [], [T.DELETE_OP]],
    [[], [1], [T.INSERT_OP]],
    [[1], [1], [T.KEEP_OP, T.SENTINEL_OP]],
    [[1], [2], [T.DELETE_OP, T.INSERT_OP]],
    [[], [1, 2], [T.INSERT_OP, T.INSERT_OP]],
    [[1, 2], [], [T.DELETE_OP, T.DELETE_OP]],
    [[1, 2], [1], [T.KEEP_OP, T.DELETE_OP, T.SENTINEL_OP]],
    [[1], [1, 2], [T.KEEP_OP, T.INSERT_OP, T.SENTINEL_OP]],
    [[1, 2], [2], [T.DELETE_OP, T.KEEP_OP, T.SENTINEL_OP]],
    [[2], [1, 2], [T.INSERT_OP, T.KEEP_OP, T.SENTINEL_OP]],
    [
      [1, 2],
      [1, 2],
      [T.KEEP_OP, T.KEEP_OP, T.SENTINEL_OP, T.SENTINEL_OP],
    ],
    [
      [1, 2, 3],
      [1, 2, 3],
      [
        T.KEEP_OP,
        T.KEEP_OP,
        T.KEEP_OP,
        T.SENTINEL_OP,
        T.SENTINEL_OP,
        T.SENTINEL_OP,
      ],
    ],
    [
      [1, 2],
      [1, 2, 3],
      [T.KEEP_OP, T.KEEP_OP, T.INSERT_OP, T.SENTINEL_OP, T.SENTINEL_OP],
    ],
    [
      [1, 2, 3],
      [1, 2],
      [T.KEEP_OP, T.KEEP_OP, T.DELETE_OP, T.SENTINEL_OP, T.SENTINEL_OP],
    ],
    [
      [1, 2],
      [1, 2, 3],
      [T.KEEP_OP, T.KEEP_OP, T.INSERT_OP, T.SENTINEL_OP, T.SENTINEL_OP],
    ],
  ])("diffWu(%j, %j) -> %j", (xs, ys, expected) => {
    const actual = T.diffWu(xs, ys);
    vt.expect(actual).toStrictEqual(expected);
  });
  for (const vocabSize of [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 40, 80, 160, 320, 640, 1280,
  ] as const) {
    for (const arraySize of ["small", "=", "+1"] as const) {
      for (const { desc, prop } of [
        {
          desc: `vocabSize=${vocabSize}, arraySize=${arraySize}`,
          prop: fc.tuple(
            fc.array(fc.integer({ min: 1, max: vocabSize }), {
              size: arraySize,
            }),
            fc.array(fc.integer({ min: 1, max: vocabSize }), {
              size: arraySize,
            }),
          ),
        },
      ] as const) {
        test.prop([prop])(desc, ([src, dst]) => {
          const ops = T.diffWu(src, dst);
          checkOps(ops, src, dst);
        });
      }
    }
  }
});

const checkOps = <T>(
  ops: T.TOp[],
  xs: T[],
  ys: T[],
  expect: typeof vt.expect = vt.expect,
) => {
  expect(editDistanceOfOps(ops)).toStrictEqual(editDistance(xs, ys));
  let ix = -1;
  let iy = -1;
  for (const op of ops) {
    switch (op) {
      case T.KEEP_OP:
        ++ix;
        ++iy;
        expect(xs[ix]).toStrictEqual(ys[iy]);
        break;
      case T.DELETE_OP:
        ++ix;
        break;
      case T.INSERT_OP:
        ++iy;
        break;
      case T.SENTINEL_OP:
        return;
    }
  }
};

const editDistance = <T>(xs: T[], ys: T[]) => {
  const m = xs.length;
  const n = ys.length;
  let dpPrev = new Array(n + 1);
  let dpCurr = new Array(n + 1);
  for (let j = 0; j <= n; j++) {
    dpPrev[j] = j;
  }
  for (let i = 1; i <= m; i++) {
    dpCurr[0] = i;
    for (let j = 1; j <= n; j++) {
      dpCurr[j] =
        xs[i - 1] === ys[j - 1]
          ? dpPrev[j - 1]
          : Math.min(dpPrev[j] + 1, dpCurr[j - 1] + 1);
    }
    [dpPrev, dpCurr] = [dpCurr, dpPrev];
  }
  return dpPrev[n];
};

const editDistanceOfOps = (ops: T.TOp[]) => {
  let nEdits = 0;
  for (const op of ops) {
    if (op === T.DELETE_OP || op === T.INSERT_OP) {
      ++nEdits;
    } else if (op === T.SENTINEL_OP) {
      break;
    }
  }
  return nEdits;
};
