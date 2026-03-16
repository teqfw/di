import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Container_Resolve_GraphResolver from '../../../../src/Container/Resolve/GraphResolver.mjs';

/**
 * @param {Partial<TeqFw_Di_DepId$DTO>} [patch]
 * @returns {TeqFw_Di_DepId$DTO}
 */
function createDepId(patch = {}) {
    return /** @type {TeqFw_Di_DepId$DTO} */ ({
        moduleName: 'App_Root',
        platform: 'teq',
        exportName: null,
        composition: 'A',
        life: null,
        wrappers: [],
        origin: 'unit-test',
        ...patch,
    });
}

/**
 * @param {TeqFw_Di_DepId$DTO} depId
 * @returns {string}
 */
function makeDepKey(depId) {
    const exportName = depId.exportName === null ? '' : depId.exportName;
    const life = depId.life === null ? '' : depId.life;
    const wrappers = Array.isArray(depId.wrappers) ? depId.wrappers.join('|') : '';
    return [
        depId.platform,
        depId.moduleName,
        exportName,
        depId.composition,
        life,
        wrappers,
    ].join('::');
}

/**
 * @returns {{
 *   parser: TeqFw_Di_Def_Parser,
 *   resolver: TeqFw_Di_Resolver,
 *   setParsed(cdc: string, depId: TeqFw_Di_DepId$DTO): void,
 *   setNamespace(depId: TeqFw_Di_DepId$DTO, namespace: object): void,
 *   parseCalls: string[],
 *   resolveCalls: string[]
 * }}
 */
function createDoubles() {
    /** @type {Map<string, TeqFw_Di_DepId$DTO>} */
    const parsed = new Map();
    /** @type {Map<string, object>} */
    const namespaces = new Map();
    /** @type {string[]} */
    const parseCalls = [];
    /** @type {string[]} */
    const resolveCalls = [];

    /** @type {TeqFw_Di_Def_Parser} */
    const parser = /** @type {TeqFw_Di_Def_Parser} */ ({
        parse(cdc) {
            parseCalls.push(cdc);
            if (!parsed.has(cdc)) throw new Error(`Unexpected CDC: ${cdc}`);
            return parsed.get(cdc);
        },
    });

    /** @type {TeqFw_Di_Resolver} */
    const resolver = /** @type {TeqFw_Di_Resolver} */ ({
        async resolve(depId) {
            const key = `${depId.platform}::${depId.moduleName}`;
            resolveCalls.push(key);
            if (!namespaces.has(key)) throw new Error(`Unexpected depId: ${key}`);
            return namespaces.get(key);
        },
    });

    return {
        parser,
        resolver,
        setParsed(cdc, depId) {
            parsed.set(cdc, depId);
        },
        setNamespace(depId, namespace) {
            namespaces.set(`${depId.platform}::${depId.moduleName}`, namespace);
        },
        parseCalls,
        resolveCalls,
    };
}

describe('TeqFw_Di_Container_Resolve_GraphResolver', () => {
    it('No Dependencies: returns map with root only', async () => {
        const root = createDepId({moduleName: 'App_Root'});
        const io = createDoubles();
        io.setNamespace(root, {default: 1});
        const resolver = new TeqFw_Di_Container_Resolve_GraphResolver({parser: io.parser, resolver: io.resolver});

        const graph = await resolver.resolve(root);

        assert.equal(graph.size, 1);
        assert.ok(graph.has(makeDepKey(root)));
        assert.deepStrictEqual(io.parseCalls, []);
        assert.deepStrictEqual(io.resolveCalls, ['teq::App_Root']);
    });

    it('Single-Level Dependency: root and child appear in map', async () => {
        const root = createDepId({moduleName: 'App_A'});
        const depB = createDepId({moduleName: 'App_B'});
        const io = createDoubles();
        io.setNamespace(root, {__deps__: {svc: 'App_B'}});
        io.setNamespace(depB, {});
        io.setParsed('App_B', depB);
        const resolver = new TeqFw_Di_Container_Resolve_GraphResolver({parser: io.parser, resolver: io.resolver});

        const graph = await resolver.resolve(root);

        assert.equal(graph.size, 2);
        assert.ok(graph.has(makeDepKey(root)));
        assert.ok(graph.has(makeDepKey(depB)));
    });

    it('Multi-Level Dependency: A -> B -> C resolved once each', async () => {
        const depA = createDepId({moduleName: 'App_A'});
        const depB = createDepId({moduleName: 'App_B'});
        const depC = createDepId({moduleName: 'App_C'});
        const io = createDoubles();
        io.setNamespace(depA, {__deps__: {b: 'App_B'}});
        io.setNamespace(depB, {__deps__: {c: 'App_C'}});
        io.setNamespace(depC, {});
        io.setParsed('App_B', depB);
        io.setParsed('App_C', depC);
        const resolver = new TeqFw_Di_Container_Resolve_GraphResolver({parser: io.parser, resolver: io.resolver});

        const graph = await resolver.resolve(depA);

        assert.equal(graph.size, 3);
        assert.deepStrictEqual(io.resolveCalls, ['teq::App_A', 'teq::App_B', 'teq::App_C']);
    });

    it('Cyclic Dependency Detection: A -> B -> A throws', async () => {
        const depA = createDepId({moduleName: 'App_A'});
        const depB = createDepId({moduleName: 'App_B'});
        const io = createDoubles();
        io.setNamespace(depA, {__deps__: {b: 'App_B'}});
        io.setNamespace(depB, {__deps__: {a: 'App_A'}});
        io.setParsed('App_B', depB);
        io.setParsed('App_A', depA);
        const resolver = new TeqFw_Di_Container_Resolve_GraphResolver({parser: io.parser, resolver: io.resolver});

        await assert.rejects(resolver.resolve(depA), /Cyclic dependency detected/);
    });

    it('does not pre-validate __deps__ shape and fails at point of use', async () => {
        const root = createDepId({moduleName: 'App_Root'});
        const io = createDoubles();
        io.setNamespace(root, {__deps__: 'bad'});
        const resolver = new TeqFw_Di_Container_Resolve_GraphResolver({parser: io.parser, resolver: io.resolver});

        await assert.rejects(resolver.resolve(root), /Unexpected CDC/);
    });

    it('Duplicate Dependency Resolution: shared module resolved once', async () => {
        const depA = createDepId({moduleName: 'App_A'});
        const depB = createDepId({moduleName: 'App_B'});
        const depC = createDepId({moduleName: 'App_C'});
        const depD = createDepId({moduleName: 'App_D'});
        const io = createDoubles();
        io.setNamespace(depA, {__deps__: {b: 'App_B', c: 'App_C'}});
        io.setNamespace(depB, {__deps__: {d: 'App_D'}});
        io.setNamespace(depC, {__deps__: {d: 'App_D'}});
        io.setNamespace(depD, {});
        io.setParsed('App_B', depB);
        io.setParsed('App_C', depC);
        io.setParsed('App_D', depD);
        const resolver = new TeqFw_Di_Container_Resolve_GraphResolver({parser: io.parser, resolver: io.resolver});

        const graph = await resolver.resolve(depA);

        assert.equal(graph.size, 4);
        assert.deepStrictEqual(io.resolveCalls, ['teq::App_A', 'teq::App_B', 'teq::App_D', 'teq::App_C']);
    });

    it('separates graph nodes for default and named exports from same module', async () => {
        const root = createDepId({moduleName: 'App_Root'});
        const depDefault = createDepId({
            moduleName: 'App_Module',
            exportName: 'default',
            composition: 'F',
            life: 'S',
        });
        const depFactory = createDepId({
            moduleName: 'App_Module',
            exportName: 'Factory',
            composition: 'F',
            life: 'S',
        });
        const io = createDoubles();
        io.setNamespace(root, {__deps__: {a: 'App_Module$', b: 'App_Module__Factory$'}});
        io.setNamespace(depDefault, {default: () => ({kind: 'default'})});
        io.setNamespace(depFactory, {Factory: () => ({kind: 'factory'})});
        io.setParsed('App_Module$', depDefault);
        io.setParsed('App_Module__Factory$', depFactory);
        const resolver = new TeqFw_Di_Container_Resolve_GraphResolver({parser: io.parser, resolver: io.resolver});

        const graph = await resolver.resolve(root);

        assert.equal(graph.size, 3);
        assert.ok(graph.has(makeDepKey(depDefault)));
        assert.ok(graph.has(makeDepKey(depFactory)));
    });

    it('Resolver Failure Propagation: forwards thrown error', async () => {
        const depA = createDepId({moduleName: 'App_A'});
        /** @type {TeqFw_Di_Def_Parser} */
        const parser = /** @type {TeqFw_Di_Def_Parser} */ ({
            parse() {
                throw new Error('not used');
            },
        });
        const rootError = new Error('resolver failed');
        /** @type {TeqFw_Di_Resolver} */
        const failingResolver = /** @type {TeqFw_Di_Resolver} */ ({
            async resolve() {
                throw rootError;
            },
        });
        const resolver = new TeqFw_Di_Container_Resolve_GraphResolver({parser, resolver: failingResolver});

        await assert.rejects(resolver.resolve(depA), (error) => {
            assert.strictEqual(error, rootError);
            return true;
        });
    });
});
