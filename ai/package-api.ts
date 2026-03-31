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
    packageRole: 'Deterministic runtime DI container for native ES modules with explicit CDC contracts.',
    canonicalEntrypoints: [
        '@teqfw/di',
        '@teqfw/di/src/Config/NamespaceRegistry.mjs',
    ],
    publicRuntime: [
        {
            alias: 'TeqFw_Di_Container',
            kind: 'class',
            role: 'Primary runtime composition root. Resolves CDC identifiers into frozen linked values.',
            imports: [
                {
                    specifier: '@teqfw/di',
                    exportName: 'default',
                    canonical: true,
                },
                {
                    specifier: '@teqfw/di/src/Container.mjs',
                    exportName: 'default',
                    canonical: false,
                    note: 'Explicit source subpath export. Prefer the package root import.',
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
                    name: 'setParser',
                    signature: 'setParser(parser: { parse(cdc: string): TeqFw_Di_DepId$DTO }): void',
                    stage: 'builder',
                    summary: 'Replaces the default CDC parser before the first resolution.',
                    constraints: [
                        'Allowed only before the first get().',
                        'The parser contract is structural. The package does not export the default parser runtime class.',
                    ],
                },
                {
                    name: 'addNamespaceRoot',
                    signature: 'addNamespaceRoot(prefix: string, target: string, defaultExt: string): void',
                    stage: 'builder',
                    summary: 'Registers one namespace-to-filesystem mapping rule.',
                    constraints: [
                        'Allowed only before the first get().',
                        'Namespace rules are snapshotted and locked on the first get().',
                    ],
                },
                {
                    name: 'addPreprocess',
                    signature: 'addPreprocess(fn: (depId: TeqFw_Di_DepId$DTO) => TeqFw_Di_DepId$DTO): void',
                    stage: 'builder',
                    summary: 'Adds an ordered CDC preprocessing hook.',
                    constraints: [
                        'Allowed only before the first get().',
                        'Each hook must return another DepId DTO.',
                    ],
                },
                {
                    name: 'addPostprocess',
                    signature: 'addPostprocess(fn: (value: unknown) => unknown): void',
                    stage: 'builder',
                    summary: 'Adds an ordered post-instantiation value transform applied to every resolved value.',
                    constraints: [
                        'Allowed only before the first get().',
                        'Runs before wrapper exports and before freeze.',
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
                    signature: 'register(cdc: string, mock: unknown): void',
                    stage: 'builder',
                    summary: 'Registers a mock by canonical DepId identity after parsing the provided CDC.',
                    constraints: [
                        'Allowed only before the first get().',
                        'Requires enableTestMode() first.',
                    ],
                },
                {
                    name: 'get',
                    signature: 'get(cdc: string): Promise<any>',
                    stage: 'runtime',
                    summary: 'Parses, resolves, instantiates, postprocesses, wraps, applies lifecycle, freezes, and returns a linked value.',
                    constraints: [
                        'The first get() locks configuration and creates internal infrastructure.',
                        'Any fatal pipeline error moves the container into failed state.',
                        'All subsequent get() calls reject once the container is failed.',
                    ],
                },
            ],
        },
        {
            alias: 'TeqFw_Di_Config_NamespaceRegistry',
            kind: 'class',
            role: 'Composition-stage helper that discovers namespace roots from the root package and installed npm dependencies.',
            imports: [
                {
                    specifier: '@teqfw/di/src/Config/NamespaceRegistry.mjs',
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
                        'Intended for composition root code, not for DI-managed runtime modules.',
                        'Consumes static package.json metadata only.',
                    ],
                },
                {
                    name: 'build',
                    signature: 'build(): Promise<ReadonlyArray<{ prefix: string; dirAbs: string; ext: string }>>',
                    stage: 'composition',
                    summary: 'Builds an immutable namespace registry sorted by descending prefix length.',
                    constraints: [
                        'Fails fast on invalid namespace metadata or duplicate canonical prefixes.',
                    ],
                },
            ],
        },
    ],
    structuralContracts: [
        {
            name: 'DepId DTO',
            kind: 'dto',
            aliases: ['TeqFw_Di_DepId$DTO', 'TeqFw_Di_Dto_DepId$DTO'],
            summary: 'Canonical structural dependency identity passed to preprocess hooks and expected from custom parsers.',
            fields: {
                moduleName: 'Logical module identifier without platform prefix.',
                platform: '"teq" | "node" | "npm".',
                exportName: 'Named export or "default"; null means whole-module/as-is resolution.',
                composition: '"A" | "F" in the current implementation.',
                life: '"S" | "T" | null in the current implementation.',
                wrappers: 'Ordered wrapper export names.',
                origin: 'Original CDC string for diagnostics.',
            },
            notes: [
                'Identity excludes origin.',
                'Consumers should treat it as a structural protocol, not as a factory import surface.',
            ],
        },
        {
            name: 'Parser Protocol',
            kind: 'protocol',
            aliases: ['TeqFw_Di_Def_Parser'],
            summary: 'Structural contract accepted by Container.setParser().',
            fields: {
                parse: '(cdc: string) => TeqFw_Di_DepId$DTO',
            },
            notes: [
                'The package does not export the default parser runtime class through package exports.',
                'External code may provide any object that satisfies the parse() contract.',
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
                __deps__: 'Optional export-scoped dependency descriptor. Canonical form is hierarchical: Record<exportName, Record<dependencyKey, CDC string>>. A flat Record<dependencyKey, CDC string> is shorthand for limited single-export cases.',
                moduleNamespace: 'Whole ES module namespace object returned for as-is CDC without selected export.',
                defaultExport: 'Used when the parsed DepId selects exportName="default" for factory composition.',
                namedExports: 'May be selected via __ExportName for factory composition and may also provide wrapper functions.',
                wrapperExport: 'Named export whose identifier appears in depId.wrappers; it must be synchronous and unary.',
            },
            notes: [
                'The current runtime accepts both export-scoped hierarchical descriptors and the flat shorthand form for limited single-export cases.',
                'Wrapper functions are exported by the same resolved module namespace, not registered globally in the container.',
            ],
        },
    ],
    typeMapClassification: [
        {
            alias: 'TeqFw_Di_Config_NamespaceRegistry',
            source: './src/Config/NamespaceRegistry.mjs',
            exposure: 'public-runtime',
            reason: 'Exported through package.json exports as a supported subpath entrypoint.',
            canonicalUse: 'Composition-stage helper imported from @teqfw/di/src/Config/NamespaceRegistry.mjs.',
        },
        {
            alias: 'TeqFw_Di_Container',
            source: './src/Container.mjs',
            exposure: 'public-runtime',
            reason: 'Default export of the package root and of the explicit source subpath.',
            canonicalUse: 'Primary container API imported from @teqfw/di.',
        },
        {
            alias: 'TeqFw_Di_Container_Instantiate_ExportSelector',
            source: './src/Container/Instantiate/ExportSelector.mjs',
            exposure: 'internal',
            reason: 'Internal immutable-core helper. Not exported via package.json.',
        },
        {
            alias: 'TeqFw_Di_Container_Instantiate_Instantiator',
            source: './src/Container/Instantiate/Instantiator.mjs',
            exposure: 'internal',
            reason: 'Internal immutable-core helper. Not exported via package.json.',
        },
        {
            alias: 'TeqFw_Di_Container_Lifecycle_Registry',
            source: './src/Container/Lifecycle/Registry.mjs',
            exposure: 'internal',
            reason: 'Internal lifecycle cache component. Not exported via package.json.',
        },
        {
            alias: 'TeqFw_Di_Container_Resolve_GraphResolver',
            source: './src/Container/Resolve/GraphResolver.mjs',
            exposure: 'internal',
            reason: 'Internal graph builder used by Container.get(). Not exported via package.json.',
        },
        {
            alias: 'TeqFw_Di_Container_Wrapper_Executor',
            source: './src/Container/Wrapper/Executor.mjs',
            exposure: 'internal',
            reason: 'Internal wrapper-stage executor. Not exported via package.json.',
        },
        {
            alias: 'TeqFw_Di_Def_Parser',
            source: './src/Def/Parser.mjs',
            exposure: 'public-structural',
            reason: 'Container.setParser() accepts this structural contract, but the runtime class is not importable from the package.',
            canonicalUse: 'Typing/protocol alias for custom parser implementations.',
        },
        {
            alias: 'TeqFw_Di_DepId',
            source: './src/Dto/DepId.mjs',
            exposure: 'internal',
            reason: 'Factory class behind the DepId DTO module. Not needed for the supported package runtime API.',
            sameAs: ['TeqFw_Di_Dto_DepId'],
        },
        {
            alias: 'TeqFw_Di_DepId$DTO',
            source: './src/Dto/DepId.mjs#DTO',
            exposure: 'public-structural',
            reason: 'Public structural protocol used by preprocess hooks and parser replacement.',
            canonicalUse: 'Primary type alias for canonical dependency identity.',
            sameAs: ['TeqFw_Di_Dto_DepId$DTO'],
        },
        {
            alias: 'TeqFw_Di_Dto_DepId',
            source: './src/Dto/DepId.mjs',
            exposure: 'internal',
            reason: 'Legacy-namespaced alias of the DepId factory class; not part of the supported runtime import surface.',
            sameAs: ['TeqFw_Di_DepId'],
        },
        {
            alias: 'TeqFw_Di_Dto_DepId$DTO',
            source: './src/Dto/DepId.mjs#DTO',
            exposure: 'public-structural',
            reason: 'Synonym of TeqFw_Di_DepId$DTO kept in the type map.',
            sameAs: ['TeqFw_Di_DepId$DTO'],
        },
        {
            alias: 'TeqFw_Di_Dto_Resolver_Config',
            source: './src/Dto/Resolver/Config.mjs',
            exposure: 'internal',
            reason: 'Internal DTO factory used inside Container when bootstrapping Resolver.',
        },
        {
            alias: 'TeqFw_Di_Dto_Resolver_Config$DTO',
            source: './src/Dto/Resolver/Config.mjs#DTO',
            exposure: 'internal',
            reason: 'Internal resolver configuration DTO. External code configures the container through addNamespaceRoot() instead.',
        },
        {
            alias: 'TeqFw_Di_Dto_Resolver_Config_Namespace',
            source: './src/Dto/Resolver/Config/Namespace.mjs',
            exposure: 'internal',
            reason: 'Internal DTO factory for resolver namespace rules.',
        },
        {
            alias: 'TeqFw_Di_Dto_Resolver_Config_Namespace$DTO',
            source: './src/Dto/Resolver/Config/Namespace.mjs#DTO',
            exposure: 'internal',
            reason: 'Internal resolver namespace DTO alias retained for type-map completeness.',
            sameAs: ['TeqFw_Di_Dto_Resolver_Config_Namespace$DTO$'],
        },
        {
            alias: 'TeqFw_Di_Dto_Resolver_Config_Namespace$DTO$',
            source: './src/Dto/Resolver/Config/Namespace.mjs#DTO',
            exposure: 'internal',
            reason: 'Duplicate DTO alias retained for compatibility inside implementation typings.',
            sameAs: ['TeqFw_Di_Dto_Resolver_Config_Namespace$DTO'],
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
        'Only two runtime entrypoints are supported by package.json exports: @teqfw/di and @teqfw/di/src/Config/NamespaceRegistry.mjs.',
        'Resolved values are frozen before being returned.',
        'Dependency descriptors are canonical when hierarchical and export-scoped; flat descriptors are shorthand for limited single-export cases; omission means no dependencies.',
        'With the default parser, CDC without lifecycle returns the whole module namespace as-is; named export selection implies factory composition.',
        'Named wrapper exports are executed after addPostprocess() hooks and before freeze.',
        'In the current implementation, CDC markers $$ and $$$ both end up as transient/no-cache behavior.',
        'types.d.ts is broader than the runtime import surface. Presence of an alias there does not by itself make the underlying module a supported runtime entrypoint.',
    ],
} as const;

export default PACKAGE_API;
