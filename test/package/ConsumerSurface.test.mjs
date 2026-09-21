import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));

test('declares the supported package metadata and export surface', async () => {
    assert.equal(manifest.name, '@teqfw/di');
    assert.equal(manifest.description, 'Deterministic dependency-resolution container for native JavaScript ES modules.');
    assert.deepEqual(manifest.keywords, [
        'teqfw',
        'javascript',
        'esm',
        'es modules',
        'runtime linking',
        'dependency injection',
        'dependency resolution',
        'dependency identifiers',
        'namespace',
        'late binding',
    ]);
    assert.deepEqual(manifest.authors, [{
        name: 'Alex Gusev',
        email: 'alex@flancer64.com',
        url: 'https://github.com/flancer64',
    }]);
    assert.equal(manifest.author, undefined);
    assert.equal(manifest.license, 'Apache-2.0');
    assert.equal(manifest.type, 'module');
    assert.equal(manifest.types, 'types.d.ts');
    assert.deepEqual(manifest.files, [
        'skills/',
        'dist/',
        'src/',
        'CHANGELOG.md',
        'jsconfig.json',
        'LICENSE',
        'README.md',
        'types.d.ts',
    ]);
    assert.deepEqual(Object.keys(manifest.exports), [
        '.',
        './node/registry/namespace',
        './node/registry/package',
        './src/Config/NamespaceRegistry.mjs',
    ]);
    assert.equal(manifest.engines.node, '>=20');
    assert.deepEqual(manifest.teqfw.fw.di.namespaces, [{
        prefix: 'TeqFw_Di_',
        path: './src',
        ext: '.mjs',
    }]);
    assert.deepEqual(manifest.teqfw.platform.unitTests.exclusions, [{
        path: 'src/Config/NamespaceRegistry.mjs',
        reason: 'Deprecated compatibility re-export with no component behavior.',
    }]);

    const {default: Container} = await import('@teqfw/di');
    const {default: PackageRegistry} = await import('@teqfw/di/node/registry/package');
    const {default: NamespaceRegistry} = await import('@teqfw/di/node/registry/namespace');
    const {default: DeprecatedNamespaceRegistry} = await import('@teqfw/di/src/Config/NamespaceRegistry.mjs');

    assert.equal(typeof Container, 'function');
    assert.equal(typeof PackageRegistry, 'function');
    assert.equal(typeof NamespaceRegistry, 'function');
    assert.equal(DeprecatedNamespaceRegistry, NamespaceRegistry);
    const unexportedPath = '@teqfw/di/' + 'src/Parser.mjs';
    await assert.rejects(import(unexportedPath), {code: 'ERR_PACKAGE_PATH_NOT_EXPORTED'});
});

test('keeps every publication allowlist entry available to npm', () => {
    for (const required of [
        'README.md',
        'CHANGELOG.md',
        'LICENSE',
        'jsconfig.json',
        'types.d.ts',
        'dist',
        'src',
        'skills',
    ]) {
        assert.ok(fs.existsSync(path.join(rootDir, required)), 'Package is missing ' + required + '.');
    }

    const sourceIgnore = fs.readFileSync(path.join(rootDir, 'src', '.npmignore'), 'utf8');
    assert.match(sourceIgnore, /^AGENTS\.md$/m);
});
