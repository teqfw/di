// @ts-check

/**
 * TeqFW-style ES module fixture demonstrating the shorthand dependency form.
 *
 * This file uses a flat `__deps__` object as a compact form for a module with a
 * single relevant export contract.
 */
export default class TestSample_Shorthand {
  /**
   * @param {object} deps
   * @param {TestSample_Helper_Clock} deps.clock
   */
  constructor({clock}) {
    let startedAt = null;

    this.start = function () {
      startedAt = clock.now();
      return startedAt;
    };

    this.getStartedAt = function () {
      return startedAt;
    };
  }
}

/**
 * Shorthand dependency descriptor for a single-export-style module.
 */
export const __deps__ = Object.freeze({
  clock: 'TestSample_Helper_Clock$',
});
