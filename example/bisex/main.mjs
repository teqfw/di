/**
 * This script can be used from a browser:
 *
 *  <script type="module" src="./main.mjs"></script>
 *
 * or from Node.js:
 *
 *  node --experimental-modules ./main.mjs
 */
// load DI container sources (use relative path both for front & back)
import Container from '../../src/Container.js';

// create new container and configure it
/** @type {TeqFw_Di_Container} */
const container = new Container();
container.setDebug(false);
// define the path to the sources to import with DI container: './src/'
const url = import.meta.url;
const path = url.replace('main.mjs', 'src');
container.getResolver().addNamespaceRoot('Sample_', path);
// get an object by ID from the container, then run it
container.get('Sample_App$')
    .then(app => app.run())
    .catch(console.error);
