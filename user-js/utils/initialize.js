/*eslint no-console: 0, no-unused-vars: 0*/
"use strict";
module.exports = {
	initExpress: function() {
		var xsenv = require("@sap/xsenv");
		var passport = require("passport");
		var xssec = require("@sap/xssec");
		var xsHDBConn = require("@sap/hdbext");
		var express = require("express");
		var bodyParser = require('body-parser');

		//logging
		var logging = require("@sap/logging");
		var appContext = logging.createAppContext();

		//Initialize Express App for XS UAA and HDBEXT Middleware
		var app = express();
		passport.use("JWT", new xssec.JWTStrategy(xsenv.getServices({
			uaa: {
				tag: "xsuaa"
			}
		}).uaa));
		app.use(logging.expressMiddleware(appContext));
		// app.use(bodyParser.json());
		app.use(passport.initialize());
		var hanaOptions = xsenv.getServices({	
			hana: { tag: 'hana' }
		}).hana;

	app.use("/jobactivity",
			xsHDBConn.middleware(hanaOptions));
		app.use("/jobs",
			passport.authenticate("JWT", {
				session: false
			}),
			xsHDBConn.middleware(hanaOptions));
		app.use("/schedules",
		passport.authenticate("JWT", {
				session: false
			}),
			xsHDBConn.middleware(hanaOptions));	
		//		app.use(xsHDBConn.middleware()); 	
		return app;
	},

	initXSJS: function(app) {
		var xsjs = require("@sap/xsjs");
		var xsenv = require("@sap/xsenv");
		var options = {// anonymous : true, // remove to authenticate calls
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

		// start server
		var xsjsApp = xsjs(options);
		app.use(xsjsApp);
	}
};