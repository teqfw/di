import { dirname, join } from 'node:path';
import assert from 'node:assert';
import { describe, it } from 'node:test';

import Defs from '../../src/Defs.js';
import DepId from '../../src/DepId.js';
import ContainerConfig from '../../src/Container/Config.js';

const __dirname = dirname(import.meta.url);
const ROOT = join(__dirname, '..', '_data', 'Container');

describe('TeqFw_Di_Container_Config', () => {
    it('exposes expected configuration API methods', () => {
        const cfg = new ContainerConfig();

        const expected = [
            'enableTestMode',
            'finalize',
            'parser',
            'postProcessor',
            'preProcessor',
            'register',
            'resolver',
        ];

        for (const name of expected) {
            assert.strictEqual(typeof cfg[name], 'function', `Missing method: ${name}()`);
        }
    });

    it('returns configurators with expected public surface', () => {
        const cfg = new ContainerConfig();

        const parser = cfg.parser();
        assert.strictEqual(typeof parser.addChunk, 'function');
        assert.strictEqual(typeof parser.parse, 'function');
        assert.strictEqual(typeof parser.setDefaultChunk, 'function');

        const pre = cfg.preProcessor();
        assert.strictEqual(typeof pre.addChunk, 'function');
        assert.strictEqual(typeof pre.modify, 'function');

        const post = cfg.postProcessor();
        assert.strictEqual(typeof post.addChunk, 'function');
        assert.strictEqual(typeof post.modify, 'function');

        const resolver = cfg.resolver();
        assert.strictEqual(typeof resolver.addNamespaceRoot, 'function');
        assert.strictEqual(typeof resolver.resolve, 'function');
        assert.strictEqual(typeof resolver.setWindowsEnv, 'function');
    });

    describe('finalize()', () => {
        it('returns runtime container API with get() and compose()', async () => {
            /** @type {TeqFw_Di_Container_Config} */
            const cfg = new ContainerConfig();
            cfg.resolver().addNamespaceRoot('App_', join(ROOT, 'basic'), 'js');

            const container = cfg.finalize();

            assert.strictEqual(typeof container.get, 'function', 'Runtime container must have get()');
            assert.strictEqual(typeof container.compose, 'function', 'Runtime container must have compose()');

            const service = await container.compose('App_Service$');
            assert.strictEqual(typeof service, 'function');
            service({ hello: 'world' });
        });
    });

    describe('configurators affect runtime container behavior', () => {
        it('parser() customization affects resolution (custom chunk)', async () => {
            class AliasChunk {
                canParse(depId) {
                    return depId === 'Alias_Service$';
                }
                parse(depId) {
                    const dto = new DepId();
                    dto.origin = depId;
                    dto.isNodeModule = false;
                    dto.moduleName = 'My_Test_Module';
                    dto.exportName = 'default';
                    dto.composition = Defs.CF;
                    dto.life = Defs.LS;
                    dto.wrappers = [];
                    return dto;
                }
            }

            const cfg = new ContainerConfig();
            cfg.enableTestMode();

            const obj = { ok: true };
            cfg.register('My_Test_Module$', obj);

            cfg.parser().addChunk(new AliasChunk());

            const container = cfg.finalize();
            const resolved = await container.get('Alias_Service$');

            assert.strictEqual(resolved, obj);
        });

        it('preProcessor() customization can redirect moduleName', async () => {
            class RedirectChunk {
                modify(currentKey, originalKey) {
                    if (originalKey?.origin === 'Alias_Service$') {
                        const next = new DepId();
                        Object.assign(next, currentKey);
                        next.moduleName = 'App_Service';
                        return next;
                    }
                    return currentKey;
                }
            }

            const cfg = new ContainerConfig();
            cfg.resolver().addNamespaceRoot('App_', join(ROOT, 'basic'), 'js');
            cfg.preProcessor().addChunk(new RedirectChunk());

            const container = cfg.finalize();
            const service = await container.get('Alias_Service$');

            assert.strictEqual(typeof service, 'function');
            service({ redirected: true });
        });

        it('postProcessor() customization can wrap the resolved object', async () => {
            class WrapChunk {
                modify(obj, depId) {
                    if (depId?.moduleName === 'App_Service' && depId?.exportName === 'default') {
                        return { wrapped: obj };
                    }
                    return obj;
                }
            }

            const cfg = new ContainerConfig();
            cfg.resolver().addNamespaceRoot('App_', join(ROOT, 'basic'), 'js');
            cfg.postProcessor().addChunk(new WrapChunk());

            const container = cfg.finalize();
            const res = await container.get('App_Service$');

            assert(res && typeof res === 'object');
            assert.strictEqual(typeof res.wrapped, 'function');
            res.wrapped({ wrapped: true });
        });
    });

    describe('test mode: enableTestMode() + register()', () => {
        it('register() throws if test mode is not enabled', () => {
            const cfg = new ContainerConfig();
            assert.throws(() => cfg.register('My_Test_Module$', {}), /enableTestMode\(\)/);
        });

        it('registers a singleton in test mode and resolves it after finalize()', async () => {
            const cfg = new ContainerConfig();
            cfg.enableTestMode();

            const obj = { hello: 'world' };
            cfg.register('My_Test_Module$', obj);

            const container = cfg.finalize();
            const instance = await container.get('My_Test_Module$');

            assert.strictEqual(instance, obj);
        });

        it('registers a node: module replacement and uses it during composition', async () => {
            const logs = [];
            const logger = {
                info: (msg) => logs.push(String(msg)),
                error: (msg) => logs.push(String(msg)),
            };

            const http2Mock = {
                constants: { HTTP2_HEADER_CONTENT_TYPE: 'X-TEST-HEADER' },
            };

            const cfg = new ContainerConfig();
            cfg.enableTestMode();

            cfg.register('App_Logger$', logger);
            cfg.register('node:http2', http2Mock);

            cfg.resolver().addNamespaceRoot('App_', join(ROOT, 'classes'), 'js');

            const container = cfg.finalize();
            const service = await container.get('App_Service$');
            service({ ok: true });

            assert.ok(
                logs.some((s) => s.includes('Header: X-TEST-HEADER')),
                `Expected logger output to include mocked header, got: ${JSON.stringify(logs)}`
            );
        });
    });
});
