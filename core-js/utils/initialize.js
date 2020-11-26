/*eslint no-console: 0, no-unused-vars: 0*/
"use strict";
module.exports = {
	initExpress: () => {
		const https = require('https');
		const xssec = require('@sap/xssec');
		const express = require('express');
		const passport = require('passport');
		const hdbext = require('@sap/hdbext');
		const logging = require('@sap/logging');
		const xsenv = require('@sap/xsenv');

		const routes = require('../routes/index');
		const app = express();
		// loads the trusted CA certificates so they are used for all subsequent outgoing HTTPS connections
		https.globalAgent.options.ca= xsenv.loadCertificates();
		
		/**
		 * Setup JWT authentication strategy
		 * The default UAA credentials can be overriden
		 * by defining a user defined service called 'uaa'.
		 */
		passport.use('JWT', new xssec.JWTStrategy(xsenv.getServices({uaa:{tag:'xsuaa'}}).uaa));
		// setting up logging middleware
		const appContext = logging.createAppContext();
		app.use(logging.middleware({ appContext: appContext, logNetwork: true }));
		//use passport for authentication
		app.use(passport.initialize());

		let hanaOptions = xsenv.getServices({
			hana: process.env.HANA_SERVICE_NAME || { tag: 'hana' }
		}).hana;
		
		// @sap/hdbext provides a middleware which allows easy database connection creation
		app.use('/',
		    passport.authenticate('JWT', {session: false}),
		    hdbext.middleware(hanaOptions),
		    routes.datagen,
		    routes.get,
		    routes.reset);
		
		return app;
	},

	initXSJS: (app) => {
		const xsjs = require("@sap/xsjs");
		const xsenv = require("@sap/xsenv");
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
			options = Object.assign(options, xsenv.getServices({
				uaa: {
					tag: "xsuaa"
				}
			}));
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
	}
};
