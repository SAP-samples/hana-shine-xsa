/*eslint no-console: 0*/
"use strict";
var https= require('https');
var express = require('express');
var passport = require('passport');
var xssec = require('@sap/xssec');
var routes = require('./routes/index');
var hdbext = require('@sap/hdbext');
var bodyParser = require('body-parser');
var logging = require('@sap/logging');
var xsenv = require('@sap/xsenv');
var appContext = logging.createAppContext();
var app = express();
var PORT = process.env.PORT || 3000;

https.globalAgent.options.ca= xsenv.loadCertificates(); 

passport.use('JWT', new xssec.JWTStrategy(xsenv.getServices({uaa:{tag:'xsuaa'}}).uaa));
app.use(logging.expressMiddleware(appContext));
app.use(bodyParser.json());
//use passport for authentication
app.use(passport.initialize());
var hanaOptions = xsenv.getServices({	
		hana: process.env.HANA_SERVICE_NAME || { tag: 'hana' }
}).hana;

app.use('/',hdbext.middleware(hanaOptions),
           passport.authenticate('JWT', {session: false}),
           routes.jobs,
           routes.schedules,
           routes.jobactivity);
//start the HTTP server
app.listen(PORT, function () {
    console.log('Server running on http://localhost:' + PORT);
});