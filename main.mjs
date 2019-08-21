/**
 * This script can be used from browser:
 *  "<script type="module" src="./main.mjs"></script>"
 *
 * or from nodejs:
 *  "nodejs --experimental-modules ./main.mjs"
 */
import Container from "./src/Container.mjs";

// create new container and configure it
const container = new Container();
// TMP: sources are mapped related to "./src/Container" script
container.addSourceMapping("Vendor_Module", "../example");
// get object by ID from container
container.get("Vendor_Module_App")
    .then(/** @type {Vendor_Module_App} */(app) => {
        app.run();
    });