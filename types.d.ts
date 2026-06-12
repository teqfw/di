declare global {
  type TeqFw_Di_Config_NamespaceRegistry = import("./src/Config/NamespaceRegistry.mjs").default;
  type TeqFw_Di_Container = import("./src/Container.mjs").default;
  type TeqFw_Di_Container_Instantiate = import("./src/Container/Instantiate.mjs").default;
  type TeqFw_Di_Container_Lifecycle = import("./src/Container/Lifecycle.mjs").default;
  type TeqFw_Di_Container_GraphResolver = import("./src/Container/GraphResolver.mjs").default;
  type TeqFw_Di_Container_Executor = import("./src/Container/Executor.mjs").default;
  type TeqFw_Di_Parser = import("./src/Parser.mjs").default;
  type TeqFw_Di_DepId = import("./src/Dto/DepId.mjs").default;
  type TeqFw_Di_DepId__DTO = import("./src/Dto/DepId.mjs").default;
  type TeqFw_Di_DepId$Factory = InstanceType<typeof import("./src/Dto/DepId.mjs").Factory>;
  type TeqFw_Di_Dto_DepId = import("./src/Dto/DepId.mjs").default;
  type TeqFw_Di_Dto_DepId$DTO = import("./src/Dto/DepId.mjs").default;
  type TeqFw_Di_Dto_DepId__Factory = InstanceType<typeof import("./src/Dto/DepId.mjs").Factory>;
  type TeqFw_Di_Dto_Resolver_Config = import("./src/Dto/Resolver/Config.mjs").default;
  type TeqFw_Di_Dto_Resolver_Config__DTO = import("./src/Dto/Resolver/Config.mjs").default;
  type TeqFw_Di_Dto_Resolver_Config__Factory = InstanceType<typeof import("./src/Dto/Resolver/Config.mjs").Factory>;
  type TeqFw_Di_Dto_Resolver_Config_Namespace = import("./src/Dto/Resolver/Config/Namespace.mjs").default;
  type TeqFw_Di_Dto_Resolver_Config_Namespace__DTO = import("./src/Dto/Resolver/Config/Namespace.mjs").default;
  type TeqFw_Di_Dto_Resolver_Config_Namespace__Factory = InstanceType<typeof import("./src/Dto/Resolver/Config/Namespace.mjs").Factory>;
  type TeqFw_Di_Enum_Composition = typeof import("./src/Enum/Composition.mjs").default;
  type TeqFw_Di_Enum_Life = typeof import("./src/Enum/Life.mjs").default;
  type TeqFw_Di_Enum_Platform = typeof import("./src/Enum/Platform.mjs").default;
  type TeqFw_Di_Internal_Logger = import("./src/Internal/Logger.mjs").default;
  type TeqFw_Di_Internal_Logger_Noop = typeof import("./src/Internal/Logger.mjs").TeqFw_Di_Internal_Logger_Noop;
  type TeqFw_Di_Resolver = import("./src/Container/Resolver.mjs").default;
}

export {};
