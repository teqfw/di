# @teqfw/di

Dependency Injection container prototype (common for browsers &amp; nodejs) as example for publication on [habr.com](https://habr.com/ru/post/464347/).

## Usage

```
$ npm install @teqfw/di
```

Code is common both for nodejs & browser:
```js
import Container from "./src/Container.mjs";

// create new container and configure it
const container = new Container();
// sources mapping is related to "./src/Container" script
container.addSourceMapping("Vendor_Module", "../example");
// get object by ID from container
container.get("Vendor_Module_App")
    .then(/** @type {Vendor_Module_App} app */(app) => {
        app.run();
    });
```

Start `main.js` on server side:
```
$ nodejs --experimental-modules ./main.mjs
```

Place this module to virtual server then open `./example.html` in browser.

Expected output on server/browser console:
```
Create object with ID 'Vendor_Module_App'.
Create object with ID 'Vendor_Module_Config'.
There is no dependency with id 'Vendor_Module_Config' yet.
'Vendor_Module_Config' instance is created.
Create object with ID 'Vendor_Module_Service'.
There is no dependency with id 'Vendor_Module_Service' yet.
'Vendor_Module_Service' instance is created (deps: [Vendor_Module_Config]).
'Vendor_Module_App' instance is created (deps: [Vendor_Module_Config, Vendor_Module_Service]).
Application 'Vendor_Module_Config' is running.
```