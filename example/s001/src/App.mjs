export default class Sample_App {
    /**
     * Use default instances for 'Sample_App_Config', 'Sample_App_HandlerA' & 'Sample_App_HandlerB' dependencies.
     * Container creates named (default) instance (with '$' char in the dependency id) on the first call
     * and saves it to internal registry for all subsequent calls.
     *
     * @param {Sample_App_Config} Sample_App_Config$
     * @param {Sample_App_HandlerA} Sample_App_HandlerA$
     * @param {Sample_App_HandlerB} Sample_App_HandlerB$
     */
    constructor({Sample_App_Config$, Sample_App_HandlerA$, Sample_App_HandlerB$}) {
        this.name = "Sample_App";

        /**
         * @memberOf Sample_App.prototype
         */
        this.run = function () {
            const dep1 = Sample_App_Config$.name;
            const dep2 = Sample_App_HandlerA$.name;
            const dep3 = Sample_App_HandlerB$.name;
            console.log(`Application '${this.name}' is running (deps: [${dep1}, ${dep2}, ${dep3}]).`);
            Sample_App_HandlerA$.process();
            Sample_App_HandlerB$.process();
        }
    }
}