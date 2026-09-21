import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const skillDir = path.join(rootDir, 'skills', 'teqfw-di');
const skillPath = path.join(skillDir, 'SKILL.md');

test('publishes the teqfw-di Agent Skill consumer contract', () => {
    assert.equal(path.basename(skillDir), 'teqfw-di');
    assert.ok(fs.existsSync(skillPath), 'SKILL.md must exist.');
    assert.ok(fs.existsSync(path.join(skillDir, 'agents', 'openai.yaml')), 'UI metadata must exist.');

    const skill = fs.readFileSync(skillPath, 'utf8');
    assert.match(skill, /^---\s*\n[\s\S]*?^name:\s*teqfw-di\s*$/m);
    assert.match(skill, /^description:\s*>?\s*\n?\s*\S/m);

    for (const requiredText of [
        '@teqfw/di/node/registry/namespace',
        '@teqfw/di/node/registry/package',
        'one public get(root Dependency Identifier)',
        'a later `get()`',
        'Dependency Identifiers',
        '@teqfw/di/src/Config/NamespaceRegistry.mjs',
        'references/compatibility.md',
        'references/distribution.md',
    ]) {
        assert.ok(skill.includes(requiredText), 'Skill must state ' + requiredText + '.');
    }

    const references = [...skill.matchAll(/references\/([a-z0-9.-]+)/g)].map((match) => match[1]);
    assert.ok(references.length > 0, 'SKILL.md must name reference files.');
    for (const reference of new Set(references)) {
        const referencePath = path.join(skillDir, 'references', reference);
        assert.ok(fs.existsSync(referencePath), 'Missing skill reference: ' + reference);
        const content = fs.readFileSync(referencePath, 'utf8');
        assert.doesNotMatch(content, /(?:^|[(/`])(?:\.\.\/)*(?:ctx|test|tmp)\//m);
    }

    const compatibility = fs.readFileSync(path.join(skillDir, 'references', 'compatibility.md'), 'utf8');
    assert.match(compatibility, /2027-01-28/);
    assert.match(compatibility, /approved breaking release/);

    const usage = fs.readFileSync(path.join(skillDir, 'references', 'usage.md'), 'utf8');
    assert.match(usage, /absolute\s+application root/);

    const allConsumerDocumentation = [
        fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8'),
        ...[...fs.readdirSync(path.join(skillDir, 'references'))]
            .filter((file) => file.endsWith('.md'))
            .map((file) => fs.readFileSync(path.join(skillDir, 'references', file), 'utf8')),
        skill,
    ].join('\n');
    assert.doesNotMatch(allConsumerDocumentation, /\bmodule token\b/i);
    assert.doesNotMatch(allConsumerDocumentation, /\bdependency specifier\b/i);
    assert.doesNotMatch(allConsumerDocumentation, /\bruntime linker\b/i);
    assert.doesNotMatch(allConsumerDocumentation, /DepId DTO/);

    const readme = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8');
    for (const requiredText of [
        'const app = await container.get("App$");',
        'exactly one public root `get()`',
        '__deps__',
        'node:fs',
        'npm:@scope/package',
        '`teq:` is not a supported serialized',
        '`$$$` explicitly',
        'enableIntrospection()',
        'getIntrospection()',
    ]) {
        assert.ok(readme.includes(requiredText), 'README must state ' + requiredText + '.');
    }

    const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
    assert.ok(manifest.files.includes('skills/'), 'Published package must include skills/.');
});
