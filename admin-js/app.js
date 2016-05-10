'use strict';
var http = require('http');
var xssec = require('sap-xssec');
var express = require('express');
var passport = require('passport');
var sap_hdb_conn = require('sap-hdb-connection');
var routes = require('./routes/index');
var winston = require('winston');
var xsenv = require('sap-xsenv');

var PORT = process.env.PORT || 3000;
var app = express();

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
app.use('/',
    passport.authenticate('JWT', {session: false}),
    sap_hdb_conn.middleware(),
    routes.datagen,
    routes.get,
    routes.reset);

//start the HTTP server
app.listen(PORT, function () {
    console.log('Server running on http://localhost:' + PORT);
});
