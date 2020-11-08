# Dependencies Identifiers

## Regexp

```ecmascript 6
const REG_EXP_OBJECT_ID = /^(([a-z])[A-Za-z0-9_]*)$/;
const REG_EXP_MODULE_ID = /^((([A-Z])[A-Za-z0-9_]*)(\${1,2})?)$/;
```


## Possible values

```ecmascript 6
dbConnection                // to get singleton object by name
Vendor_Proect_Module        // to get whole module
Vendor_Proect_Module$       // to get new object from default export (function or class result)
Vendor_Proect_Module$$      // to get singleton for default export
```

## Named singletons

Identifier should start with a lowercase letter and should not contain `$`:
```ecmascript 6
dbConnection
dbConnectionMain
db_connection_main
```


## Module

Identifier should start with an uppercase letter and should not contain `$`:
```ecmascript 6
Module
Vendor_Project_Module
```


## New object from default export

Identifier should start with an uppercase letter and should end with `$`:
```ecmascript 6
ModuleDefault$
Vendor_Project_Module$
```


## Singleton object from default export

Identifier should start with an uppercase letter and should end with `$$`:
```ecmascript 6
ModuleDefault$$
Vendor_Project_Module$$
```
