# Dependency ID

`depIds` are used to bind objects at runtime. Generally, a `depId` should address the following points:

* Path to the ES6 module with the source code;
* Named or default export from the module;
* Type of the export: factory or a simple object;
* Lifetime type: singleton or transient;
* Wrappers to use for the result;
* Others (depending on the developer's imagination);

Base DTO for the `depId` see in [./Api/DepId](../src/DepId.js).

The exact structure of the `depId` depends on the conventions followed in the project, and as a result, on the parser,
mapper, module loader, and container used in the project.

## Basic Usage

By default, this container uses the following conventions (Zend1-like namespaces for modules):

* `Vendor_App_Package_Mod`: represents the whole module;
* `Vendor_App_Package_Mod.name`: represents an export from the module as-is;
* `Vendor_App_Package_Mod$` or `_Mod.name$`: represents using the default or named export as a Factory to create a
  singleton object;
* `Vendor_App_Package_Mod$$` or `_Mod.name$$`: represents using the default or named export as a Factory to create a new
  instance;
* `Vendor_App_Package_Mod.name$#adapter`: represents using a named export as a Factory to create a singleton object and
  wrap it with an adapter;

