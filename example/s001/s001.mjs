/**
 * This script can be used from browser:
 *  "<script type="module" src="./s001.mjs"></script>"
 *
 * or from nodejs:
 *  "nodejs --experimental-modules ./s001.mjs"
 */
// load DI container sources (use relative path both for front & back)
import Container from "../../src/Container.mjs";

// create new container and configure it
/** @type {TeqFw_Di_Container} */
const container = new Container();
// relative sources are mapped relatively to this script
container.addSourceMapping("Sample", "../../example/s001/src");
// get object by ID from container then run
container.get("Sample_App").then(app => app.run());