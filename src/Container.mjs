export default class TeqFw_Di_Container {
    constructor() {
        const _sources = new Map();
        console.log("DI container is created.");

        this.get = async function (object_name) {
            console.log(`Create object with ID '${object_name}'.`);
            const ModuleConfig = await import("../example/Config.mjs");
            const ModuleService = await import("../example/Service.mjs");
            const ModuleApp = await import("../example/App.mjs");

            const config = new ModuleConfig.default();
            const service = new ModuleService.default({TeqFw_Sample_Config: config});
            const app = new ModuleApp.default({TeqFw_Sample_Config: config, TeqFw_Sample_Service: service});

            return app;
        };

        this.addSourceMapping = function (namespace, path) {
            _sources.set(namespace, path);
        }
    }

}