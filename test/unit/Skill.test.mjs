import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const skillDir = path.join(rootDir, 'skills', 'teqfw-di');
const skillPath = path.join(skillDir, 'SKILL.md');
const legacyAiPath = path.join(rootDir, 'ai', 'AGENTS.md');

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
        'before its first',
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
        assert.doesNotMatch(fs.readFileSync(referencePath, 'utf8'), /(^|[^a-z])ctx\//);
    }

    const compatibility = fs.readFileSync(path.join(skillDir, 'references', 'compatibility.md'), 'utf8');
    assert.match(compatibility, /2027-01-28/);
    assert.match(compatibility, /2026-10-30/);
    assert.match(compatibility, /approved breaking release/);

    const usage = fs.readFileSync(path.join(skillDir, 'references', 'usage.md'), 'utf8');
    assert.match(usage, /node:fs\/promises/);
    assert.match(usage, /absolute application root/);

    const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
    assert.ok(manifest.teqfw.fw.ai.skills.includes('./skills/teqfw-di'));

    const packed = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--json'], {
        cwd: rootDir,
        encoding: 'utf8',
    }));
    const packedFiles = new Set(packed[0].files.map((entry) => entry.path));
    for (const requiredPath of [
        'skills/teqfw-di/SKILL.md',
        'skills/teqfw-di/references/compatibility.md',
        'skills/teqfw-di/references/distribution.md',
        'ai/AGENTS.md',
    ]) {
        assert.ok(packedFiles.has(requiredPath), 'Published package must contain ' + requiredPath + '.');
    }

    const legacyAi = fs.readFileSync(legacyAiPath, 'utf8');
    assert.match(legacyAi, /legacy/i);
    assert.match(legacyAi, /\.\.\/skills\/teqfw-di\/SKILL\.md/);
});
