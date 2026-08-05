// @ts-check

/**
 * TeqFW-style ES module fixture with no declared dependency contracts.
 *
 * This file demonstrates the empty-descriptor case: the module exports a
 * `default` component, but no `__deps__` contract is declared.
 */
export default class TestSample_Empty {
  constructor() {
    /** @type {number|null} */
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
