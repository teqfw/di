// @ts-check

/**
 * TeqFW-style ES module fixture with a dependency-free default export and a
 * dependency-bearing named export.
 */
export default class TestSample_NamedOnly {
  constructor() {
    let startedAt = null;

    this.start = function () {
      startedAt = Date.now();
      return startedAt;
    };

    this.getStartedAt = function () {
      return startedAt;
    };
  }
}

/**
 * Named export that receives its own dependency contract.
 */
export class Factory {
  /**
   * @param {object} deps
   * @param {TestSample_Helper_Clock} deps.clock
   */
  constructor({clock}) {
    this.startAt = function () {
      return clock.now();
    };
  }
}

export const __deps__ = Object.freeze({
  Factory: Object.freeze({
    clock: 'TestSample_Helper_Clock$',
  }),
});
