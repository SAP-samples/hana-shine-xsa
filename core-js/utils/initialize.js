/*eslint no-console: 0, no-unused-vars: 0*/
"use strict";
module.exports = {
	initExpress: function() {
		var https = require('https');
		var xssec = require('@sap/xssec');
		var express = require('express');
		var passport = require('passport');
		var hdbext = require('@sap/hdbext'); 
		var routes = require('../routes/index');
		var winston = require('winston');
		var xsenv = require('@sap/xsenv');
		var PORT = process.env.PORT || 3000;
		var app = express();
		https.globalAgent.options.ca= xsenv.loadCertificates(); 
		//log level
		winston.level = process.env.winston_level || 'error';
		
		/**
		 * Setup JWT authentication strategy
		 * The default UAA credentials can be overriden
		 * by defining a user defined service called 'uaa'.
		 */
		passport.use('JWT', new xssec.JWTStrategy(xsenv.getServices({uaa:{tag:'xsuaa'}}).uaa));
		
		
		//use passport for authentication
		app.use(passport.initialize());
		
		/*
		 * Use JWT password policy for all routes. 
		 *
		 * use database connection pool provided by sap_hdb_conn
		 * provides a db property containing the connection
		 * object to the request object of all routes.
		 */
		 var hanaOptions = xsenv.getServices({	
			hana: process.env.HANA_SERVICE_NAME || { tag: 'hana' }
		}).hana;

		app.use('/',
		    passport.authenticate('JWT', {session: false}),
		    hdbext.middleware(hanaOptions),
		    routes.datagen,
		    routes.get,
		    routes.reset);
		
		//start the HTTP server
		
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
