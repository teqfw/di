type TeqFw_Di_Def_Parser = InstanceType<typeof import("./src/Def/Parser.mjs").default>;
type TeqFw_Di_Config_NamespaceRegistry = InstanceType<typeof import("./src/Config/NamespaceRegistry.mjs").default>;
export type TeqFw_Di_Container = InstanceType<typeof import("./src/Container.mjs").default>;
export type TeqFw_Di_Container_Instantiate_ExportSelector = InstanceType<
  typeof import("./src/Container/Instantiate/ExportSelector.mjs").default
>;
export type TeqFw_Di_Container_Instantiate_Instantiator = InstanceType<
  typeof import("./src/Container/Instantiate/Instantiator.mjs").default
>;
export type TeqFw_Di_Container_Lifecycle_Registry = InstanceType<
  typeof import("./src/Container/Lifecycle/Registry.mjs").default
>;
export type TeqFw_Di_Container_Resolve_GraphResolver = InstanceType<
  typeof import("./src/Container/Resolve/GraphResolver.mjs").default
>;
export type TeqFw_Di_Container_Wrapper_Executor = InstanceType<
  typeof import("./src/Container/Wrapper/Executor.mjs").default
>;
type TeqFw_Di_DepId = InstanceType<typeof import("./src/Dto/DepId.mjs").default>;
type TeqFw_Di_Dto_Resolver_Config = InstanceType<typeof import("./src/Dto/Resolver/Config.mjs").default>;
type TeqFw_Di_Dto_Resolver_Config_Namespace = InstanceType<
  typeof import("./src/Dto/Resolver/Config/Namespace.mjs").default
>;
type TeqFw_Di_Resolver = InstanceType<typeof import("./src/Container/Resolver.mjs").default>;

export type TeqFw_Di_DepId$DTO = typeof import("./src/Dto/DepId.mjs").DTO;
export type TeqFw_Di_DepId$DTO$ = InstanceType<TeqFw_Di_DepId$DTO>;
export type TeqFw_Di_Dto_Resolver_Config$DTO = typeof import("./src/Dto/Resolver/Config.mjs").DTO;
export type TeqFw_Di_Dto_Resolver_Config$DTO$ = InstanceType<TeqFw_Di_Dto_Resolver_Config$DTO>;
export type TeqFw_Di_Dto_Resolver_Config_Namespace$DTO = typeof import("./src/Dto/Resolver/Config/Namespace.mjs").DTO;
export type TeqFw_Di_Dto_Resolver_Config_Namespace$DTO$ = InstanceType<TeqFw_Di_Dto_Resolver_Config_Namespace$DTO>;

export {};

declare global {
  type TeqFw_Di_Container = InstanceType<typeof import("./src/Container.mjs").default>;
  type TeqFw_Di_Config_NamespaceRegistry = InstanceType<typeof import("./src/Config/NamespaceRegistry.mjs").default>;
  type TeqFw_Di_Def_Parser = InstanceType<typeof import("./src/Def/Parser.mjs").default>;
  type TeqFw_Di_DepId = InstanceType<typeof import("./src/Dto/DepId.mjs").default>;
  type TeqFw_Di_DepId$DTO = import("./src/Dto/DepId.mjs").DTO;
  type TeqFw_Di_Dto_Resolver_Config = InstanceType<typeof import("./src/Dto/Resolver/Config.mjs").default>;
  type TeqFw_Di_Dto_Resolver_Config$DTO = import("./src/Dto/Resolver/Config.mjs").DTO;
  type TeqFw_Di_Dto_Resolver_Config_Namespace = InstanceType<
    typeof import("./src/Dto/Resolver/Config/Namespace.mjs").default
  >;
  type TeqFw_Di_Dto_Resolver_Config_Namespace$DTO = typeof import("./src/Dto/Resolver/Config/Namespace.mjs").DTO;
  type TeqFw_Di_Dto_Resolver_Config_Namespace$DTO$ = InstanceType<TeqFw_Di_Dto_Resolver_Config_Namespace$DTO>;
  type TeqFw_Di_Enum_Composition = typeof import("./src/Enum/Composition.mjs").default;
  type TeqFw_Di_Enum_Life = typeof import("./src/Enum/Life.mjs").default;
  type TeqFw_Di_Enum_Platform = typeof import("./src/Enum/Platform.mjs").default;
  type TeqFw_Di_Container_Resolve_GraphResolver = InstanceType<
    typeof import("./src/Container/Resolve/GraphResolver.mjs").default
  >;
  type TeqFw_Di_Container_Lifecycle_Registry = InstanceType<
    typeof import("./src/Container/Lifecycle/Registry.mjs").default
  >;
  type TeqFw_Di_Container_Wrapper_Executor = InstanceType<
    typeof import("./src/Container/Wrapper/Executor.mjs").default
  >;
  type TeqFw_Di_Resolver = InstanceType<typeof import("./src/Container/Resolver.mjs").default>;
}
