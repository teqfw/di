import {dirname, join} from 'node:path';
import Container from '@teqfw/di';

// Create the objects container
/** @type {TeqFw_Di_Api_Container} */
const container = new Container();

// Add path mapping for the sources (app itself and used library)
const root = dirname(import.meta.url);
const pathApp = join(root, 'node_modules', '@flancer64', 'demo-di-app', 'src');
const pathLib = join(root, 'node_modules', '@flancer64', 'demo-di-lib', 'src');
const resolver = container.getResolver();
resolver.addNamespaceRoot('App_', pathApp);
resolver.addNamespaceRoot('Sample_Lib_', pathLib);

// Compose the application and run it
const app = await container.get('App_Main$');
app('Hello from the Node.js!');