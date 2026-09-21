import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Container_ModuleRouter from '../../../src/Container/ModuleRouter.mjs';
import {Factory as DepIdFactory} from '../../../src/Dto/DepId.mjs';
import {Factory as ConfigFactory} from '../../../src/Dto/ModuleRouter/Config.mjs';
import TeqFw_Di_Enum_AddressKind from '../../../src/Enum/AddressKind.mjs';
import TeqFw_Di_Enum_Lifestyle from '../../../src/Enum/Lifestyle.mjs';

const depIdFactory = new DepIdFactory();
const configFactory = new ConfigFactory();

function depId(patch = {}) {
    return depIdFactory.create({
        addressKind: TeqFw_Di_Enum_AddressKind.TEQ,
        address: 'Ns_Group_Web_Service',
        lifestyle: TeqFw_Di_Enum_Lifestyle.DIRECT,
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
            specifier: '/web/Service.mjs',
            mapping: {prefix: 'Ns_Group_Web_', target: '/web', defaultExt: '.mjs'},
        });
        assert.deepEqual(router.route(depId({addressKind: TeqFw_Di_Enum_AddressKind.NODE, address: 'fs'})), {
            specifier: 'node:fs',
        });
    });
});
