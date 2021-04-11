/**
 * Structure to store parsing results of identifiers for imports and injects:
 *
 * Manually inserted into dependency injection container:
 *  - 'namedSingleton': singleton object stored in container (dependency injection);
 *  - 'namedFactory$$': create new object using stored factory (dependency injection);
 *
 * Filepath based identifiers for dynamic imports and dependency injection:
 *  - '@vendor/package!module': load and get ES module using Filepath Namespaces (dynamic import);
 *  - '@vendor/package!module#': load ES module and get default export (dynamic import);
 *  - '@vendor/package!module$': load ES module, create new object from default export and use as singleton;
 *  - '@vendor/package!module$$': load ES module and use default export as factory for new objects;
 *  - '@vendor/package!module#export': load ES module and get named export;
 *  - '@vendor/package!module#export$': load ES module, create new object from named export and use as singleton;
 *  - '@vendor/package!module#export$$': load ES module and use named export as factory for new objects;

 * Logical namespaces identifiers for dependency injection and dynamic imports:
 *  - 'Ns_Module': load and get ES module using Logical Namespaces (dynamic import);
 *  - 'Ns_Module#': load ES module and get default export (dynamic import);
 *  - 'Ns_Module$': load ES module, create new object from default export and use as singleton;
 *  - 'Ns_Module$$': load ES module and use default export as factory for new objects;
 *  - 'Ns_Module#export': load ES module and get named export;
 *  - 'Ns_Module#export$': load ES module, create new object from named export and use as singleton;
 *  - 'Ns_Module#export$$': load ES module and use named export as factory for new objects;
 *
 *  @see https://github.com/teqfw/di/blob/master/docs/identifiers.md
 */

// MODULE'S CLASSES
/**
 * Structure to store parsing results of identifiers for imports and injects.
 */
class TeqFw_Di_Api_ParsedId {
    /**
     * Key to map object in container's store (singletons, constructors, modules) - original id w/o '$' chars.
     * @type {String}
     */
    mapKey;
    /**
     * Name of an export in the ES6-module (export default fn() {}).
     * @type {String}
     */
    nameExport;
    /**
     * Module name: 'module', 'Ns_Module'.
     * @type {String}
     */
    nameModule;
    /**
     * Package name: '@vendor/package'.
     * @type {String}
     */
    namePackage;
    /**
     * Original identifier: namedSingleton, namedConstructor$$, @vendor/package!module#export$$, Ns_Module#export$$.
     * @type {String}
     */
    orig;
    /**
     * type of ID (manual, filepath based, logical namespace; see TYPE_ID_...).
     * @type {symbol}
     */
    typeId;
    /**
     * Type of target object identified by ID (package, module, export, factory, singleton).
     * @type {symbol}
     */
    typeTarget;
}

// ES2015 (ES6) 'static' is not compatible with Safari, so add as class props
/**  @type {symbol} marker for filepath based IDs (@vendor/package!module#exportName$$) */
TeqFw_Di_Api_ParsedId.TYPE_ID_FILEPATH = Symbol('TYPE_ID_FILEPATH');
/**  @type {symbol} marker for logical namespace IDs (Ns_Module#exportName$$) */
TeqFw_Di_Api_ParsedId.TYPE_ID_LOGICAL = Symbol('TYPE_ID_LOGICAL');
/**  @type {symbol} marker for IDs for manually inserted objects into DI container (singleton, factory$$) */
TeqFw_Di_Api_ParsedId.TYPE_ID_MANUAL = Symbol('TYPE_ID_MANUAL');
/**  @type {symbol} marker for export targets (@vendor/package!module#exportName) */
TeqFw_Di_Api_ParsedId.TYPE_TARGET_EXPORT = Symbol('TYPE_TARGET_EXPORT');
/**  @type {symbol} marker for factory targets (@vendor/package!module#exportName$$) */
TeqFw_Di_Api_ParsedId.TYPE_TARGET_FACTORY = Symbol('TYPE_TARGET_FACTORY');
/**  @type {symbol} marker for module targets (@vendor/package!module) */
TeqFw_Di_Api_ParsedId.TYPE_TARGET_MODULE = Symbol('TYPE_TARGET_MODULE');
/**  @type {symbol} marker for package targets (@vendor/package! - RESERVED, NOT USED) */
TeqFw_Di_Api_ParsedId.TYPE_TARGET_PACKAGE = Symbol('TYPE_TARGET_PACKAGE');
/**  @type {symbol} marker for singleton targets (@vendor/package!module#exportName$) */
TeqFw_Di_Api_ParsedId.TYPE_TARGET_SINGLETON = Symbol('TYPE_TARGET_SINGLETON');

// MODULE'S EXPORT
export {
    TeqFw_Di_Api_ParsedId as default
}
