"use strict";

const port = process.env.PORT || 3000;
const server = require("http").createServer();
global.__base = __dirname + "/";
const init = require(global.__base + "utils/initialize");

//Initialize Express App for XSA UAA and HDBEXT Middleware
const app = init.initExpress();

//Initialize the XSJS Compatibility Layer
init.initXSJS(app);

//Start the Server 
server.on("request", app);
server.listen(port, () => {
	console.info("HTTP Server: " + server.address().port);
});
