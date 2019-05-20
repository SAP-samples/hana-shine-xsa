/*eslint no-console: 0, no-unused-vars: 0*/
"use strict";

var xsjs = require("@sap/xsjs");
var xsenv = require("@sap/xsenv");
var port = process.env.PORT || 3000;

var options = {
	anonymous: false, // remove to authenticate calls
	auditLog: {
		logToConsole: true
	}, // change to auditlog service for productive scenarios
	redirectUrl: "/index.xsjs"
};

// configure HANA
var op = xsenv.filterCFServices({
	label: 'hana',
	plan: 'hdi-shared'
})[0].credentials;

var hana_options = {
	'hana': op
};
try {
	options = Object.assign(options, hana_options);
} catch (err) {
	console.log("[WARN]", err.message);
}

// configure UAA
try {
	options = Object.assign(options, xsenv.getServices({
		uaa: {
			tag: "xsuaa"
		}
	}));
} catch (err) {
	console.log("[WARN]", err.message);
}

// start server
xsjs(options).listen(port);

console.log("Server listening on port %d", port);