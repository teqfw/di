type TeqFw_Di_Def_Parser = InstanceType<typeof import("./src2/Def/Parser.mjs").default>;
export type TeqFw_Di_Container_Instantiate_ExportSelector = InstanceType<
  typeof import("./src2/Container/Instantiate/ExportSelector.mjs").default
>;
type TeqFw_Di_DepId = InstanceType<typeof import("./src2/Dto/DepId.mjs").default>;
type TeqFw_Di_Dto_Resolver_Config = InstanceType<typeof import("./src2/Dto/Resolver/Config.mjs").default>;
type TeqFw_Di_Dto_Resolver_Config_Namespace = InstanceType<
  typeof import("./src2/Dto/Resolver/Config/Namespace.mjs").default
>;
type TeqFw_Di_Resolver = InstanceType<typeof import("./src2/Resolver.mjs").default>;

export type TeqFw_Di_DepId$DTO = typeof import("./src2/Dto/DepId.mjs").DTO;
export type TeqFw_Di_DepId$DTO$ = InstanceType<TeqFw_Di_DepId$DTO>;
export type TeqFw_Di_Dto_Resolver_Config$DTO = typeof import("./src2/Dto/Resolver/Config.mjs").DTO;
export type TeqFw_Di_Dto_Resolver_Config$DTO$ = InstanceType<TeqFw_Di_Dto_Resolver_Config$DTO>;
export type TeqFw_Di_Dto_Resolver_Config_Namespace$DTO = typeof import("./src2/Dto/Resolver/Config/Namespace.mjs").DTO;
export type TeqFw_Di_Dto_Resolver_Config_Namespace$DTO$ = InstanceType<TeqFw_Di_Dto_Resolver_Config_Namespace$DTO>;

export {};

declare global {
  type TeqFw_Di_Def_Parser = InstanceType<typeof import("./src2/Def/Parser.mjs").default>;
  type TeqFw_Di_DepId = InstanceType<typeof import("./src2/Dto/DepId.mjs").default>;
  type TeqFw_Di_DepId$DTO = import("./src2/Dto/DepId.mjs").DTO;
  type TeqFw_Di_Dto_Resolver_Config = InstanceType<typeof import("./src2/Dto/Resolver/Config.mjs").default>;
  type TeqFw_Di_Dto_Resolver_Config$DTO = import("./src2/Dto/Resolver/Config.mjs").DTO;
  type TeqFw_Di_Dto_Resolver_Config_Namespace = InstanceType<
    typeof import("./src2/Dto/Resolver/Config/Namespace.mjs").default
  >;
  type TeqFw_Di_Dto_Resolver_Config_Namespace$DTO = typeof import("./src2/Dto/Resolver/Config/Namespace.mjs").DTO;
  type TeqFw_Di_Dto_Resolver_Config_Namespace$DTO$ = InstanceType<TeqFw_Di_Dto_Resolver_Config_Namespace$DTO>;
  type TeqFw_Di_Enum_Composition = typeof import("./src2/Enum/Composition.mjs").default;
  type TeqFw_Di_Enum_Life = typeof import("./src2/Enum/Life.mjs").default;
  type TeqFw_Di_Enum_Platform = typeof import("./src2/Enum/Platform.mjs").default;
  type TeqFw_Di_Resolver = InstanceType<typeof import("./src2/Resolver.mjs").default>;
}
