/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, no-use-before-define: 0, new-cap:0, no-undef:0 */
/*eslint-env node, es6*/
'use strict';
var express = require('express');
//var JobSchedulerDB = require('./JobSchedulerDBPromises');

module.exports = function() {
	var app = express.Router();
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
			var jname = req.body.jobname;
			var jobid;
			var timestamp;
			var accessToken;
			
			if (req.headers.authorization) {
				accessToken = req.headers.authorization.split(' ')[1];
				// console.log("AccessToken++++++++ " +accessToken);
			}else {
				logger.error('Authorization header not found');
				res.status(401).json({message: 'Authorization header not found'});
				return;
			}
			xssec.createSecurityContext(accessToken, xsuaaCredentials, function(error, securityContext) {
			if (error) {
				console.log(error);
				logger.error('Invalid access token');
				res.status(401).json({message: 'Invalid access token'});
				return;
			}
			if (securityContext.checkScope(SCOPE)) {			
				const dbClass = require(global.__base + "utils/dbPromises");
				let db = new dbClass(req.db);
				
				var query = 'select "jobId".NEXTVAL as nJobId from "DUMMY"';
				
				db.preparePromisified(query)
				.then(statement => {
					db.statementExecPromisified(statement, [])
					.then(results => {
						jobid = results[0].NJOBID;
						timestamp = new Date().toISOString();
						//create job
						var query = "INSERT INTO \"Jobs.Data\" VALUES('" + jobid.toString() + "','" + jname + "','" + timestamp + "')";
						db.preparePromisified(query)
						.then(statement => {
							db.statementExecPromisified(statement, [])
							.then(results => {
								console.log("++++ Record inserted .....");
								res.status(200).json({status: 'record inserted into shine'});
							})
							.catch((error) => {
								logger.error('Error occured' + error);
								res.status(500).json({message: 'error in create job, could not insert data into job table'});
							})
						})
						.catch((error) => {
							logger.error('Error occured' + error);
							res.status(500).json({message: 'error in prepare statement'});
						})
						
						
					})
					.catch((error) => {
						logger.error('Error occured' + error);
						res.status(500).json({message: 'couldnt get New JobID'});
					})
				})
				.catch((error) => {
					logger.error('Error occured' + error);
					res.status(500).json({message: 'error in prepare statement'});
				})
				
				
				
				/*var js = new JobSchedulerDB(req);
				js.getNewJobId()
				.then((rows) => {
					jobid = rows[0].NJOBID;
					timestamp = new Date().toISOString();
				
					js.createJob(jobid,timestamp,jname)
					.then((status) => {
						console.log("Record inserted .....");
						res.status(200).json({status: 'record inserted into shine'});
					})
					.then(() => {
						js.closeDB();
					})
					.catch((error) => {
						js.closeDB();
						logger.error('Error occured' + error);
						res.status(401).json({message: 'couldnt insert record to SHINE'});
					});
				})
				.then(() => {
					js.closeDB();
				})
				.catch((error) => {
					js.closeDB();
					logger.error('Error occured' + error);
				});*/
			} else {
				logger.error('Unauthorized, Scope required is missing');
				res.status(401).json({message: 'Unauthorized, Scope required is missing'});
				return;
			}
		});
	});
	return app;
};
