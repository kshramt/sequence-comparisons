import assert from "assert";

export const SENTINEL_OP = 0;
export const KEEP_OP = 1;
export const DELETE_OP = 2;
export const INSERT_OP = 3;

export type TOp =
  | typeof SENTINEL_OP
  | typeof KEEP_OP
  | typeof DELETE_OP
  | typeof INSERT_OP;

/**
 * This function ascertains the disparities between two arrays.
 *
 * The method of determining the differences leverages a linear-space refinement (as discussed in "A linear space algorithm for computing maximal common subsequences", Hirshberg, 1975) of the approach described in "An O(NP) sequence comparison algorithm" by Wu et al. (1989).
 * The space complexity of this operation is O(N), while the worst-case time complexity is O(NP), wherein N represents the length of the larger array of the two, and P denotes the number of deletion operations necessitated to morph `a` into `b`.
 *
 * @param a - The initial or source array.
 * @param b - The final or destination array.
 */
export const diffWu = <T>(
  xs: T[],
  ys: T[],
  isEqual: typeof _isEqual = _isEqual,
): TOp[] => {
  const nx = xs.length;
  const ny = ys.length;
  const ops = new Array(nx + ny).fill(SENTINEL_OP);
  const fps = new Array<number>(nx + ny + 3);
  const bps = new Array<number>(nx + ny + 3);
  const isLandscape = nx <= ny;
  if (isLandscape) {
    _diffWu(ops, 0, fps, bps, xs, 0, nx, ys, 0, ny, isLandscape, isEqual);
  } else {
    _diffWu(ops, 0, fps, bps, ys, 0, ny, xs, 0, nx, isLandscape, isEqual);
  }
  return ops;
};

function _diffWu<T>(
  ops: TOp[],
  iop1: number,
  fps: number[],
  bps: number[],
  xs: T[],
  ix1: number,
  ix2: number,
  ys: T[],
  iy1: number,
  iy2: number,
  isLandscape: boolean,
  isEqual: typeof _isEqual,
): number {
  const nx = ix2 - ix1;
  const ny = iy2 - iy1;
  assert(nx <= ny);
  const deleteOp = isLandscape ? DELETE_OP : INSERT_OP;
  const insertOp = isLandscape ? INSERT_OP : DELETE_OP;
  if (ny === 0) {
    return 0;
  }
  if (nx === 0) {
    for (let i = 0; i < ny; ++i) {
      ops[iop1 + i] = insertOp;
    }
    return ny;
  }
  if (ny === 1) {
    if (isEqual(xs[ix1], ys[iy1])) {
      ops[iop1] = KEEP_OP;
      return 1;
    } else {
      ops[iop1] = deleteOp;
      ops[iop1 + 1] = insertOp;
      return 2;
    }
  }
  if (nx === 1) {
    let matched = false;
    for (let i = 0; i < ny; ++i) {
      if (isEqual(xs[ix1], ys[iy1 + i])) {
        matched = true;
        ops[iop1 + i] = KEEP_OP;
        ++i;
        for (; i < ny; ++i) {
          ops[iop1 + i] = insertOp;
        }
        break;
      } else {
        ops[iop1 + i] = insertOp;
      }
    }
    if (matched) {
      return ny;
    } else {
      ops[iop1 + ny] = deleteOp;
      return ny + 1;
    }
  }

  // Find the middle point `(mx, my)`.

  // Run the forward pass with P == 0.
  // If the path is reachable, then set `ops` and return.
  fps.fill(iy1 - 2, 0, nx + ny + 3);
  fps[nx + 1] = iy1 - 1;

  for (let i = 0; i < ny + 1; ++i) {
    bps[i] = iy1 + i - 1;
  }
  bps.fill(iy2, ny + 1);

  // P == 0
  forwardBelowDelta(fps, bps, 0, xs, ix1, ix2, ys, iy1, iy2, isEqual);
  forwardAtDelta(fps, bps, xs, ix1, ix2, ys, iy1, iy2, isEqual);
  const delta = ny - nx;
  const offset = nx + 1;
  if (iy2 - 1 === fps[offset + delta]) {
    let iop = iop1 - 1;
    let iy = iy1 - 1;
    for (let k = 0; k < delta; ++k) {
      while (iy + 1 < fps[offset + k] + 1) {
        ++iy;
        ++iop;
        ops[iop] = KEEP_OP;
      }
      ++iy;
      ++iop;
      ops[iop] = insertOp;
    }
    while (iy + 1 < iy2) {
      ++iy;
      ++iop;
      ops[iop] = KEEP_OP;
    }
    return iop - iop1 + 1;
  }

  // Run the backward pass with P == 0.
  let mx: number;
  let my: number;
  let p = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    [mx, my] = backwardAtDelta(fps, bps, xs, ix1, ix2, ys, iy1, iy2, isEqual);
    if (ix1 - 2 < mx) {
      break;
    }
    [mx, my] = backwardBelowDelta(
      fps,
      bps,
      xs,
      ix1,
      ix2,
      ys,
      iy1,
      iy2,
      isEqual,
    );
    if (ix1 - 2 < mx) {
      break;
    }
    [mx, my] = backwardAboveDelta(
      fps,
      bps,
      xs,
      ix1,
      ix2,
      ys,
      iy1,
      iy2,
      isEqual,
    );
    if (ix1 - 2 < mx) {
      break;
    }
    ++p;
    [mx, my] = forwardBelowDelta(
      fps,
      bps,
      p,
      xs,
      ix1,
      ix2,
      ys,
      iy1,
      iy2,
      isEqual,
    );
    if (ix1 - 2 < mx) {
      break;
    }
    [mx, my] = forwardAboveDelta(
      fps,
      bps,
      p,
      xs,
      ix1,
      ix2,
      ys,
      iy1,
      iy2,
      isEqual,
    );
    if (ix1 - 2 < mx) {
      break;
    }
    [mx, my] = forwardAtDelta(fps, bps, xs, ix1, ix2, ys, iy1, iy2, isEqual);
    if (ix1 - 2 < mx) {
      break;
    }
  }

  const isCurrentLandscape = mx - ix1 <= my - iy1;
  const nOpsTL = isCurrentLandscape
    ? _diffWu(
        ops,
        iop1,
        fps,
        bps,
        xs,
        ix1,
        mx + 1,
        ys,
        iy1,
        my + 1,
        isCurrentLandscape === isLandscape,
        isEqual,
      )
    : _diffWu(
        ops,
        iop1,
        fps,
        bps,
        ys,
        iy1,
        my + 1,
        xs,
        ix1,
        mx + 1,
        isCurrentLandscape === isLandscape,
        isEqual,
      );
  {
    const isCurrentLandscape = ix2 - mx <= iy2 - my;
    const nOpsBR = isCurrentLandscape
      ? _diffWu(
          ops,
          iop1 + nOpsTL,
          fps,
          bps,
          xs,
          mx + 1,
          ix2,
          ys,
          my + 1,
          iy2,
          isCurrentLandscape === isLandscape,
          isEqual,
        )
      : _diffWu(
          ops,
          iop1 + nOpsTL,
          fps,
          bps,
          ys,
          my + 1,
          iy2,
          xs,
          mx + 1,
          ix2,
          isCurrentLandscape === isLandscape,
          isEqual,
        );
    return nOpsTL + nOpsBR;
  }
}

export const forwardBelowDelta = <T>(
  fps: number[],
  bps: number[],
  p: number,
  xs: T[],
  ix1: number,
  ix2: number,
  ys: T[],
  iy1: number,
  iy2: number,
  isEqual: typeof _isEqual,
) => {
  const nx = ix2 - ix1;
  const ny = iy2 - iy1;
  const delta = ny - nx;
  const offset = nx + 1;
  for (let k = -p; k < delta; ++k) {
    const iy = Math.max(fps[offset + k - 1] + 1, fps[offset + k + 1]);
    fps[offset + k] = iy;
    if (bps[offset + k] <= iy) {
      const ix = iy - iy1 - k + ix1;
      return [ix, iy];
    }
    fps[offset + k] = snakeForward(k, iy, xs, ix1, ix2, ys, iy1, iy2, isEqual);
  }
  return [ix1 - 2, iy1 - 2];
};

export const forwardAboveDelta = <T>(
  fps: number[],
  bps: number[],
  p: number,
  xs: T[],
  ix1: number,
  ix2: number,
  ys: T[],
  iy1: number,
  iy2: number,
  isEqual: typeof _isEqual,
) => {
  const nx = ix2 - ix1;
  const ny = iy2 - iy1;
  const delta = ny - nx;
  const offset = nx + 1;
  for (let k = delta + p; delta < k; --k) {
    const iy = Math.max(fps[offset + k - 1] + 1, fps[offset + k + 1]);
    fps[offset + k] = iy;
    if (bps[offset + k] <= iy) {
      const ix = iy - iy1 - k + ix1;
      return [ix, iy];
    }
    fps[offset + k] = snakeForward(k, iy, xs, ix1, ix2, ys, iy1, iy2, isEqual);
  }
  return [ix1 - 2, iy1 - 2];
};
export const forwardAtDelta = <T>(
  fps: number[],
  bps: number[],
  xs: T[],
  ix1: number,
  ix2: number,
  ys: T[],
  iy1: number,
  iy2: number,
  isEqual: typeof _isEqual,
) => {
  const nx = ix2 - ix1;
  const ny = iy2 - iy1;
  const delta = ny - nx;
  const offset = nx + 1;
  const iy = Math.max(fps[offset + delta - 1] + 1, fps[offset + delta + 1]);
  fps[offset + delta] = iy;
  if (bps[offset + delta] <= iy) {
    const ix = iy - iy1 - delta + ix1;
    return [ix, iy];
  }
  fps[offset + delta] = snakeForward(
    delta,
    iy,
    xs,
    ix1,
    ix2,
    ys,
    iy1,
    iy2,
    isEqual,
  );
  return [ix1 - 2, iy1 - 2];
};

export const backwardBelowDelta = <T>(
  fps: number[],
  bps: number[],
  xs: T[],
  ix1: number,
  ix2: number,
  ys: T[],
  iy1: number,
  iy2: number,
  isEqual: typeof _isEqual,
) => {
  const nx = ix2 - ix1;
  const ny = iy2 - iy1;
  const delta = ny - nx;
  const offset = nx + 1;
  for (let k = delta - 1; -nx - 1 < k; --k) {
    const iy = Math.max(
      Math.min(bps[offset + k - 1], bps[offset + k + 1] - 1),
      iy1 - 1,
    );
    bps[offset + k] = iy;
    if (iy <= fps[offset + k]) {
      const ix = iy - iy1 - k + ix1;
      return [ix, iy];
    }
    bps[offset + k] = snakeBackward(k, iy, xs, ix1, ys, iy1, isEqual);
  }
  return [ix1 - 2, iy1 - 2];
};

export const backwardAboveDelta = <T>(
  fps: number[],
  bps: number[],
  xs: T[],
  ix1: number,
  ix2: number,
  ys: T[],
  iy1: number,
  iy2: number,
  isEqual: typeof _isEqual,
) => {
  const nx = ix2 - ix1;
  const ny = iy2 - iy1;
  const delta = ny - nx;
  const offset = nx + 1;
  for (let k = delta + 1; k < ny + 1; ++k) {
    const iy = Math.max(
      Math.min(bps[offset + k - 1], bps[offset + k + 1] - 1),
      iy1 - 1,
    );
    bps[offset + k] = iy;
    if (iy <= fps[offset + k]) {
      const ix = iy - iy1 - k + ix1;
      return [ix, iy];
    }
    bps[offset + k] = snakeBackward(k, iy, xs, ix1, ys, iy1, isEqual);
  }
  return [ix1 - 2, iy1 - 2];
};

export const backwardAtDelta = <T>(
  fps: number[],
  bps: number[],
  xs: T[],
  ix1: number,
  ix2: number,
  ys: T[],
  iy1: number,
  iy2: number,
  isEqual: typeof _isEqual,
): [number, number] => {
  const nx = ix2 - ix1;
  const ny = iy2 - iy1;
  const delta = ny - nx;
  const offset = nx + 1;
  const iy = Math.max(
    Math.min(bps[offset + delta - 1], bps[offset + delta + 1] - 1),
    iy1 - 1,
  );
  bps[offset + delta] = iy;
  if (iy <= fps[offset + delta]) {
    const ix = iy - iy1 - delta + ix1;
    return [ix, iy];
  }
  bps[offset + delta] = snakeBackward(delta, iy, xs, ix1, ys, iy1, isEqual);
  return [ix1 - 2, iy1 - 2];
};

const snakeForward = <T>(
  k: number,
  iy: number,
  xs: T[],
  ix1: number,
  ix2: number,
  ys: T[],
  iy1: number,
  iy2: number,
  isEqual: typeof _isEqual,
) => {
  let ix = iy - iy1 - k + ix1;
  while (ix + 1 < ix2 && iy + 1 < iy2 && isEqual(xs[ix + 1], ys[iy + 1])) {
    ++ix;
    ++iy;
  }
  return iy;
};

const snakeBackward = <T>(
  k: number,
  iy: number,
  xs: T[],
  ix1: number,
  ys: T[],
  iy1: number,
  isEqual: typeof _isEqual,
) => {
  let ix = iy - iy1 - k + ix1;
  while (ix1 <= ix && iy1 <= iy && isEqual(xs[ix], ys[iy])) {
    --ix;
    --iy;
  }
  return iy;
};

export const _isEqual = <T>(x: T, y: T): boolean => {
  return x === y;
};
