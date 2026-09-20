import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Container_ModuleRouter from '../../../src/Container/ModuleRouter.mjs';
import {Factory as DepIdFactory} from '../../../src/Dto/DepId.mjs';
import {Factory as ConfigFactory} from '../../../src/Dto/Resolver/Config.mjs';
import TeqFw_Di_Enum_Platform from '../../../src/Enum/Platform.mjs';

const depIdFactory = new DepIdFactory();
const configFactory = new ConfigFactory();

function depId(patch = {}) {
    return depIdFactory.create({
        moduleName: 'Ns_Group_Web_Service',
        platform: TeqFw_Di_Enum_Platform.TEQ,
        ...patch,
    });
}

describe('TeqFw_Di_Container_ModuleRouter', () => {
    it('selects the longest Teq mapping without loading a module', () => {
        const router = new TeqFw_Di_Container_ModuleRouter({
            config: configFactory.create({
                namespaces: [
                    {prefix: 'Ns_Group_', target: '/group', defaultExt: '.mjs'},
                    {prefix: 'Ns_Group_Web_', target: '/web', defaultExt: '.mjs'},
                ],
            }),
        });

        assert.deepEqual(router.route(depId()), {
            key: 'teq::Ns_Group_Web_Service',
            specifier: '/web/Service.mjs',
            mapping: {prefix: 'Ns_Group_Web_', target: '/web', defaultExt: '.mjs'},
        });
        assert.deepEqual(router.route(depId({platform: TeqFw_Di_Enum_Platform.NODE, moduleName: 'fs'})), {
            key: 'node::fs',
            specifier: 'node:fs',
        });
    });
});
