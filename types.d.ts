type TeqFw_Di_Container_A_Composer = InstanceType<typeof import("./src/Container/A/Composer.js").default>;
type TeqFw_Di_Container_A_Composer_A_SpecParser = typeof import("./src/Container/A/Composer/A/SpecParser.js").default;
type TeqFw_Di_Container_A_Parser_Chunk_Def = InstanceType<typeof import("./src/Container/A/Parser/Chunk/Def.js").default>;
type TeqFw_Di_Container_A_Parser_Chunk_V02X = InstanceType<typeof import("./src/Container/A/Parser/Chunk/V02X.js").default>;
type TeqFw_Di_Container_Parser = InstanceType<typeof import("./src/Container/Parser.js").default>;
type TeqFw_Di_Container_PostProcessor = InstanceType<typeof import("./src/Container/PostProcessor.js").default>;
type TeqFw_Di_Container_PreProcessor = InstanceType<typeof import("./src/Container/PreProcessor.js").default>;
type TeqFw_Di_Container_Resolver = InstanceType<typeof import("./src/Container/Resolver.js").default>;
type TeqFw_Di_Def_Parser = InstanceType<typeof import("./src2/Def/Parser.mjs").default>;
type TeqFw_Di_Dto_Resolver_Config = InstanceType<typeof import("./src2/Dto/Resolver/Config.mjs").default>;
type TeqFw_Di_Dto_Resolver_Config_Namespace = InstanceType<typeof import("./src2/Dto/Resolver/Config/Namespace.mjs").default>;
export type TeqFw_Di_Dto_Resolver_Config_Namespace$DTO = typeof import("./src2/Dto/Resolver/Config/Namespace.mjs").DTO;
export type TeqFw_Di_Dto_Resolver_Config_Namespace$DTO$ = InstanceType<TeqFw_Di_Dto_Resolver_Config_Namespace$DTO>;

declare global {
  type TeqFw_Di_Api_Container_Parser = InstanceType<typeof import("./src/Api/Container/Parser.js").default>;
  type TeqFw_Di_Api_Container_Parser_Chunk = InstanceType<typeof import("./src/Api/Container/Parser/Chunk.js").default>;
  type TeqFw_Di_Api_Container_PostProcessor = InstanceType<typeof import("./src/Api/Container/PostProcessor.js").default>;
  type TeqFw_Di_Api_Container_PostProcessor_Chunk = InstanceType<typeof import("./src/Api/Container/PostProcessor/Chunk.js").default>;
  type TeqFw_Di_Api_Container_PreProcessor = InstanceType<typeof import("./src/Api/Container/PreProcessor.js").default>;
  type TeqFw_Di_Api_Container_PreProcessor_Chunk = InstanceType<typeof import("./src/Api/Container/PreProcessor/Chunk.js").default>;
  type TeqFw_Di_Api_Container_Resolver = InstanceType<typeof import("./src/Api/Container/Resolver.js").default>;
  type TeqFw_Di_Container = InstanceType<typeof import("./src/Container.js").default>;
  type TeqFw_Di_Container_Config = InstanceType<typeof import("./src/Container/Config.js").default>;
  type TeqFw_Di_Def_Parser = InstanceType<typeof import("./src2/Def/Parser.mjs").default>;
  type TeqFw_Di_Defs = typeof import("./src/Defs.js").default;
  type TeqFw_Di_DepId  = InstanceType<typeof import("./src2/Dto/DepId.mjs").default>;
  type TeqFw_Di_DepId$DTO = import("./src2/Dto/DepId.mjs").DTO;
  type TeqFw_Di_Dto_Resolver_Config$DTO = import("./src2/Dto/Resolver/Config.mjs").DTO;
  type TeqFw_Di_Enum_Composition = typeof import("./src2/Enum/Composition.mjs").default;
  type TeqFw_Di_Enum_Life = typeof import("./src2/Enum/Life.mjs").default;
  type TeqFw_Di_Enum_Platform = typeof import("./src2/Enum/Platform.mjs").default;
  type TeqFw_Di_Pre_Replace = InstanceType<typeof import("./src/Pre/Replace.js").default>;
}