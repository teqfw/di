/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src lazy recursive":
/*!*******************************************!*\
  !*** ./src/ lazy strict namespace object ***!
  \*******************************************/
/***/ ((module) => {

eval("function webpackEmptyAsyncContext(req) {\n\t// Here Promise.resolve().then() is used instead of new Promise() to prevent\n\t// uncaught exception popping up in devtools\n\treturn Promise.resolve().then(() => {\n\t\tvar e = new Error(\"Cannot find module '\" + req + \"'\");\n\t\te.code = 'MODULE_NOT_FOUND';\n\t\tthrow e;\n\t});\n}\nwebpackEmptyAsyncContext.keys = () => ([]);\nwebpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;\nwebpackEmptyAsyncContext.id = \"./src lazy recursive\";\nmodule.exports = webpackEmptyAsyncContext;\n\n//# sourceURL=webpack://@teqfw/di/./src/_lazy_strict_namespace_object?");

/***/ }),

/***/ "./index.mjs":
/*!*******************!*\
  !*** ./index.mjs ***!
  \*******************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _src_Container_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/Container.js */ \"./src/Container.js\");\n/**\n * Entry point to build web bundle (ES6 modules).\n */\n\n\nwindow.TeqFwDi = _src_Container_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"];\n\n\n//# sourceURL=webpack://@teqfw/di/./index.mjs?");

/***/ }),

/***/ "./src/Api/ObjectKey.js":
/*!******************************!*\
  !*** ./src/Api/ObjectKey.js ***!
  \******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ TeqFw_Di_Api_ObjectKey)\n/* harmony export */ });\n/**\n * This is a DTO that represents the structure of an ID for a runtime dependency.\n */\nclass TeqFw_Di_Api_ObjectKey {\n    /**\n     * The name of an export of the module.\n     * @type {string}\n     */\n    exportName;\n    /**\n     * Composition type (see Defs.COMPOSE_): use the export as Factory (F) or return as-is (A).\n     * @type {string}\n     */\n    composition;\n    /**\n     * Lifestyle type (see Defs.LIFE_): singleton (S) or instance (I).\n     * @type {string}\n     */\n    life;\n    /**\n     * The code for ES6 module that can be converted to the path to this es6 module.\n     * @type {string}\n     */\n    moduleName;\n    /**\n     * Object key value.\n     * @type {string}\n     */\n    value;\n    /**\n     * List of wrappers to decorate the result.\n     * @type {string[]}\n     */\n    wrappers = [];\n}\n\n//# sourceURL=webpack://@teqfw/di/./src/Api/ObjectKey.js?");

/***/ }),

/***/ "./src/Composer.js":
/*!*************************!*\
  !*** ./src/Composer.js ***!
  \*************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ TeqFw_Di_Composer)\n/* harmony export */ });\n/* harmony import */ var _Defs_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Defs.js */ \"./src/Defs.js\");\n/* harmony import */ var _SpecAnalyser_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./SpecAnalyser.js */ \"./src/SpecAnalyser.js\");\n/**\n *\n */\n\n\n\n// FUNCS\n\n// MAIN\nclass TeqFw_Di_Composer {\n\n    constructor() {\n        // VARS\n        let _debug = false;\n\n        // FUNCS\n        function log(msg) {\n            if (_debug) console.log(msg);\n        }\n\n        // INSTANCE METHODS\n\n        /**\n         *\n         * @param {TeqFw_Di_Api_ObjectKey} key\n         * @param {Object} module\n         * @param {string[]} stack array of the parent objects to prevent dependency loop\n         * @param {TeqFw_Di_Container} container\n         * @return {Promise<*>}\n         */\n        this.create = async function (key, module, stack, container) {\n            if (stack.includes(key.value))\n                throw new Error(`Circular dependency for '${key.value}'. Parents are: ${JSON.stringify(stack)}`);\n            if (key.exportName) {\n                // use export from the es6-module\n                const stackNew = [...stack, key.value];\n                const {[key.exportName]: exp} = module;\n                if (key.composition === _Defs_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].COMPOSE_FACTORY) {\n                    if (typeof exp === 'function') {\n                        // create deps for factory function\n                        const deps = (0,_SpecAnalyser_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(exp);\n                        if (deps.length) log(`Deps for object '${key.value}' are: ${JSON.stringify(deps)}`);\n                        const spec = {};\n                        for (const dep of deps)\n                            spec[dep] = await container.get(dep, stackNew);\n                        // create a new object with the factory function\n                        const res = (_Defs_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].isClass(exp)) ? new exp(spec) : exp(spec);\n                        if (res instanceof Promise)\n                            return await res;\n                        else\n                            return res;\n                    } else\n                        // just clone the export\n                        return Object.assign({}, exp);\n                } else\n                    return exp;\n            } else {\n                return module;\n            }\n        };\n\n        this.setDebug = function (data) {\n            _debug = data;\n        };\n\n        // MAIN\n    }\n};\n\n//# sourceURL=webpack://@teqfw/di/./src/Composer.js?");

/***/ }),

/***/ "./src/Container.js":
/*!**************************!*\
  !*** ./src/Container.js ***!
  \**************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ TeqFw_Di_Container)\n/* harmony export */ });\n/* harmony import */ var _Composer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Composer.js */ \"./src/Composer.js\");\n/* harmony import */ var _Defs_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Defs.js */ \"./src/Defs.js\");\n/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Parser.js */ \"./src/Parser.js\");\n/* harmony import */ var _PreProcessor_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./PreProcessor.js */ \"./src/PreProcessor.js\");\n/* harmony import */ var _PreProcessor_Replace_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./PreProcessor/Replace.js */ \"./src/PreProcessor/Replace.js\");\n/* harmony import */ var _Resolver_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Resolver.js */ \"./src/Resolver.js\");\n/**\n * The Object Container (composition root).\n */\n\n\n\n\n\n\n\n// VARS\n\n// FUNCS\n/**\n * ID to store singletons in the internal registry.\n * @param {TeqFw_Di_Api_ObjectKey} key\n * @return {string}\n */\nfunction getSingletonId(key) {\n    return `${key.moduleName}#${key.exportName}`;\n}\n\n// MAIN\nclass TeqFw_Di_Container {\n\n    constructor() {\n        // VARS\n        let _composer = new _Composer_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n        let _debug = false;\n        let _parser = new _Parser_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"]();\n        let _preProcessor = new _PreProcessor_js__WEBPACK_IMPORTED_MODULE_3__[\"default\"]();\n        _preProcessor.addHandler((0,_PreProcessor_Replace_js__WEBPACK_IMPORTED_MODULE_4__[\"default\"])()); // create new instance of the replacement handler\n\n        /**\n         * Registry for loaded es6 modules.\n         * @type {Object<string, Module>}\n         */\n        const _regModules = {};\n        /**\n         * Registry to store singletons.\n         * @type {Object<string, *>}\n         */\n        const _regSingles = {};\n        let _resolver = new _Resolver_js__WEBPACK_IMPORTED_MODULE_5__[\"default\"]();\n\n        // FUNCS\n        function error() {\n            console.error(...arguments);\n        }\n\n        function log() {\n            if (_debug) console.log(...arguments);\n        }\n\n\n        // INSTANCE METHODS\n\n        this.get = async function (objectKey, stack = []) {\n            log(`Object '${objectKey}' is requested.`);\n            // return container itself if requested\n            if (\n                (objectKey === _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].KEY_CONTAINER) ||\n                (objectKey === _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].KEY_CONTAINER_NS)\n            ) {\n                log(`Container itself is returned.`);\n                return _regSingles[_Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].KEY_CONTAINER];\n            }\n            // parse the `objectKey` and get the structured DTO\n            const parsed = _parser.parse(objectKey);\n            // modify original key according to some rules (replacements, etc.)\n            const key = _preProcessor.process(parsed);\n            // return existing singleton\n            if (key.life === _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].LIFE_SINGLETON) {\n                const singleId = getSingletonId(key);\n                if (_regSingles[singleId]) {\n                    log(`Existing singleton '${singleId}' is returned.`);\n                    return _regSingles[singleId];\n                }\n            }\n            // load es6 module if not loaded before\n            if (!_regModules[key.moduleName]) {\n                log(`ES6 module '${key.moduleName}' is not loaded yet`);\n                // convert module name to the path to es6-module file with a sources\n                const path = _resolver.resolve(key.moduleName);\n                try {\n                    _regModules[key.moduleName] = await __webpack_require__(\"./src lazy recursive\")(path);\n                    log(`ES6 module '${key.moduleName}' is loaded from '${path}'.`);\n                } catch (e) {\n                    console.error(\n                        e?.message,\n                        `Object key: \"${objectKey}\".`,\n                        `Path: \"${path}\".`,\n                        `Stack: ${JSON.stringify(stack)}`\n                    );\n                    throw e;\n                }\n\n            }\n            // create object using the composer\n            let res = await _composer.create(key, _regModules[key.moduleName], stack, this);\n            log(`Object '${objectKey}' is created.`);\n\n            // TODO: refactor this code to use wrappers w/o hardcode\n            if (key.wrappers.includes(_Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].WRAP_PROXY)) {\n                const me = this;\n                res = new Proxy({dep: undefined, objectKey}, {\n                    get: async function (base, name) {\n                        if (name === 'create') base.dep = await me.get(base.objectKey);\n                        return base.dep;\n                    }\n                });\n            }\n\n            if (key.life === _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].LIFE_SINGLETON) {\n                const singleId = getSingletonId(key);\n                _regSingles[singleId] = res;\n                log(`Object '${objectKey}' is saved as singleton.`);\n            }\n            return res;\n        };\n\n        this.getParser = () => _parser;\n\n        this.getPreProcessor = () => _preProcessor\n        ;\n        this.getResolver = () => _resolver;\n\n        this.setDebug = function (data) {\n            _debug = data;\n            _composer.setDebug(data);\n        };\n\n        this.setParser = (data) => _parser = data;\n\n        this.setPreProcessor = (data) => _preProcessor = data;\n\n        this.setResolver = (data) => _resolver = data;\n\n        // MAIN\n        _regSingles[_Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].KEY_CONTAINER] = this;\n    }\n};\n\n//# sourceURL=webpack://@teqfw/di/./src/Container.js?");

/***/ }),

/***/ "./src/Defs.js":
/*!*********************!*\
  !*** ./src/Defs.js ***!
  \*********************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/**\n * Hardcoded constants for the package.\n */\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({\n    COMPOSE_AS_IS: 'A',\n    COMPOSE_FACTORY: 'F',\n    EXT: 'js',\n    KEY_CONTAINER: 'container',\n    KEY_CONTAINER_NS: 'TeqFw_Di_Container$',\n    LIFE_INSTANCE: 'I',\n    LIFE_SINGLETON: 'S',\n    WRAP_PROXY: 'proxy',\n\n    /**\n     * Return 'true' if function is a class definition.\n     * See: https://stackoverflow.com/a/29094018/4073821\n     *\n     * @param {function} fn\n     * @return {boolean}\n     */\n    isClass(fn) {\n        const proto = Object.getOwnPropertyDescriptor(fn, 'prototype');\n        return proto && !proto.writable;\n    },\n});\n\n//# sourceURL=webpack://@teqfw/di/./src/Defs.js?");

/***/ }),

/***/ "./src/Parser.js":
/*!***********************!*\
  !*** ./src/Parser.js ***!
  \***********************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ TeqFw_Di_Parser)\n/* harmony export */ });\n/* harmony import */ var _Parser_Def_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Parser/Def.js */ \"./src/Parser/Def.js\");\n/**\n * The root parser for `objectKeys` contains all other parsers.\n * It calls the other parser one by one to parse the object key as a structure.\n * Every npm package can have its own format for an `objectKey`.\n */\n\n\n// VARS\nconst KEY_PARSER = 'parser';\nconst KEY_VALIDATOR = 'validator';\n\n// MAIN\nclass TeqFw_Di_Parser {\n\n    constructor() {\n        // VARS\n        /**\n         * Default parsing function.\n         * @type {(function(string): TeqFw_Di_Api_ObjectKey)}\n         */\n        let _defaultParser = _Parser_Def_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"];\n        /**\n         * The array of the pairs {validator, parser} to parse objectKeys.\n         * @type {Object<validator:function, parser:function>[]}\n         */\n        const _parsers = [];\n\n        // INSTANCE METHODS\n\n        /**\n         *\n         * @param {function(string):boolean} validator\n         * @param {function(string):TeqFw_Di_Api_ObjectKey} parser\n         */\n        this.addParser = function (validator, parser) {\n            _parsers.push({[KEY_VALIDATOR]: validator, [KEY_PARSER]: parser});\n        };\n\n        /**\n         * @param {string} objectKey\n         * @return {TeqFw_Di_Api_ObjectKey}\n         */\n        this.parse = function (objectKey) {\n            let res;\n            for (const one of _parsers) {\n                if (one[KEY_VALIDATOR](objectKey)) {\n                    res = one[KEY_PARSER](objectKey);\n                    break;\n                }\n            }\n            if (!res)\n                res = _defaultParser(objectKey);\n            return res;\n        };\n\n        /**\n         * @param {function(string):TeqFw_Di_Api_ObjectKey} parser\n         */\n        this.setDefaultParser = function (parser) {\n            _defaultParser = parser;\n        };\n\n        // MAIN\n    }\n};\n\n//# sourceURL=webpack://@teqfw/di/./src/Parser.js?");

/***/ }),

/***/ "./src/Parser/Def.js":
/*!***************************!*\
  !*** ./src/Parser/Def.js ***!
  \***************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ TeqFw_Di_Parser_Def)\n/* harmony export */ });\n/* harmony import */ var _Api_ObjectKey_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Api/ObjectKey.js */ \"./src/Api/ObjectKey.js\");\n/* harmony import */ var _Defs_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Defs.js */ \"./src/Defs.js\");\n/**\n * Default parser for object keys in format:\n *   - Vnd_Pkg_Prj_Mod$FA\n */\n\n\n\n// VARS\n/** @type {RegExp} expression for default object key (Ns_Module[.|#]export$[F|A][S|I]) */\nconst REGEXP = /^((([A-Z])[A-Za-z0-9_]*)((#|\\.)?([A-Za-z0-9]*)((\\$)([F|A])?([S|I])?)?)?)$/;\n\n\n// MAIN\n/**\n * @param {string} objectKey\n * @return {TeqFw_Di_Api_ObjectKey}\n */\nfunction TeqFw_Di_Parser_Def(objectKey) {\n    const res = new _Api_ObjectKey_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n    res.value = objectKey;\n    const parts = REGEXP.exec(objectKey);\n    if (parts) {\n        res.moduleName = parts[2];\n        if (parts[5] === '.') {\n            // App_Service.export...\n            if (parts[8] === '$') {\n                // App_Service.export$...\n                res.composition = _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].COMPOSE_FACTORY;\n                res.exportName = parts[6];\n                res.life = (parts[10] === _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].LIFE_INSTANCE)\n                    ? _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].LIFE_INSTANCE : _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].LIFE_SINGLETON;\n            } else {\n                res.composition = ((parts[8] === undefined) || (parts[8] === _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].COMPOSE_AS_IS))\n                    ? _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].COMPOSE_AS_IS : _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].COMPOSE_FACTORY;\n                res.exportName = parts[6];\n                res.life = ((parts[8] === undefined) || (parts[10] === _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].LIFE_SINGLETON))\n                    ? _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].LIFE_SINGLETON : _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].LIFE_INSTANCE;\n            }\n\n\n        } else if (parts[8] === '$') {\n            // App_Logger$FS\n            res.composition = ((parts[9] === undefined) || (parts[9] === _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].COMPOSE_FACTORY))\n                ? _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].COMPOSE_FACTORY : _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].COMPOSE_AS_IS;\n            res.exportName = 'default';\n            if (parts[10]) {\n                res.life = (parts[10] === _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].LIFE_SINGLETON) ? _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].LIFE_SINGLETON : _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].LIFE_INSTANCE;\n            } else {\n                res.life = (res.composition === _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].COMPOSE_FACTORY) ? _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].LIFE_SINGLETON : _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].LIFE_INSTANCE;\n            }\n        } else {\n            // App_Service\n            res.composition = _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].COMPOSE_AS_IS;\n            res.exportName = 'default';\n            res.life = _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].LIFE_SINGLETON;\n        }\n    }\n\n    // we should always use singletons for as-is exports\n    if ((res.composition === _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].COMPOSE_AS_IS) && (res.life === _Defs_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"].LIFE_INSTANCE))\n        throw new Error(`Export is not a function and should be used as a singleton only: '${res.value}'.`);\n    return res;\n}\n\n//# sourceURL=webpack://@teqfw/di/./src/Parser/Def.js?");

/***/ }),

/***/ "./src/PreProcessor.js":
/*!*****************************!*\
  !*** ./src/PreProcessor.js ***!
  \*****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ TeqFw_Di_PreProcessor)\n/* harmony export */ });\n/**\n * The preprocessor handles object keys after the parsing but before creating any objects.\n * A replacement rules can be implemented here.\n * Every handler is a function with 2 arguments:\n *  - objectKey: current key after processing with other handlers;\n *  - originalKey: the key before any processing;\n */\nclass TeqFw_Di_PreProcessor {\n\n    constructor() {\n        // VARS\n        /**\n         * The array of handlers in the dependency order (from the basic (di) up to the app).\n         * @type {Array<function(TeqFw_Di_Api_ObjectKey, TeqFw_Di_Api_ObjectKey):TeqFw_Di_Api_ObjectKey>}\n         */\n        const _handlers = [];\n\n        // INSTANCE METHODS\n\n        /**\n         *\n         * @param {function(TeqFw_Di_Api_ObjectKey, TeqFw_Di_Api_ObjectKey):TeqFw_Di_Api_ObjectKey} hndl\n         */\n        this.addHandler = function (hndl) {\n            _handlers.push(hndl);\n        };\n\n        /**\n         * Get all pre-processing handlers.\n         * @return {Array<function(TeqFw_Di_Api_ObjectKey, TeqFw_Di_Api_ObjectKey): TeqFw_Di_Api_ObjectKey>}\n         */\n        this.getHandlers = () => _handlers;\n\n        /**\n         * @param {TeqFw_Di_Api_ObjectKey} objectKey\n         * @return {TeqFw_Di_Api_ObjectKey}\n         */\n        this.process = function (objectKey) {\n            let res = objectKey;\n            for (const one of _handlers)\n                res = one(res, objectKey);\n            return res;\n        };\n    }\n};\n\n//# sourceURL=webpack://@teqfw/di/./src/PreProcessor.js?");

/***/ }),

/***/ "./src/PreProcessor/Replace.js":
/*!*************************************!*\
  !*** ./src/PreProcessor/Replace.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/**\n * Pre-processor handler to replace one object key with another.\n */\n\n/**\n * Factory function to create pre-processor handler.\n * @return {function(*): *}\n */\n/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__() {\n    // VARS\n    /**\n     * Storage for ES modules replacements (interface => implementation).\n     * Sample: {['Vnd_Plug_Interface']:'Vnd_Plug_Impl', ...}\n     * @type {Object<string, string>}\n     */\n    const replacements = {};\n\n    // FUNCS\n    /**\n     * @param {TeqFw_Di_Api_ObjectKey} objectKey\n     * @param {TeqFw_Di_Api_ObjectKey} originalKey\n     * @return {TeqFw_Di_Api_ObjectKey}\n     * @namespace\n     */\n    function TeqFw_Di_PreProcessor_Replace(objectKey, originalKey) {\n        let module = objectKey.moduleName;\n        while (replacements[module]) module = replacements[module];\n        if (module !== objectKey.moduleName) {\n            const res = Object.assign({}, objectKey);\n            res.moduleName = module;\n            return res;\n        } else\n            return objectKey;\n    }\n\n    /**\n     * Add replacement for ES6 modules.\n     *\n     * @param {string} orig ('Vnd_Plug_Interface')\n     * @param {string} alter ('Vnd_Plug_Impl')\n     */\n    TeqFw_Di_PreProcessor_Replace.add = function (orig, alter) {\n        replacements[orig] = alter;\n    };\n\n    // MAIN\n    return TeqFw_Di_PreProcessor_Replace;\n}\n\n//# sourceURL=webpack://@teqfw/di/./src/PreProcessor/Replace.js?");

/***/ }),

/***/ "./src/Resolver.js":
/*!*************************!*\
  !*** ./src/Resolver.js ***!
  \*************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ TeqFw_Di_Resolver)\n/* harmony export */ });\n/* harmony import */ var _Defs_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Defs.js */ \"./src/Defs.js\");\n/**\n * The Resolver should convert ES6 module name into the path to the sources (file path or URL).\n *\n * This is a base resolver that considers that:\n *  - module name is Zend1-compatible ('Vendor_Package_Module')\n *  - every namespace is bound to some real path ('Vendor_Package_' => '.../node_modules/@vendor/package/src/...)\n *  - every package has sources with the same extensions (*.js, *.mjs, *.es6, ...)\n *  - namespaces can be nested (App_Web_ => ./@app/web/..., App_Web_Api_ => ./@app/web_api/...)\n */\n\n\n// VARS\nconst KEY_EXT = 'ext';\nconst KEY_NS = 'ns';\nconst KEY_PATH = 'root';\n/**\n * Namespace parts separator.\n *\n * @type {string}\n */\nconst NSS = '_';\n\n// MAIN\nclass TeqFw_Di_Resolver {\n\n    constructor() {\n        // VARS\n        const _regNs = {};\n        let _namespaces = [];\n        let _ps = '/'; // web & unix path separator\n\n        // INSTANCE METHODS\n\n        this.addNamespaceRoot = function (ns, path, ext) {\n            _regNs[ns] = {\n                [KEY_EXT]: ext ?? _Defs_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].EXT,\n                [KEY_NS]: ns,\n                [KEY_PATH]: path,\n            };\n            _namespaces = Object.keys(_regNs).sort((a, b) => b.localeCompare(a));\n        };\n\n        /**\n         * Convert the module name to the path of the source files .\n         * @param {string} moduleName 'Vendor_Package_Module'\n         * @return {string} '/home/user/app/node_modules/@vendor/package/src/Module.js'\n         */\n        this.resolve = function (moduleName) {\n            let root, ext, ns;\n            for (ns of _namespaces) {\n                if (moduleName.startsWith(ns)) {\n                    root = _regNs[ns][KEY_PATH];\n                    ext = _regNs[ns][KEY_EXT];\n                    break;\n                }\n            }\n            if (root && ext) {\n                const tail = moduleName.replace(ns, '');\n                const file = tail.replaceAll(NSS, _ps);\n                return `${root}${_ps}${file}.${ext}`;\n            } else return moduleName;\n        };\n    }\n};\n\n//# sourceURL=webpack://@teqfw/di/./src/Resolver.js?");

/***/ }),

/***/ "./src/SpecAnalyser.js":
/*!*****************************!*\
  !*** ./src/SpecAnalyser.js ***!
  \*****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _Defs_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Defs.js */ \"./src/Defs.js\");\n/**\n * This function analyzes specification of dependencies extracted from the text definition of the function itself.\n */\n\n\n// VARS\nconst FUNC = /function\\s*\\w*\\s*\\((\\s*\\{.+\\}\\s*)\\)/s;\nconst CLASS = /constructor\\s*\\((\\s*\\{.+\\}\\s*)\\)/s;\n\n// FUNCS\n\n/**\n * Internal function to analyze extracted parameters.\n *\n * @param {string} params\n * @return {string[]}\n * @private\n */\nfunction _analyze(params) {\n    const res = [];\n    // create wrapper for arguments and collect dependencies using Proxy\n    try {\n        const fn = new Function(params, 'return');\n        const spec = new Proxy({}, {\n            get: (target, prop) => res.push(prop),\n        });\n        // run wrapper and return dependencies\n        fn(spec);\n    } catch (e) {\n        const msg = `Cannot analyze the deps specification:${parts[1]}\\n`\n            + `\\nPlease, be sure that spec does not contain extra ')' in a comments.`\n            + `\\n\\nError: ${e}`;\n        throw new Error(msg);\n    }\n    return res;\n}\n\n/**\n * @param {Function|Object} exp\n * @return {string[]}\n */\nfunction _analyzeClass(exp) {\n    const res = [];\n    // extract arguments from constructor\n    const def = exp.toString();\n    const parts = CLASS.exec(def);\n    if (parts) {\n        res.push(..._analyze(parts[1]));\n    } // else: constructor does not have arguments\n    return res;\n}\n\n/**\n * @param {Function|Object} exp\n * @return {string[]}\n */\nfunction _analyzeFunc(exp) {\n    const res = [];\n    // extract arguments from factory function\n    const def = exp.toString();\n    const parts = FUNC.exec(def);\n    if (parts) {\n        res.push(..._analyze(parts[1]));\n    } // else: constructor does not have arguments\n    return res;\n}\n\n// MAIN\n/**\n * @param {Function|Object} exp\n * @return {string[]}\n */\n/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(exp) {\n    if (typeof exp === 'function') {\n        if (_Defs_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].isClass(exp)) {\n            return _analyzeClass(exp);\n        } else {\n            return _analyzeFunc(exp);\n        }\n    } else\n        return [];\n}\n\n//# sourceURL=webpack://@teqfw/di/./src/SpecAnalyser.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./index.mjs");
/******/ 	
/******/ })()
;