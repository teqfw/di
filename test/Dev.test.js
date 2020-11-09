import Container from '../src/Container';
import {describe, it} from 'mocha';
import assert from 'assert';

describe('TeqFw_Di_Container', function () {
    /** @type {TeqFw_Di_Container} */
    const container = new Container();
    container.addSourceMapping('Vendor', __dirname + '/.data/dev001', true);

    it('has right classname', async () => {
        assert.strictEqual(container.constructor.name, 'TeqFw_Di_Container');
    });
    it('loads module', async () => {
        const module = await container.get('Vendor_Module');
        assert(typeof module.sayHi === 'function');
    });
    it('creates new object from default export', async () => {
        const obj = await container.get('Vendor_DefaultExport$');
        assert(typeof obj === 'object');
    });

});
