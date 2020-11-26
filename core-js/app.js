'use strict';
const https = require('https');
const xssec = require('@sap/xssec');
const express = require('express');
const passport = require('passport');
const hdbext = require('@sap/hdbext');
const routes = require('./routes/index');
const xsenv = require('@sap/xsenv');
const xsjs = require('@sap/xsjs');
const logging = require('@sap/logging');
const appContext = logging.createAppContext();

const PORT = process.env.PORT || 3000;
const app = express();
https.globalAgent.options.ca = xsenv.loadCertificates();

/**
 * Setup JWT authentication strategy
 * The default UAA credentials can be overriden
 * by defining a user defined service called 'uaa'.
 */
passport.use('JWT', new xssec.JWTStrategy(xsenv.getServices({
	uaa: {
		tag: 'xsuaa'
	}
}).uaa));

app.use(logging.middleware({ appContext: appContext, logNetwork: true }));
app.use(passport.initialize());

 let hanaOptions = xsenv.getServices({	
		hana: process.env.HANA_SERVICE_NAME || { tag: 'hana' }
}).hana;

app.use('/',
	passport.authenticate('JWT', {
		session: false
	}),
	hdbext.middleware(hanaOptions),
	routes.datagen,
	routes.get,
	routes.reset);

	let options = {// anonymous : true, // remove to authenticate calls
		redirectUrl: "/index.xsjs"
	};

	//configure HANA
	try {
		options = Object.assign(options, xsenv.getServices({
			hana: {
				tag: "hana"
			}
		}));
	} catch (err) {
		console.error(err);
	}

	// configure UAA
	try {
		options = Object.assign(options, xsenv.getServices(
			{  uaa:{name:process.env.UAA_SERVICE_NAME} }
		));
	} catch (err) {
		console.error(err);
	}

	//configure Audit log

	// try {
	// 	options = Object.assign(options, xsenv.getServices({ auditLog: {tag: "auditlog"} }));
	// } catch (err) {
	// 	console.log("[WARN]", err.message);
	// }

// start server
const xsjsApp = xsjs(options);
app.use(xsjsApp);

//start the HTTP server
app.listen(PORT, () => {
	console.log('Server running on http://localhost:' + PORT);
});