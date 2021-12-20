import assert from 'assert';
import {describe, it} from 'mocha';
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';
import Container from '../../../../../src/Shared/Container.mjs';
import {isClass} from '../../../../lib/util.mjs';

// compose paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PRJ_ROOT = join(__dirname, '../../../../../');

// setup DI
const container = new Container();
container.addSourceMapping('TeqFw_Di', join(PRJ_ROOT, 'src'), true, 'mjs');

/** @type {typeof TeqFw_Di_Back_Api_Dto_Plugin_Desc} */
const {default: Desc, Factory} = await container.get('TeqFw_Di_Back_Api_Dto_Plugin_Desc');
/** @type {TeqFw_Di_Back_Api_Dto_Plugin_Desc.Factory} */
const factory = await container.get('TeqFw_Di_Back_Api_Dto_Plugin_Desc.Factory$');

describe('TeqFw_Di_Back_Api_Dto_Plugin_Desc', () => {

    it('has right export', async () => {
        assert(isClass(Desc));
        assert(isClass(Factory));
    });

    describe('Factory parses objects', () => {

        it('simple', async () => {
            const data = {
                autoload: {
                    ns: 'Vnd_Plugin',
                    path: './src'
                },
                replace: {
                    ['Api_Name']: 'Impl_Name'
                }
            };
            /** @type {TeqFw_Di_Back_Api_Dto_Plugin_Desc} */
            const res = factory.create(data);
            assert(res.autoload.ns === 'Vnd_Plugin');
            assert(res.autoload.path === './src');
            assert(res.autoload.ext === 'mjs');
            assert(res.autoload.isAbsolute === false);
            assert(res.replace['Api_Name'] === 'Impl_Name');
        });

        it('replace with areas', async () => {
            const data = {
                replace: {
                    ['Api_Name']: {
                        back: 'Back_Impl',
                        front: 'Front_Impl'
                    }
                }
            };
            /** @type {TeqFw_Di_Back_Api_Dto_Plugin_Desc} */
            const res = factory.create(data);
            assert(res.replace['Api_Name']['back'] === 'Back_Impl');
            assert(res.replace['Api_Name']['front'] === 'Front_Impl');
        });

    });

});
