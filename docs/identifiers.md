# DI Identifiers

## Regexp

```ecmascript 6
/** @type {RegExp} expression for objects that manually added to DI container (singleton, namedFactory$$)  */
const MANUAL_DI_ID = /^((([a-z])[A-Za-z0-9_]*)(\$\$)?)$/;
/** @type {RegExp} expression for filepath based IDs (@vendor/package!module#export$$) */
const FILEPATH_ID = /^(((([a-z@])([A-Za-z0-9_\-/@]*))!([A-Za-z0-9_\-/@]*)?)((#)?([A-Za-z0-9_]*)(\${1,2})?)?)$/;
/** @type {RegExp} expression for logical namespace IDs (Ns_Module#export$$) */
const LOGICAL_NS_ID = /^((([A-Z])[A-Za-z0-9_]*)(#?([A-Za-z0-9_]*)(\${1,2})?)?)$/;
```


## Manual DI

ID for dependencies being manually added to the container:
```
dbConnection                // singleton
dbTransaction$$             // factory to create new obects
```


## Filepath based

ID for dynamic imports based on file paths:
```
package!path/to/module              // import ES6 module 'path/to/module' from 'package'
@vendor/package!path/to/module      // import ES6 module 'path/to/module' from '@vendor/package'
@vendor/package!module#             // get default export from 'path/to/module' of '@vendor/package'
@vendor/package!module#fnName       // get export with name 'fnName' from 'path/to/module' of '@vendor/package'
```

ID for dependency injection based on file paths:
```
@vendor/package!module$             // get singleton object created with default export
@vendor/package!module$$            // get new object created with default export
@vendor/package!module#fnName$      // get singleton object created with 'fnName' export
@vendor/package!module#fnName$$     // get new object created with 'fnName' export
```



## Logical namespaces

ID for dynamic imports based:
```
Ns_App_Module              // import ES6 module from logical namespace
Ns_App_Module#             // get default export for ES6 module
Ns_App_Module#fnName       // get export with name 'fnName' for ES6 module
```

ID for dependency injection:
```
Ns_App_Module$             // get singleton object created with default export
Ns_App_Module$$            // get new object created with default export
Ns_App_Module#fnName$      // get singleton object created with 'fnName' export
Ns_App_Module#fnName$$     // get new object created with 'fnName' export
```
