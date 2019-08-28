# @teqfw/di

Dependency Injection container based on ES6 modules (works for browsers &amp; nodejs).

Proxy object for `constructor` specification is inspired by [awilix](https://github.com/jeffijoe/awilix).



## Usage
Main object (`./path/to/app/sources/App.mjs`):
```ecmascript 6
export default class Sample_App {
    constructor({Sample_App_Config}) {
        this.cfg = Sample_App_Config;
        this.run = function () {}
    }
}
```
Dependency (`./path/to/app/sources/App/Config.mjs`):
```ecmascript 6
export default class Sample_App_Config {
    constructor() {}
}
```

Load container, setup namespace mapping, get object: 
```ecmascript 6
import Container from "./path/to/Container.mjs";
const container = new Container();
// map sources relatively to this script
container.addSourceMapping("Sample", "./path/to/app/sources");
container.get("Sample_App").then(app => app.run());
```



## Modules
`@teqfw/di` works with ES6 modules [that have](./docs/export_default.md) `export default` defined.
```ecmascript 6
export default class ClassName{}
```



## `spec` argument for constructor
Dependencies for functions and classes should be defined as properties of the [`spec` object](./docs/spec_proxy.md) of the `constructor`:
```ecmascript 6
export default function main_obj(spec) {
    const dep1 = spec.dep1;
    const dep2 = spec.dep2;
    const dep3 = spec.dep3;
}
```
`spec` object may be directly unfolded in `constructor`:
```ecmascript 6
export default class MainObj {
    constructor({dep1, dep2, dep3}) {}
}
```


## "Name to source" mapping
Each class or function should be placed in separate file ( [ESM](https://nodejs.org/api/esm.html)) and should be `export default`. ES modules can be grouped in folders inside one `npm` module:
- ./npm_module/
  - ./src/
    - ./App/
      - ./Service/
        - ./Download.mjs
        - ./Upload.mjs
      - ./Config.mjs
    - ./App.mjs

These names can be mapped to the structure above using [Zend1](https://framework.zend.com/manual/2.4/en/migration/namespacing-old-classes.html#namespacing-old-classes) approach:
- **App** => ./npm_module/src/App.mjs
- **App_Config** => ./npm_module/src/App/Config.mjs 
- **App_Service_Download** => ./npm_module/src/App/Service/Download.mjs
- **App_Service_Upload** => ./npm_module/src/App/Service/Upload.mjs



## Namespaces roots
We can use namespaces to group all ESM objects (functions and classes) across `npm` modules:
* **Vendor_Project_App** => ./node_modules/@vendor/project/src/App.mjs
* **Vendor_Service_Download** => ./node_modules/@vendor/services/src/Download.mjs

Namespaces roots can be mapped to filesystem:
```ecmascript 6
container.addSourceMapping("Vendor_Project", "./node_modules/@vendor/project/src");
container.addSourceMapping("Vendor_Service", "./node_modules/@vendor/services/src");
```



## Absolute and related mapping
```ecmascript 6
const is_absolute = true;
container.addSourceMapping("Vendor_Project", "/pub/node_modules/@vendor/project/src", is_absolute);
container.addSourceMapping("Vendor_Service", "./node_modules/@vendor/services/src", !is_absolute);
```



## Dependency identifier
`@teqfw/di` container can handle 3 types of dependencies for ES-module `Vendor_Project_Module_Object`:
- `Vendor_Project_Module_Object` (new instance): new object will be created for this type of dependency on every call;
- `Vendor_Project_Module_Object$` (default instance): one instance will be created on the first call, will be saved into the container and will be used on all subsequent calls later; 
- `Vendor_Project_Module_Object$name` (named instance): one instance will be created on the first call, will be saved into the container with `name` and will be used on all subsequent calls for this `name` later;

```ecmascript 6
export default class MainObj {
    constructor(spec) {
        const new_handler = spec.Vendor_Module_Handler_Update;
        const default_cfg = spec.Vendor_Module_Config$;
        const db_maria = spec.Vendor_Module_Connector$maria;
        const db_postgres = spec.Vendor_Module_Connector$pg;
    }
}
``` 



## `nodejs` start
```ecmascript 6
import Container from "@teqfw/di";
const container = new Container();
container.addSourceMapping("Sample", "./path/to/src");
container.get("Sample_App").then(app => app.run());
```



## Browser start
Include main script as ES module to the page (see `type="module"`):
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <script type="module" src="./main.mjs"></script>
</head>
</html>
```

`main.mjs`:
```ecmascript 6
import Container from "./path/to/Container.mjs";
const container = new Container();
container.addSourceMapping("Sample", "./path/to/src");
container.get("Sample_App").then(app => app.run());
```



## Example

[Simple application](./example/s001/)

### Use as `nodejs` app:
```
$ node --experimental-modules ./example/s001/s001.mjs
// or
$ npm run-script example
```

### Use from browser
Place this module under web server then open page http://.../example/s001/s001.html

### Expected output to console
```
'Sample_App_Config' instance is created.
'Sample_App_Service' instance is created.
'Sample_App_HandlerA' instance is created.
'Sample_App_Service' instance is created.
'Sample_App_HandlerB' instance is created.
Application 'Sample_App' is running (deps: [Sample_App_Config, Sample_App_HandlerA, Sample_App_HandlerB]).
Service running with 'Sample_App_HandlerA' param.
Service running with 'Sample_App_HandlerB' param.
```



## Installation

```
$ npm i @teqfw/di
```