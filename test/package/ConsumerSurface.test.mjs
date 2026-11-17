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
    assert.deepEqual([...manifest.keywords].sort(), [
        'dependency identifiers',
        'dependency injection',
        'dependency resolution',
        'es modules',
        'esm',
        'javascript',
        'late binding',
        'namespace',
        'runtime linking',
        'teqfw',
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
    assert.deepEqual([...manifest.files].sort(), [
        'CHANGELOG.md',
        'LICENSE',
        'README.md',
        'dist/',
        'jsconfig.json',
        'skills/',
        'src/',
        'types.d.ts',
    ]);
    assert.deepEqual(Object.keys(manifest.exports), [
        '.',
        './node/registry/namespace',
        './node/registry/package',
    ]);
    assert.deepEqual(manifest.exports['.'].browser, {
        import: './dist/esm.js',
        require: './dist/umd.js',
    });
    assert.equal(manifest.engines.node, '>=20');
    assert.deepEqual(manifest.teqfw.fw.di.namespaces, [{
        prefix: 'TeqFw_Di_',
        path: './src',
        ext: '.mjs',
    }]);
    assert.equal(manifest.teqfw.platform, undefined);

    const {default: Container} = await import('@teqfw/di');
    const {default: PackageRegistry} = await import('@teqfw/di/node/registry/package');
    const {default: NamespaceRegistry} = await import('@teqfw/di/node/registry/namespace');

    assert.equal(typeof Container, 'function');
    assert.equal(typeof PackageRegistry, 'function');
    assert.equal(typeof NamespaceRegistry, 'function');
    const unexportedPath = '@teqfw/di/' + 'src/Parser.mjs';
    await assert.rejects(import(unexportedPath), {code: 'ERR_PACKAGE_PATH_NOT_EXPORTED'});
    const removedRegistryPath = '@teqfw/di/' + 'src/Config/NamespaceRegistry.mjs';
    await assert.rejects(import(removedRegistryPath), {code: 'ERR_PACKAGE_PATH_NOT_EXPORTED'});
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
