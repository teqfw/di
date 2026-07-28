import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {createBrowserBundleBoundaryGuard} from '../../rollup.config.js';

describe('browser bundle boundary guard', () => {
    it('allows isomorphic source modules', () => {
        const guard = createBrowserBundleBoundaryGuard();
        assert.doesNotThrow(() => {
            guard.moduleParsed.call({
                error(message) {
                    throw new Error(message);
                },
            }, {id: '/project/src/Container.mjs'});
        });
    });

    it('rejects Node.js registries and the deprecated compatibility wrapper', () => {
        const guard = createBrowserBundleBoundaryGuard();
        const context = {
            error(message) {
                throw new Error(message);
            },
        };

        assert.throws(
            () => guard.moduleParsed.call(context, {id: '/project/src/Node/Registry/Package.mjs'}),
            /Browser bundle must not include Node\.js-only composition module/,
        );
        assert.throws(
            () => guard.moduleParsed.call(context, {id: '/project/src/Config/NamespaceRegistry.mjs'}),
            /Browser bundle must not include Node\.js-only composition module/,
        );
    });
});
