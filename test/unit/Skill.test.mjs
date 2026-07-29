import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const skillDir = path.join(rootDir, 'skills', 'teqfw-di');
const skillPath = path.join(skillDir, 'SKILL.md');

test('publishes the teqfw-di Agent Skill contract', () => {
    assert.equal(path.basename(skillDir), 'teqfw-di');
    assert.ok(fs.existsSync(skillPath), 'SKILL.md must exist.');
    assert.ok(fs.existsSync(path.join(skillDir, 'agents', 'openai.yaml')), 'UI metadata must exist.');

    const skill = fs.readFileSync(skillPath, 'utf8');
    assert.match(skill, /^---\s*\n[\s\S]*?^name:\s*teqfw-di\s*$/m, 'frontmatter must declare name: teqfw-di.');
    assert.match(skill, /^description:\s*>?\s*\n?\s*\S/m, 'frontmatter must declare a non-empty description.');

    const references = [...skill.matchAll(/references\/([a-z0-9.-]+)/g)].map((match) => match[1]);
    assert.ok(references.length > 0, 'SKILL.md must name reference files.');
    for (const reference of references) {
        assert.ok(fs.existsSync(path.join(skillDir, 'references', reference)), `Missing skill reference: ${reference}`);
    }

    const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
    assert.ok(manifest.teqfw.fw.ai.skills.includes('./skills/teqfw-di'));
    assert.ok(fs.statSync(skillDir).isDirectory(), 'Declared skill directory must exist.');
});
