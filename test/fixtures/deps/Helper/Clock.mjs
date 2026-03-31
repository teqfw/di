// @ts-check

/**
 * Minimal helper clock used by the fixture modules.
 */
export default class TestSample_Helper_Clock {
  constructor() {
    this.now = function () {
      return new Date('2026-03-31T00:00:00.000Z');
    };
  }
}
