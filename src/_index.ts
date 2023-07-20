export const SENTINEL_OP = 0;
export const KEEP_OP = 1;
export const DELETE_OP = 2;
export const INSERT_OP = 3;

export type TOp =
  | typeof SENTINEL_OP
  | typeof KEEP_OP
  | typeof DELETE_OP
  | typeof INSERT_OP;

export type TCompresedOp = string | number;

/**
 * This class, `ApplyCompressedOpsForString`, is designed to execute the operations produced by the `compressOpsForString` function on a given array of strings.
 */
export class ApplyCompressedOpsForString {
  #nXs: number;
  xs: string[];
  ys: string[];
  constructor(xs: string[]) {
    this.#nXs = xs.length;
    this.xs = xs;
    this.ys = [];
  }
  apply = (ops: TCompresedOp[]) => {
    let ix = -1;
    let iy = -1;
    for (const op of ops) {
      switch (typeof op) {
        case "number":
          if (op < 0) {
            ix -= op;
          } else {
            for (let i = 0; i < op; ++i) {
              this.ys[++iy] = this.xs[++ix];
            }
          }
          break;
        case "string":
          for (const char of Array.from(op)) {
            this.ys[++iy] = char;
          }
      }
    }
    [this.xs, this.ys] = [this.ys, this.xs];
    this.#nXs = iy + 1;
    return this;
  };
  get = () => {
    return this.xs.slice(0, this.#nXs).join("");
  };
}

/**
 * This function refines the operations returned from `diffWu` into a more compact format.
 *
 * @param ops The array of operations outputted by the `diffWu` function.
 * @param ys The final or destination array of strings that was input to the `diffWu` function.
 * @returns A compact array of operations. This array combines strings and numbers. A negative number `n` signifies that the subsequent `-n` elements in `xs` are to be removed. A positive number `n` signifies that the subsequent `n` elements in both `xs` should remain unchanged. A string element denotes that the corresponding element should be inserted into the array.
 */
export const compressOpsForString = (ops: TOp[], ys: string[]) => {
  const res: TCompresedOp[] = [];
  let iy = -1;
  let nDelete = 0;
  let nKeep = 0;
  const insertedElements: string[] = [];
  let prevOp = SENTINEL_OP;
  loop: for (const op of ops) {
    if (op !== prevOp && prevOp !== SENTINEL_OP) {
      switch (prevOp) {
        case DELETE_OP:
          res.push(-nDelete);
          nDelete = 0;
          break;
        case KEEP_OP:
          res.push(nKeep);
          nKeep = 0;
          break;
        case INSERT_OP:
          res.push(insertedElements.join(""));
          insertedElements.length = 0;
          break;
      }
    }
    switch (op) {
      case KEEP_OP:
        ++iy;
        ++nKeep;
        break;
      case DELETE_OP:
        ++nDelete;
        break;
      case INSERT_OP:
        ++iy;
        insertedElements.push(ys[iy]);
        break;
      case SENTINEL_OP:
        break loop;
    }
    prevOp = op;
  }
  return res;
};

/**
 * This class, `DiffWu`, encapsulates working arrays and invokes the `diffWu` function with these arrays to optimize memory usage.
 *
 * Please see `diffWu` for more information.
 */
export class DiffWu {
  #ops: TOp[];
  #fps: number[];
  #bps: number[];

  constructor() {
    this.#ops = new Array(1).fill(SENTINEL_OP);
    this.#fps = new Array(3);
    this.#bps = new Array(3);
  }

  /**
   * This method, `call`, invokes the `diffWu` function with the specified parameters.
   *
   * Please see `diffWu` for more information.
   */
  call = <T>(xs: T[], ys: T[], isEqual: typeof _isEqual = _isEqual) => {
    const nx = xs.length;
    const ny = ys.length;
    const opsLength = nx + ny + 1;
    if (this.#ops.length < opsLength) {
      this.#ops.length = opsLength;
    }
    this.#ops.fill(SENTINEL_OP, 0, opsLength);
    const fpsLength = nx + ny + 3;
    if (this.#fps.length < fpsLength) {
      this.#fps.length = fpsLength;
      this.#bps.length = fpsLength;
    }
    _diffWu(
      this.#ops,
      0,
      this.#fps,
      this.#bps,
      xs,
      0,
      nx,
      ys,
      0,
      ny,
      false,
      isEqual,
    );
    return this.#ops;
  };
}

/**
 * This function calculates the differences between two arrays using an optimized algorithm.
 *
 * The difference calculation is based on a linear-space refinement, as outlined in the paper "A linear space algorithm for computing maximal common subsequences" by Hirshberg (1975), of "An O(NP) sequence comparison algorithm" by Wu et al. (1989).
 * The space complexity of this operation is O(N), signifying that the memory usage is proportional to the length of the larger array.
 * The worst-case time complexity is O(NP), indicating that the time taken is proportional to the product of the length of the larger array (N) and the number of deletion (insertion if `xs` is longer than `ys`) operations (P) required to transform the source array `xs` into the destination array `ys`.
 *
 * @param xs - The source array, which is the initial state before the transformation.
 * @param ys - The destination array, which is the final state after the transformation.
 * @returns An array of operations that are needed to convert `xs` into `ys`. The returned array always ends with a `SENTINEL_OP` operation, serving as a marker for the end of operations.
 */
export const diffWu = <T>(
  xs: T[],
  ys: T[],
  isEqual: typeof _isEqual = _isEqual,
): TOp[] => {
  const nx = xs.length;
  const ny = ys.length;
  const ops = new Array(nx + ny + 1).fill(SENTINEL_OP);
  const fps = new Array<number>(nx + ny + 3);
  const bps = new Array<number>(nx + ny + 3);
  _diffWu(ops, 0, fps, bps, xs, 0, nx, ys, 0, ny, false, isEqual);
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
  isSwapped: boolean,
  isEqual: typeof _isEqual,
): number {
  if (iy2 - iy1 < ix2 - ix1) {
    [xs, ys] = [ys, xs];
    [ix1, iy1] = [iy1, ix1];
    [ix2, iy2] = [iy2, ix2];
    isSwapped = !isSwapped;
  }
  const nx = ix2 - ix1;
  const ny = iy2 - iy1;
  const deleteOp = isSwapped ? INSERT_OP : DELETE_OP;
  const insertOp = isSwapped ? DELETE_OP : INSERT_OP;
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

  const delta = ny - nx;
  const offset = nx + 1;

  // Run the backward pass with P == 0.
  let mx: number;
  let my: number;
  let p = -1;
  // eslint-disable-next-line no-constant-condition
  p_loop: while (true) {
    ++p;
    for (const k of getForwardLoop(delta, p)) {
      const iy = Math.max(fps[offset + k - 1] + 1, fps[offset + k + 1]);
      fps[offset + k] = iy;
      if (bps[offset + k] <= iy) {
        const ix = iy - iy1 - k + ix1;
        mx = ix;
        my = iy;
        break p_loop;
      }
      fps[offset + k] = snakeForward(
        k,
        iy,
        xs,
        ix1,
        ix2,
        ys,
        iy1,
        iy2,
        isEqual,
      );
    }
    if (p === 0 && iy2 - 1 === fps[offset + delta]) {
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

    for (const k of getBackwardLoop(delta, nx, ny)) {
      const iy = Math.max(
        Math.min(bps[offset + k - 1], bps[offset + k + 1] - 1),
        iy1 - 1,
      );
      bps[offset + k] = iy;
      if (iy <= fps[offset + k]) {
        const ix = iy - iy1 - k + ix1;
        mx = ix;
        my = iy;
        break p_loop;
      }
      bps[offset + k] = snakeBackward(k, iy, xs, ix1, ys, iy1, isEqual);
    }
  }

  const nOpsTopLeft = _diffWu(
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
    isSwapped,
    isEqual,
  );
  const nOpsBottomRight = _diffWu(
    ops,
    iop1 + nOpsTopLeft,
    fps,
    bps,
    xs,
    mx + 1,
    ix2,
    ys,
    my + 1,
    iy2,
    isSwapped,
    isEqual,
  );
  return nOpsTopLeft + nOpsBottomRight;
}

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

function* getForwardLoop(delta: number, p: number) {
  // Below delta
  for (let k = -p; k < delta; ++k) {
    yield k;
  }
  // Above delta
  for (let k = delta + p; delta < k; --k) {
    yield k;
  }
  // At delta
  yield delta;
}

function* getBackwardLoop(delta: number, nx: number, ny: number) {
  // At delta
  yield delta;
  // Below delta
  for (let k = delta - 1; -nx - 1 < k; --k) {
    yield k;
  }
  // Above delta
  for (let k = delta + 1; k < ny + 1; ++k) {
    yield k;
  }
}
