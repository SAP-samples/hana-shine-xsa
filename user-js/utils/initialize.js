/*eslint no-console: 0, no-unused-vars: 0*/
"use strict";
module.exports = {
	initExpress: () => {
		const xsenv = require("@sap/xsenv");
		const passport = require("passport");
		const xssec = require("@sap/xssec");
		const xsHDBConn = require("@sap/hdbext");
		const express = require("express");

		//logging
		const logging = require("@sap/logging");
		const appContext = logging.createAppContext();

		//Initialize Express App for XS UAA and HDBEXT Middleware
		const app = express();
		passport.use("JWT", new xssec.JWTStrategy(xsenv.getServices({
			uaa: {
				tag: "xsuaa"
			}
		}).uaa));
		app.use(logging.middleware({ appContext: appContext, logNetwork: true }));
		app.use(passport.initialize());
		let hanaOptions = xsenv.getServices({
			hana: { tag: 'hana' }
		}).hana;

		app.use("/jobactivity", xsHDBConn.middleware(hanaOptions));
		app.use("/jobs", passport.authenticate("JWT", {	session: false }), xsHDBConn.middleware(hanaOptions));
		app.use("/schedules", passport.authenticate("JWT", { session: false }), xsHDBConn.middleware(hanaOptions));
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