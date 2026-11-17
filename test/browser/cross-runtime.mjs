import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import Container from '../../src/Container.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const playwrightModulePath = process.env.TEQFW_DI_PLAYWRIGHT_MODULE;
if (!playwrightModulePath) throw new Error('Set TEQFW_DI_PLAYWRIGHT_MODULE to the installed Playwright entry path.');
const {chromium} = await import(pathToFileURL(path.resolve(playwrightModulePath)).href);
const mime = new Map([['.mjs', 'text/javascript'], ['.js', 'text/javascript'], ['.html', 'text/html']]);
const server = http.createServer(async (req, res) => {
    try {
        const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
        if (pathname === '/') {
            res.writeHead(200, {'content-type': 'text/html'});
            res.end('<!doctype html><title>DI browser harness</title>');
            return;
        }
        const localPath = path.resolve(root, `.${pathname}`);
        if (!localPath.startsWith(root + path.sep)) throw new Error('path escapes root');
        const bytes = await fs.readFile(localPath);
        res.writeHead(200, {'content-type': mime.get(path.extname(localPath)) ?? 'application/octet-stream'});
        res.end(bytes);
    } catch {
        res.writeHead(404);
        res.end('Not found');
    }
});
await new Promise((resolve) => server.listen({port: 0, host: '127.0.0.1'}, () => resolve(undefined)));
const listenAddress = server.address();
if (!listenAddress || (typeof listenAddress === 'string')) throw new Error('HTTP server did not acquire a TCP port.');
const origin = `http://127.0.0.1:${listenAddress.port}`;

/** @param {typeof Container} Implementation @param {string} target */
async function runScenario(Implementation, target) {
    const container = new Implementation({
        introspection: true,
        namespaces: [{prefix: 'Fx_', target, defaultExt: '.mjs'}],
        preprocessors: ['Fx_CrossRuntimePolicy__Alias$'],
        postprocessors: ['Fx_CrossRuntimePolicy__Adapt$'],
    });
    const rootValue = /** @type {any} */ (await container.get('Fx_CrossRuntimeRoot$'));
    const rootObservation = /** @type {any} */ (container.getIntrospection());
    const providerPromise = rootValue.deferred.resolve();
    const queuedGetPromise = container.get('Fx_CrossRuntimeLater$');
    const [provided, queuedGet] = await Promise.all([providerPromise, queuedGetPromise]);
    const providedAgain = await rootValue.deferred.resolve();
    const aliasResolution = /** @type {any[]} */ (rootObservation.explanation.resolutions).find((one) => one.requested.address === 'Fx_CrossRuntimeAlias');
    const sharedState = /** @type {any} */ (globalThis);
    return {
        rootFrozen: Object.isFrozen(rootValue),
        providerFrozen: Object.isFrozen(rootValue.deferred),
        directFresh: rootValue.directA !== rootValue.directB,
        directAdaptedAndFrozen: rootValue.directA.adapted && Object.isFrozen(rootValue.directA),
        singletonShared: rootValue.singletonA === rootValue.singletonB,
        singletonWrapped: rootValue.singletonA.wrapped === true,
        transientFresh: rootValue.transientA !== rootValue.transientB,
        aliasResolvedByPreprocessor: aliasResolution?.effective.address === 'Fx_CrossRuntimeSingleton',
        aliasAdaptedAndFrozen: rootValue.alias.adapted && Object.isFrozen(rootValue.alias),
        providerSingletonReused: provided === providedAgain,
        providerAdaptedAndFrozen: provided.adapted && Object.isFrozen(provided),
        fifoProviderBeforeGet: sharedState.__teqfwDiCrossRuntime.queue.slice(0, 2).join(',') === 'provider,get',
        queuedGetAdaptedAndFrozen: queuedGet.adapted && Object.isFrozen(queuedGet),
        observedChildCount: rootObservation.graph.edges.length,
        observedRelationships: /** @type {any[]} */ (rootObservation.graph.edges).map((edge) => ({
            dependencyName: edge.dependencyName,
            requestedAddress: edge.requested.address,
            effectiveAddress: edge.effective.address,
            lifestyle: edge.effective.lifestyle,
            wrappers: edge.effective.wrappers,
        })),
    };
}

let browser;
try {
    const sharedState = /** @type {any} */ (globalThis);
    sharedState.__teqfwDiCrossRuntime = {queue: []};
    const nodeResult = await runScenario(Container, pathToFileURL(path.join(root, 'test/integration/fixture') + path.sep).href);
    browser = await chromium.launch({headless: true, args: ['--no-sandbox']});
    const page = await browser.newPage();
    /** @type {string[]} */
    const errors = [];
    page.on('pageerror', (/** @type {Error} */ error) => errors.push(error.message));
    page.on('console', (/** @type {{type: () => string, text: () => string}} */ message) => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(origin, {waitUntil: 'domcontentloaded'});
    const browserResult = await page.evaluate(async (/** @type {string} */ fixtureRoot) => {
        (/** @type {any} */ (globalThis)).__teqfwDiCrossRuntime = {queue: []};
        const bundleSpecifier = '/dist/esm.js';
        const {default: BrowserContainer} = await import(bundleSpecifier);
        const container = new BrowserContainer({
            introspection: true,
            namespaces: [{prefix: 'Fx_', target: fixtureRoot, defaultExt: '.mjs'}],
            preprocessors: ['Fx_CrossRuntimePolicy__Alias$'],
            postprocessors: ['Fx_CrossRuntimePolicy__Adapt$'],
        });
        const rootValue = /** @type {any} */ (await container.get('Fx_CrossRuntimeRoot$'));
        const rootObservation = /** @type {any} */ (container.getIntrospection());
        const providerPromise = rootValue.deferred.resolve();
        const queuedGetPromise = container.get('Fx_CrossRuntimeLater$');
        const [provided, queuedGet] = await Promise.all([providerPromise, queuedGetPromise]);
        const providedAgain = await rootValue.deferred.resolve();
        const aliasResolution = rootObservation.explanation.resolutions.find((/** @type {any} */ one) => one.requested.address === 'Fx_CrossRuntimeAlias');
        const sharedState = /** @type {any} */ (globalThis);
        return {
            rootFrozen: Object.isFrozen(rootValue),
            providerFrozen: Object.isFrozen(rootValue.deferred),
            directFresh: rootValue.directA !== rootValue.directB,
            directAdaptedAndFrozen: rootValue.directA.adapted && Object.isFrozen(rootValue.directA),
            singletonShared: rootValue.singletonA === rootValue.singletonB,
            singletonWrapped: rootValue.singletonA.wrapped === true,
            transientFresh: rootValue.transientA !== rootValue.transientB,
            aliasResolvedByPreprocessor: aliasResolution?.effective.address === 'Fx_CrossRuntimeSingleton',
            aliasAdaptedAndFrozen: rootValue.alias.adapted && Object.isFrozen(rootValue.alias),
            providerSingletonReused: provided === providedAgain,
            providerAdaptedAndFrozen: provided.adapted && Object.isFrozen(provided),
            fifoProviderBeforeGet: sharedState.__teqfwDiCrossRuntime.queue.slice(0, 2).join(',') === 'provider,get',
            queuedGetAdaptedAndFrozen: queuedGet.adapted && Object.isFrozen(queuedGet),
            observedChildCount: rootObservation.graph.edges.length,
            observedRelationships: rootObservation.graph.edges.map((/** @type {any} */ edge) => ({
                dependencyName: edge.dependencyName,
                requestedAddress: edge.requested.address,
                effectiveAddress: edge.effective.address,
                lifestyle: edge.effective.lifestyle,
                wrappers: edge.effective.wrappers,
            })),
        };
    }, `${origin}/test/integration/fixture/`);
    assert.ok(Object.values(nodeResult).filter((value) => typeof value === 'boolean').every(Boolean), JSON.stringify(nodeResult));
    assert.ok(Object.values(browserResult).filter((value) => typeof value === 'boolean').every(Boolean), JSON.stringify(browserResult));
    assert.deepEqual(browserResult, nodeResult);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({runtime: await browser.version(), nodeResult, browserResult}, null, 2));
} finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(() => resolve(undefined)));
}
