# Namespaces

Browser application consists of separate files that being loaded into browser from different resources. All files form one space in the browser, so we need an opportunity to address each source file (ES6 module) in this space and each exported feature in these files. We need namespaces. We have the same situation with nodejs apps - _one space_ is placed in `./node_modules/` folder (and in source folders of the app itself).

## Sources addressing in application

There is different absolute addressing for source files in nodejs & browsers. 

### node

```
/prj/name/node_modules/@vendor/package/src/path/to/module.js
C:\prj\name\node_modules\@vendor\package\src\path\to\module.js
```

### browser

```
https://prj.com/lib/@vendor/package/src/path/to/module.js
```


## Packages

_npm_ packages are the standard way to manage huge code base in nodejs apps. So, it is a good idea to separate full address to the source module on 2 parts:
* path to a package
* path to a module inside package


## Mapping

We can use logical addressing of the sources in our code (`packageAddress`:`moduleInsidePackageAddress`) and use mapping of logical address to real address according to used environment (browser or node).
 
First of all, we need map `packageAddress` part to the real roots (browser & node) of the package sources. Let our sources be in `./src/` folder in `@vendor/package` package and `packageAddress`=`@vendor/package`. Mapping for a browser & nodejs:
```
@vendor/package => https://prj.com/lib/@vendor/package/src
@vendor/package => /prj/name/node_modules/@vendor/package/src
```

All our source files should have the same extension - `*.js` (standard) or `*.mjs` (ES6 modules). We can use a relative path to the source file under package source's root without extension (the same form both for browser & nodejs):
```
moduleInsidePackageAddress => path/to/module
```

So, our logical address can be like: 
```
@vendor/package!path/to/module
```
We can use any character from `~)('!*` set to separate '_package_' and '_module_' [parts](https://www.npmjs.com/package/validate-npm-package-name). I use `!`.
 
Mapping for a browser & nodejs (paths are absolute but can be relative):
```ecmascript 6
const node = {
    '@vendor/package': {path: '/prj/app/node_modules/@vendor/package/src', ext: 'js'},
};
const browser = {
    '@vendor/package': {path: 'https://app.org/lib/@vendor/package/src', ext: 'js'},
};
```

Now we can resolve logical address `@vendor/package!path/to/module` to real addresses using mapping:
* `/prj/app/node_modules/@vendor/package/src/path/to/module.js`
* `https://app.org/lib/@vendor/package/src/path/to/module.js`



## Exports addressing

Let's have these exports in the module `@vendor/package!path/to/module`:
```ecmascript 6
export function fn() {}
export class SomeClass{}
export default {name: 'default export'};
```

We can address each export using `#` (like in URLs):
* `@vendor/package!path/to/module#fn`
* `@vendor/package!path/to/module#SomeClass`
* `@vendor/package!path/to/module#default` (or `@vendor/package!path/to/module#`)


## Logical Namespaces 

Let's add some conditions to the naming of files and folders in our code:
> all names for source folders and files should start from the capital letter (`A-Z`) and should consist from `A-Za-z0-1` characters only.

We can transform:
* package `@vendor/package` to `VendorPackage` or `Vendor_Package`
* module `Path/To/Module` to `Path_To_Module`
* logical address `@vendor/package!path/to/module` to `Vendor_Package_Path_To_Module`.

Now we have the same namespaces as Zend 1 has ([old style](https://framework.zend.com/manual/2.4/en/migration/namespacing-old-classes.html)).

Mapping:
```ecmascript 6
const container = new Container();
container.addSourceMapping('Vendor_Package', 'https://app.org/lib/@vendor/package/src');
const mod = container.get('Vendor_Package_Path_To_Module');
```


## Dependency injection

We can automatically create new objects on import and store it inside container as singletons or create new instances on every call. Let's mark this cases with `$` trailing character:
* `Vendor_Package_Path_To_Module$` - import module, create a new object from default export and store it as singleton in container;
* `Vendor_Package_Path_To_Module$$` - import module and create a new object from default export for every call; 


Create a new instance of `@vendor/package!Path/To/Module#default` that depends on singleton `@vendor/package!Path/To/Main#default`:
```ecmascript 6
export default class Main {
    constructor(spec) {
        const mod = spec.Vendor_Package_Path_To_Module$;
    }
}
// ...
const main = container.get('Vendor_Package_Path_To_Main$$');
```
