export type ApiExposure =
    | 'public-runtime'
    | 'public-structural'
    | 'internal';

export interface ImportBinding {
    readonly specifier: string;
    readonly exportName: 'default' | string;
    readonly canonical: boolean;
    readonly note?: string;
}

export interface MethodContract {
    readonly name: string;
    readonly signature: string;
    readonly stage?: 'builder' | 'runtime' | 'composition';
    readonly summary: string;
    readonly constraints?: readonly string[];
}

export interface RuntimeComponentContract {
    readonly alias: string;
    readonly kind: 'class';
    readonly role: string;
    readonly imports: readonly ImportBinding[];
    readonly methods: readonly MethodContract[];
}

export interface StructuralContract {
    readonly name: string;
    readonly kind: 'dto' | 'enum' | 'protocol' | 'module-contract';
    readonly summary: string;
    readonly aliases?: readonly string[];
    readonly fields?: Readonly<Record<string, string>>;
    readonly values?: Readonly<Record<string, string>>;
    readonly notes?: readonly string[];
}

export interface TypeAliasClassification {
    readonly alias: string;
    readonly source: string;
    readonly exposure: ApiExposure;
    readonly reason: string;
    readonly canonicalUse?: string;
    readonly sameAs?: readonly string[];
}

export interface PackageApiContract {
    readonly packageName: '@teqfw/di';
    readonly packageRole: string;
    readonly canonicalEntrypoints: readonly string[];
    readonly publicRuntime: readonly RuntimeComponentContract[];
    readonly structuralContracts: readonly StructuralContract[];
    readonly typeMapClassification: readonly TypeAliasClassification[];
    readonly operationalNotes: readonly string[];
}

/**
 * Public package contract intended for agents that consume `@teqfw/di`
 * as an npm dependency.
 *
 * This file distinguishes between:
 * - importable runtime API supported by `package.json#exports`
 * - structural contracts that external code may rely on indirectly
 * - internal implementation aliases present in `types.d.ts`
 */
export const PACKAGE_API: PackageApiContract = {
    packageName: '@teqfw/di',
    packageRole: 'Deterministic runtime DI container for native ES modules with explicit Dependency Specifier contracts.',
    canonicalEntrypoints: [
        '@teqfw/di',
        '@teqfw/di/node/registry/namespace',
        '@teqfw/di/node/registry/package',
    ],
    publicRuntime: [
        {
            alias: 'TeqFw_Di_Container',
            kind: 'class',
            role: 'Primary runtime composition root. Resolves Dependency Specifiers into frozen linked values.',
            imports: [
                {
                    specifier: '@teqfw/di',
                    exportName: 'default',
                    canonical: true,
                },
            ],
            methods: [
                {
                    name: 'constructor',
                    signature: 'new Container()',
                    stage: 'builder',
                    summary: 'Creates a container in builder stage. The constructor accepts no arguments.',
                },
                {
                    name: 'addNamespaceRoot',
                    signature: 'addNamespaceRoot(prefix: string, target: string, defaultExt: string): void',
                    stage: 'builder',
                    summary: 'Registers one namespace root that maps a Module Token prefix to a module-specifier base.',
                    constraints: [
                        'Allowed only before the first get().',
                        'The target may be filesystem-backed or URL-backed depending on runtime environment.',
                        'Namespace rules are snapshotted and locked on the first get().',
                    ],
                },
                {
                    name: 'addPreprocess',
                    signature: 'addPreprocess(fn: (depId: TeqFw_Di_Dto_DepId) => TeqFw_Di_Dto_DepId): void',
                    stage: 'builder',
                    summary: 'Adds an ordered parsed dependency identity preprocessing hook.',
                    constraints: [
                        'Allowed only before the first get().',
                        'Each hook is invoked synchronously in registration order and must return another DepId DTO.',
                    ],
                },
                {
                    name: 'addPostprocess',
                    signature: 'addPostprocess(fn: (value: unknown) => unknown): void',
                    stage: 'builder',
                    summary: 'Adds an ordered value transform applied to every resolved value after instantiation.',
                    constraints: [
                        'Allowed only before the first get().',
                        'Runs synchronously in registration order after instantiation and before wrapper exports.',
                    ],
                },
                {
                    name: 'enableLogging',
                    signature: 'enableLogging(): void',
                    stage: 'builder',
                    summary: 'Turns on diagnostic console logging without changing linking semantics.',
                    constraints: [
                        'Allowed only before the first get().',
                    ],
                },
                {
                    name: 'enableTestMode',
                    signature: 'enableTestMode(): void',
                    stage: 'builder',
                    summary: 'Enables structural mock registration for tests.',
                    constraints: [
                        'Allowed only before the first get().',
                    ],
                },
                {
                    name: 'register',
                    signature: 'register(specifier: string, mock: unknown): void',
                    stage: 'builder',
                    summary: 'Registers a mock by canonical DepId identity after parsing the provided Dependency Specifier.',
                    constraints: [
                        'Allowed only before the first get().',
                        'Requires enableTestMode() first.',
                    ],
                },
                {
                    name: 'get',
                    signature: 'get(specifier: string): Promise<any>',
                    stage: 'runtime',
                    summary: 'Parses, preprocesses, resolves, instantiates, postprocesses, wraps, applies lifecycle, freezes, and returns a linked value.',
                    constraints: [
                        'The first get() locks configuration and creates internal infrastructure.',
                        'Any fatal pipeline error moves the container into failed state.',
                        'All subsequent get() calls reject once the container is failed.',
                    ],
                },
            ],
        },
        {
            alias: 'TeqFw_Di_Node_Registry_Package',
            kind: 'class',
            role: 'Node.js-only composition-stage static runtime package graph builder.',
            imports: [{specifier: '@teqfw/di/node/registry/package', exportName: 'default', canonical: true}],
            methods: [
                {name: 'constructor', signature: 'new PackageRegistry({ fs, path, appRoot })', stage: 'composition', summary: 'Creates a static package graph builder.'},
                {name: 'build', signature: 'build(): Promise<ReadonlyArray<PackageRecord>>', stage: 'composition', summary: 'Builds immutable dependency-first postorder package records; independent dependency names use ascending lexical order as the stable tie-breaker.', constraints: ['Reads only transitive dependencies and static package metadata.', 'Does not load modules or interpret application providers.']},
            ],
        },
        {
            alias: 'TeqFw_Di_Node_Registry_Namespace',
            kind: 'class',
            role: 'Node.js-only composition-stage helper that discovers namespace roots from the root package and installed npm dependencies.',
            imports: [
                {
                    specifier: '@teqfw/di/node/registry/namespace',
                    exportName: 'default',
                    canonical: true,
                },
            ],
            methods: [
                {
                    name: 'constructor',
                    signature: 'new NamespaceRegistry({ fs, path, appRoot })',
                    stage: 'composition',
                    summary: 'Creates a registry builder over filesystem and path adapters.',
                    constraints: [
                        'Intended only for Node.js composition root code, not for DI-managed or browser runtime modules.',
                        'Consumes static package.json metadata only.',
                    ],
                },
                {
                    name: 'build',
                    signature: 'build(): Promise<ReadonlyArray<{ prefix: string; dirAbs: string; ext: string }>>',
                    stage: 'composition',
                    summary: 'Builds an immutable namespace registry sorted by descending prefix length.',
                    constraints: [
                        'Selects package.json#teqfw.fw.di.namespaces when present; otherwise temporarily falls back to the legacy package.json#teqfw.namespaces array.',
                        'Both schemas require arrays; canonical metadata wins exclusively and the arrays are never merged.',
                        'Fails fast on invalid selected metadata or duplicate prefixes with publisher attribution.',
                    ],
                },
            ],
        },
    ],
    structuralContracts: [
        {name: 'Runtime Package Record', kind: 'protocol', aliases: ['TeqFw_Di_Node_Registry_Package_Record'], summary: 'Immutable static package metadata record.', fields: {name: 'Declared package name.', rootAbs: 'Resolved package root.', rootReal: 'Canonical package root.', packageJson: 'Recursively frozen package metadata.'}},
        {
            name: 'DepId DTO',
            kind: 'dto',
            aliases: ['TeqFw_Di_Dto_DepId'],
            summary: 'Canonical structural dependency identity passed to preprocess hooks and expected from custom parsers.',
            fields: {
                moduleName: 'Logical module identifier without platform prefix.',
                platform: '"teq" | "node" | "npm".',
                exportName: 'Named export or "default"; null means whole-module as-is resolution.',
                composition: '"A" | "F" in the current implementation.',
                life: '"S" | "T" | null in the current implementation.',
                wrappers: 'Ordered wrapper export names.',
                origin: 'Original Dependency Specifier string for diagnostics.',
            },
            notes: [
                'Identity excludes origin.',
                'Consumers should treat it as a structural protocol, not as a factory import surface.',
            ],
        },
        {
            name: 'DepId Enums',
            kind: 'enum',
            aliases: [
                'TeqFw_Di_Enum_Composition',
                'TeqFw_Di_Enum_Life',
                'TeqFw_Di_Enum_Platform',
            ],
            summary: 'Current implementation literals used inside DepId DTO values.',
            values: {
                composition: 'AS_IS -> "A", FACTORY -> "F"',
                life: 'SINGLETON -> "S", TRANSIENT -> "T"',
                platform: 'TEQ -> "teq", NODE -> "node", NPM -> "npm"',
            },
            notes: [
                'These aliases are useful for tooling and JSDoc, not for runtime imports from the package.',
            ],
        },
        {
            name: 'Module Contract',
            kind: 'module-contract',
            summary: 'Shape expected from application modules resolved by the container.',
            fields: {
                __deps__: 'Optional dependency descriptor. Canonical form is hierarchical Record<exportName, Record<dependencyKey, Dependency Specifier string>>. Supported shorthand form is a flat Record<dependencyKey, Dependency Specifier string> for default-export-only modules. Omission means there are no declared dependencies.',
                moduleNamespace: 'Whole ES module namespace object returned for as-is Dependency Specifier without selected export.',
                defaultExport: 'Used when the parsed DepId selects exportName="default" for factory composition.',
                namedExports: 'May be selected via __ExportName for factory composition and may also provide wrapper exports.',
                wrapperExport: 'Named export whose identifier appears in depId.wrappers; it must be synchronous and unary.',
            },
            notes: [
                'The hierarchical export-scoped descriptor is canonical.',
                'The flat shorthand descriptor is supported only for default-export-only modules and does not replace the canonical hierarchical model.',
                'Wrapper exports are resolved from the same module namespace and are not globally registered in the container.',
            ],
        },
    ],
    typeMapClassification: [
        {
            alias: 'TeqFw_Di_Node_Registry_Package',
            source: './src/Node/Registry/Package.mjs',
            exposure: 'public-runtime',
            reason: 'Exported through package.json exports as the supported Node.js composition subpath.',
            canonicalUse: 'Node.js composition-stage package graph imported from @teqfw/di/node/registry/package.',
        },
        {
            alias: 'TeqFw_Di_Node_Registry_Package__Class',
            source: './src/Node/Registry/Package.mjs',
            exposure: 'public-structural',
            reason: 'Constructor type of the public package registry for cross-package JSDoc references.',
        },
        {
            alias: 'TeqFw_Di_Node_Registry_Package_Record',
            source: './src/Node/Registry/Package.mjs#record',
            exposure: 'public-structural',
            reason: 'Public immutable record contract returned by PackageRegistry.build().',
        },
        {
            alias: 'TeqFw_Di_Node_Registry_Namespace',
            source: './src/Node/Registry/Namespace.mjs',
            exposure: 'public-runtime',
            reason: 'Exported through package.json exports as the supported Node.js composition subpath.',
            canonicalUse: 'Node.js composition-stage helper imported from @teqfw/di/node/registry/namespace.',
        },
        {
            alias: 'TeqFw_Di_Node_Registry_Namespace__Class',
            source: './src/Node/Registry/Namespace.mjs',
            exposure: 'public-structural',
            reason: 'Constructor type of the public namespace registry for cross-package JSDoc references.',
        },
        {
            alias: 'TeqFw_Di_Container',
            source: './src/Container.mjs',
            exposure: 'public-runtime',
            reason: 'Default export of the package root.',
            canonicalUse: 'Primary container API imported from @teqfw/di.',
        },
        {
            alias: 'TeqFw_Di_Container__Class',
            source: './src/Container.mjs',
            exposure: 'public-structural',
            reason: 'Constructor type of the public container for cross-package JSDoc references.',
        },
        {
            alias: 'TeqFw_Di_Container_Instantiate',
            source: './src/Container/Instantiate.mjs',
            exposure: 'internal',
            reason: 'Internal immutable-core helper. Not exported via package.json.',
        },
        {
            alias: 'TeqFw_Di_Container_Lifecycle',
            source: './src/Container/Lifecycle.mjs',
            exposure: 'internal',
            reason: 'Internal lifecycle cache component. Not exported via package.json.',
        },
        {
            alias: 'TeqFw_Di_Container_GraphResolver',
            source: './src/Container/GraphResolver.mjs',
            exposure: 'internal',
            reason: 'Internal graph builder used by Container.get(). Not exported via package.json.',
        },
        {
            alias: 'TeqFw_Di_Container_Executor',
            source: './src/Container/Executor.mjs',
            exposure: 'internal',
            reason: 'Internal wrapper-stage executor. Not exported via package.json.',
        },
        {
            alias: 'TeqFw_Di_Dto_DepId',
            source: './src/Dto/DepId.mjs',
            exposure: 'public-structural',
            reason: 'Public structural protocol used by preprocess hooks and parser replacement.',
            canonicalUse: 'Primary type alias for canonical dependency identity.',
        },
        {
            alias: 'TeqFw_Di_Dto_DepId__Factory',
            source: './src/Dto/DepId.mjs#Factory',
            exposure: 'internal',
            reason: 'Internal DTO factory used inside the parser; not part of the supported runtime import surface.',
        },
        {
            alias: 'TeqFw_Di_Dto_Resolver_Config',
            source: './src/Dto/Resolver/Config.mjs',
            exposure: 'internal',
            reason: 'Internal resolver configuration DTO. External code configures the container through addNamespaceRoot() instead.',
        },
        {
            alias: 'TeqFw_Di_Dto_Resolver_Config__Factory',
            source: './src/Dto/Resolver/Config.mjs#Factory',
            exposure: 'internal',
            reason: 'Internal DTO factory used inside Container when bootstrapping Resolver.',
        },
        {
            alias: 'TeqFw_Di_Dto_Resolver_Config_Namespace',
            source: './src/Dto/Resolver/Config/Namespace.mjs',
            exposure: 'internal',
            reason: 'Internal resolver namespace DTO used inside the resolver configuration DTO.',
        },
        {
            alias: 'TeqFw_Di_Dto_Resolver_Config_Namespace__Factory',
            source: './src/Dto/Resolver/Config/Namespace.mjs#Factory',
            exposure: 'internal',
            reason: 'Internal DTO factory for resolver namespace rules.',
        },
        {
            alias: 'TeqFw_Di_Enum_Composition',
            source: './src/Enum/Composition.mjs',
            exposure: 'public-structural',
            reason: 'Useful static vocabulary for interpreting DepId.composition values.',
            canonicalUse: 'Type/JSDoc vocabulary only; no package export for runtime import.',
        },
        {
            alias: 'TeqFw_Di_Enum_Life',
            source: './src/Enum/Life.mjs',
            exposure: 'public-structural',
            reason: 'Useful static vocabulary for interpreting DepId.life values.',
            canonicalUse: 'Type/JSDoc vocabulary only; no package export for runtime import.',
        },
        {
            alias: 'TeqFw_Di_Enum_Platform',
            source: './src/Enum/Platform.mjs',
            exposure: 'public-structural',
            reason: 'Useful static vocabulary for interpreting DepId.platform values.',
            canonicalUse: 'Type/JSDoc vocabulary only; no package export for runtime import.',
        },
        {
            alias: 'TeqFw_Di_Internal_Logger',
            source: './src/Internal/Logger.mjs',
            exposure: 'internal',
            reason: 'Diagnostic helper used only inside the container implementation.',
        },
        {
            alias: 'TeqFw_Di_Resolver',
            source: './src/Container/Resolver.mjs',
            exposure: 'internal',
            reason: 'Internal module resolver infrastructure. Consumers should configure the Container, not instantiate Resolver directly.',
        },
    ],
    operationalNotes: [
        'Canonical Node.js registry entrypoints are @teqfw/di/node/registry/namespace and @teqfw/di/node/registry/package. They must not be imported by browser runtime modules.',
        'The legacy compatibility entry point @teqfw/di/src/Config/NamespaceRegistry.mjs is deprecated. Every other src/** path is internal and unsupported; new code must use @teqfw/di/node/registry/namespace.',
        'NamespaceRegistry uses the canonical package.json#teqfw.fw.di.namespaces array and temporarily falls back to package.json#teqfw.namespaces only when canonical metadata is absent.',
        'Resolved values are frozen before being returned.',
        'The hierarchical export-scoped descriptor is canonical. The flat shorthand descriptor is supported only for default-export-only modules.',
        'Named wrapper exports are executed after addPostprocess() hooks and before freeze.',
        '$$ selects transient lifecycle; $$$ explicitly selects direct lifecycle.',
        'types.d.ts is broader than the runtime import surface. Presence of an alias there does not by itself make the underlying module a supported runtime entrypoint.',
        'Type alias names follow the module namespace mapping exactly: the bare alias of a module is its primary consumer-side export type (instance type for a class, function type for a single-function module, object type for an enum), `__ExportName` selects a named export from the same module, and `NS__Class` denotes the constructable that produces `NS` instances when the class itself is referenced as a value. `__Class` aliases are published for classes importable through the package entry points so cross-package JSDoc can reach the constructable without module paths; internal classes do not receive them. A class name in type position is already its instance type, so no `$`/instance markers are used.',
        'For the canonical alias scheme, see the Types reference.',
    ],
} as const;

export default PACKAGE_API;
