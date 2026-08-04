// @ts-check

/**
 * Minimal helper logger used by the fixture modules.
 */
export default class TestSample_Helper_Logger {
  constructor() {
    /**
     * @param {string} message
     * @returns {void}
     */
    this.info = function (message) {};
    /**
     * @param {string} message
     * @returns {void}
     */
    this.log = function (message) {};
    /**
     * @param {string} message
     * @returns {void}
     */
    this.error = function (message) {};
  }
}
