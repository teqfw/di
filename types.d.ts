type TeqFw_Di_Container_A_Composer = InstanceType<typeof import("./src/Container/A/Composer.js").default>;
type TeqFw_Di_Container_A_Composer_A_SpecParser = import("./src/Container/A/Composer/A/SpecParser.js").default;
type TeqFw_Di_Container_A_Parser_Chunk_Def = InstanceType<typeof import("./src/Container/A/Parser/Chunk/Def.js").default>;
type TeqFw_Di_Container_A_Parser_Chunk_V02X = InstanceType<typeof import("./src/Container/A/Parser/Chunk/V02X.js").default>;
type TeqFw_Di_Container_Parser = InstanceType<typeof import("./src/Container/Parser.js").default>;
type TeqFw_Di_Container_PostProcessor = InstanceType<typeof import("./src/Container/PostProcessor.js").default>;
type TeqFw_Di_Container_PreProcessor = InstanceType<typeof import("./src/Container/PreProcessor.js").default>;
type TeqFw_Di_Container_Resolver = InstanceType<typeof import("./src/Container/Resolver.js").default>;

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
  type TeqFw_Di_Defs = import("./src/Defs.js").default;
  type TeqFw_Di_DepId = InstanceType<typeof import("./src/DepId.js").default>;
  type TeqFw_Di_Pre_Replace = InstanceType<typeof import("./src/Pre/Replace.js").default>;
}

export {};
