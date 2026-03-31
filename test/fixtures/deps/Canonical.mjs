// @ts-check

/**
 * Canonical TeqFW-style ES module fixture with export-scoped dependency
 * contracts.
 *
 * Canonical form:
 * - `__deps__.default` describes dependencies for the default export;
 * - `__deps__.Factory` describes dependencies for the named export.
 */
export default class TestSample_Canonical {
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
 * DI-managed named export used to show export-scoped dependency declaration.
 */
export class Factory {
  /**
   * @param {object} deps
   * @param {TestSample_Helper_Logger} deps.logger
   * @param {TestSample_Helper_Clock} deps.clock
   */
  constructor({logger, clock}) {
    this.create = function (name = 'canonical') {
      logger.info(`Creating ${name} at ${clock.now().toISOString()}.`);
      return {
        name,
        createdAt: clock.now(),
      };
    };
  }
}

/**
 * Export-scoped dependency descriptor in canonical hierarchical form.
 */
export const __deps__ = Object.freeze({
  default: Object.freeze({
    clock: 'TestSample_Helper_Clock$',
  }),
  Factory: Object.freeze({
    logger: 'TestSample_Helper_Logger$',
    clock: 'TestSample_Helper_Clock$',
  }),
});
