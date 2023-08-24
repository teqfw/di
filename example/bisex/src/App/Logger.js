/**
 * Factory function to inject dependencies and create a logging function.
 *
 * @param {Sample_App_Config} config - default export
 * @namespace Sample_App_Logger
 */
export default function (
    {
        Sample_App_Config: config,
    }
) {
    /**
     * Logs the `msg` to the console with the app name prefix.
     *
     * @param {string} msg
     */
    function Sample_App_Logger(msg) {
        console.log(`${config.name}: ${msg}`);
    }

    // MAIN
    Sample_App_Logger(`Creating logger for '${config.name}'.`);
    return Sample_App_Logger;
}
