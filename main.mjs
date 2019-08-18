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
container.addSourceMapping("TeqFw_Sample", "../example");
// get object by ID from container
container.get("TeqFw_Sample_App")
    .then(function (app) {
        app.run();
    });