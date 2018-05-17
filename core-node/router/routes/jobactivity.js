/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, no-use-before-define: 0, new-cap:0, no-undef:0 */
'use strict';
var express = require('express');

module.exports = function() {
	var app = express.Router();
	var winston = require('winston');
	var util = require(global.__base + 'utils/util');
	var bodyParser = require('body-parser');
	var jsonParser = bodyParser.json();
	var logger;
    var xssec = require('@sap/xssec');
	var xsenv = require('@sap/xsenv');
	var uaaService = xsenv.getServices({
		uaa: {
			tag: 'xsuaa'
		}
	});
	winston.level = process.env.winston_level || 'error';
	var xsuaaCredentials = uaaService.uaa;
	if (!xsuaaCredentials) {
		logger.error('uaa service not found');
		res.status(401).json({message: 'uaa service not found'});
		return;
	}
	var SCOPE = xsuaaCredentials.xsappname + '.JOBSCHEDULER';

	// method will insert Job Data into Job table
	app.post('/create',jsonParser,function(req, res) {
			logger = req.loggingContext.getLogger('/jobactivity/create');
			var client = req.db;
			var query = 'select "jobId".NEXTVAL as nJobId from "DUMMY"';
			var jname = req.body.jobname;
			var jobid;
			var timestamp;
			var accessToken;
			if (req.headers.authorization) {
				accessToken = req.headers.authorization.split(' ')[1];
			}else {
				logger.error('Authorization header not found');
				res.status(401).json({message: 'Authorization header not found'});
				return;
			}
			xssec.createSecurityContext(accessToken, xsuaaCredentials, function(error, securityContext) {
			if (error) {
				logger.error('Invalid access token');
				res.status(401).json({message: 'Invalid access token'});
				return;
			}

			if (securityContext.checkScope(SCOPE)) {
				client.exec(query, function(error, rows) {
						if (error) {
							logger.error('Error occured' + error);
						} else {
							jobid = rows[0].NJOBID;
							timestamp = new Date().toISOString();
							query = "INSERT INTO \"Jobs.Data\" VALUES('" + jobid.toString() + "','" + jname + "','" + timestamp +
								"')";
							client.exec(query, function(error, status) {
								if (error) {
									logger.error('Error occured' + error);
									res.status(401).json({message: 'couldnt insert record to SHINE'});

								} else {
									res.status(200).json({status: 'record inserted into shine'});
								}
							});

						}
					});
				//	client.close();
			} else {
				logger.error('Unauthorized, Scope required is missing');
				res.status(401).json({message: 'Unauthorized, Scope required is missing'});
				return;
			}
		});
	});
	return app;
};
