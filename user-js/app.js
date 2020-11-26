"use strict";
const https= require('https');
const express = require('express');
const passport = require('passport');
const xssec = require('@sap/xssec');
const routes = require('./routes/index');
const hdbext = require('@sap/hdbext');
const bodyParser = require('body-parser');
const logging = require('@sap/logging');
const xsenv = require('@sap/xsenv');
const appContext = logging.createAppContext();
const app = express();
const PORT = process.env.PORT || 3000;

https.globalAgent.options.ca= xsenv.loadCertificates(); 

passport.use('JWT', new xssec.JWTStrategy(xsenv.getServices({uaa:{tag:'xsuaa'}}).uaa));
app.use(logging.expressMiddleware(appContext));
app.use(bodyParser.json());
//use passport for authentication
app.use(passport.initialize());
const hanaOptions = xsenv.getServices({	
		hana: process.env.HANA_SERVICE_NAME || { tag: 'hana' }
}).hana;

app.use('/',hdbext.middleware(hanaOptions),
    passport.authenticate('JWT', {session: false}),
    routes.jobs,
    routes.schedules,
    routes.jobactivity);
//start the HTTP server
app.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
});