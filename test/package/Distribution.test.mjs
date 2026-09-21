import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath, pathToFileURL} from 'node:url';

import {rollup} from 'rollup';

import rollupConfig from '../../rollup.config.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('release browser distributions match a clean Rollup build', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'teqfw-di-dist-'));
    /** @type {import('rollup').RollupOptions} */
    const inputOptions = /** @type {import('rollup').RollupOptions} */ (/** @type {unknown} */ ({
        input: path.join(rootDir, rollupConfig.input),
        plugins: rollupConfig.plugins,
    }));
    /** @type {import('rollup').OutputOptions[]} */
    const outputOptions = /** @type {import('rollup').OutputOptions[]} */ (/** @type {unknown} */ (rollupConfig.output));
    const bundle = await rollup(inputOptions);

    try {
        for (const output of outputOptions) {
            const outputFile = /** @type {string} */ (output.file);
            const generatedFile = path.join(tempDir, path.basename(outputFile));
            await bundle.write({...output, file: generatedFile});
            const committedFile = path.join(rootDir, outputFile);

            assert.deepEqual(
                await fs.readFile(generatedFile),
                await fs.readFile(committedFile),
                `${outputFile} must be regenerated after browser-reachable source changes.`,
            );
        }
    } finally {
        await bundle.close();
        await fs.rm(tempDir, {recursive: true, force: true});
    }
});

test('browser ESM distribution preserves current resolution semantics', async () => {
    const {default: Container} = await import(pathToFileURL(path.join(rootDir, 'dist', 'esm.js')).href);
    const fixtureDir = pathToFileURL(path.join(rootDir, 'test', 'integration', 'fixture')).href;
    const container = new Container({introspection: true});
    container.addNamespaceRoot('Fx_', fixtureDir, '.mjs');

    const root = await container.get('Fx_GraphLifestyle$');

    assert.strictEqual(root.singletonA, root.singletonB);
    assert.notStrictEqual(root.transientA, root.transientB);
    assert.strictEqual(root.directA, root.directB);
    const singleton = await container.get('Fx_Singleton$');
    assert.equal(singleton.token.kind, 'singleton');

    const observation = container.getIntrospection();
    assert.equal(observation.explanation.resolutions[0].effective.addressKind, 'teq');
    assert.equal(observation.explanation.resolutions[0].effective.lifestyle, 'S');
    assert.deepEqual(observation.explanation.resolutions[0].effective.wrappers, []);

    const artifact = await fs.readFile(path.join(rootDir, 'dist', 'esm.js'), 'utf8');
    assert.doesNotMatch(artifact, /PromiseSafe/);
    assert.doesNotMatch(artifact, /class Resolver/);
    assert.doesNotMatch(artifact, /class Pipeline/);
});
