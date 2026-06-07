// @ts-check

/**
 * @namespace TeqFw_Di_Container
 * @description DI container orchestration entry point.
 */

import TeqFw_Di_Container_Runtime from './Container/Runtime.mjs';

/**
 * Container orchestration boundary.
 *
 * Delegates all runtime behavior to an internal runtime coordinator while
 * preserving the public API and contract surface.
 *
 * @LLM-DOC
 * Spec: ./ctx/docs/code/components/container.md
 */
export default class TeqFw_Di_Container {
    constructor() {
        /** @type {TeqFw_Di_Container_Runtime} */
        const runtime = new TeqFw_Di_Container_Runtime();

        this.addPreprocess = function (fn) {
            return runtime.addPreprocess(fn);
        };

        this.addPostprocess = function (fn) {
            return runtime.addPostprocess(fn);
        };

        this.setParser = function (next) {
            return runtime.setParser(next);
        };

        this.addNamespaceRoot = function (prefix, target, defaultExt) {
            return runtime.addNamespaceRoot(prefix, target, defaultExt);
        };

        this.enableTestMode = function () {
            return runtime.enableTestMode();
        };

        this.enableLogging = function () {
            return runtime.enableLogging();
        };

        this.register = function (cdc, mock) {
            return runtime.register(cdc, mock);
        };

        this.get = function (cdc) {
            return runtime.get(cdc);
        };
    }
}
