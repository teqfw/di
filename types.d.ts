declare global {
  type TeqFw_Di_Config_NamespaceRegistry = import("./src/Config/NamespaceRegistry.mjs").default;
  type TeqFw_Di_Container = import("./src/Container.mjs").default;
  type TeqFw_Di_Container_Canonicalizer = import("./src/Container/Canonicalizer.mjs").default;
  type TeqFw_Di_Container_Hardener = import("./src/Container/Hardener.mjs").default;
  type TeqFw_Di_Container_Lifecycle = import("./src/Container/Lifecycle.mjs").default;
  type TeqFw_Di_Container_ModuleLoader = import("./src/Container/ModuleLoader.mjs").default;
  type TeqFw_Di_Container_ModuleRouter = import("./src/Container/ModuleRouter.mjs").default;
  type TeqFw_Di_Container_Postprocessor = import("./src/Container/Postprocessor.mjs").default;
  type TeqFw_Di_Container_Producer = import("./src/Container/Producer.mjs").default;
  type TeqFw_Di_Container_Resolution = typeof import("./src/Container/Resolution.mjs").executeResolution;
  type TeqFw_Di_Container_Wrapper = import("./src/Container/Wrapper.mjs").default;
  type TeqFw_Di_Container_Observer_Contract = ReturnType<typeof import("./src/Container/Observer.mjs").createObserver>;
  type TeqFw_Di_Container_State = 'Configurable'|'Resolving'|'Resolved'|'Failed';
  type TeqFw_Di_Container_ResolutionContext = Readonly<{
    depId: TeqFw_Di_Dto_DepId,
    root: TeqFw_Di_Dto_DepId,
    parent: TeqFw_Di_Dto_DepId | null,
    stack: readonly TeqFw_Di_Dto_DepId[],
  }>;
  type TeqFw_Di_Container__Class = typeof import("./src/Container.mjs").default;
  type TeqFw_Di_Dto_DepId = import("./src/Dto/DepId.mjs").default;
  type TeqFw_Di_Dto_DepId__Factory = import("./src/Dto/DepId.mjs").Factory;
  type TeqFw_Di_Enum_AddressKind = typeof import("./src/Enum/AddressKind.mjs").default;
  type TeqFw_Di_Enum_Lifestyle = typeof import("./src/Enum/Lifestyle.mjs").default;
  type TeqFw_Di_Enum_ObservationEvent = typeof import("./src/Enum/ObservationEvent.mjs").default;
  type TeqFw_Di_Enum_ResolutionStage = typeof import("./src/Enum/ResolutionStage.mjs").default;
  type TeqFw_Di_Internal_DependencyKey = typeof import("./src/Internal/DependencyKey.mjs").buildDependencyKey;
  type TeqFw_Di_Internal_DepsDecl = typeof import("./src/Internal/DepsDecl.mjs").readDepsDecl;
  type TeqFw_Di_Internal_Logger = import("./src/Internal/Logger.mjs").default;
  type TeqFw_Di_Internal_Logger_Contract = Readonly<{log(message: string): void, error(message: string, error?: unknown): void}>;
  type TeqFw_Di_Internal_Logger_Noop = typeof import("./src/Internal/Logger.mjs").TeqFw_Di_Internal_Logger_Noop;
  type TeqFw_Di_Node_Registry_Namespace = import("./src/Node/Registry/Namespace.mjs").default;
  type TeqFw_Di_Node_Registry_Namespace_Entry = Readonly<{prefix: string, dirAbs: string, ext: string}>;
  type TeqFw_Di_Node_Registry_Namespace__Class = typeof import("./src/Node/Registry/Namespace.mjs").default;
  type TeqFw_Di_Node_Registry_Package = import("./src/Node/Registry/Package.mjs").default;
  type TeqFw_Di_Node_Registry_Package_Record = Readonly<{name: string, rootAbs: string, rootReal: string, packageJson: Readonly<Record<string, unknown>>, dependencies: ReadonlyArray<string>}>;
  type TeqFw_Di_Node_Registry_Package__Class = typeof import("./src/Node/Registry/Package.mjs").default;
  type TeqFw_Di_Parser = import("./src/Parser.mjs").default;
}

declare const Container: TeqFw_Di_Container__Class;
export default Container;

export {};
