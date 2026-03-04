declare global {
  type TeqFw_Di_Config_NamespaceRegistry = import("./src/Config/NamespaceRegistry.mjs").default;
  type TeqFw_Di_Container = import("./src/Container.mjs").default;
  type TeqFw_Di_Container_Instantiate_ExportSelector = import("./src/Container/Instantiate/ExportSelector.mjs").default;
  type TeqFw_Di_Container_Instantiate_Instantiator = import("./src/Container/Instantiate/Instantiator.mjs").default;
  type TeqFw_Di_Container_Lifecycle_Registry = import("./src/Container/Lifecycle/Registry.mjs").default;
  type TeqFw_Di_Container_Resolve_GraphResolver = import("./src/Container/Resolve/GraphResolver.mjs").default;
  type TeqFw_Di_Container_Wrapper_Executor = import("./src/Container/Wrapper/Executor.mjs").default;
  type TeqFw_Di_Def_Parser = import("./src/Def/Parser.mjs").default;
  type TeqFw_Di_DepId = import("./src/Dto/DepId.mjs").default;
  type TeqFw_Di_DepId$DTO = import("./src/Dto/DepId.mjs").DTO;
  type TeqFw_Di_Dto_DepId = import("./src/Dto/DepId.mjs").default;
  type TeqFw_Di_Dto_DepId$DTO = import("./src/Dto/DepId.mjs").DTO;
  type TeqFw_Di_Dto_Resolver_Config = import("./src/Dto/Resolver/Config.mjs").default;
  type TeqFw_Di_Dto_Resolver_Config$DTO = import("./src/Dto/Resolver/Config.mjs").DTO;
  type TeqFw_Di_Dto_Resolver_Config_Namespace = import("./src/Dto/Resolver/Config/Namespace.mjs").default;
  type TeqFw_Di_Dto_Resolver_Config_Namespace$DTO = import("./src/Dto/Resolver/Config/Namespace.mjs").DTO;
  type TeqFw_Di_Dto_Resolver_Config_Namespace$DTO$ = import("./src/Dto/Resolver/Config/Namespace.mjs").DTO;
  type TeqFw_Di_Enum_Composition = typeof import("./src/Enum/Composition.mjs").default;
  type TeqFw_Di_Enum_Life = typeof import("./src/Enum/Life.mjs").default;
  type TeqFw_Di_Enum_Platform = typeof import("./src/Enum/Platform.mjs").default;
  type TeqFw_Di_Internal_Logger = import("./src/Internal/Logger.mjs").default;
  type TeqFw_Di_Resolver = import("./src/Container/Resolver.mjs").default;
}

export {};
