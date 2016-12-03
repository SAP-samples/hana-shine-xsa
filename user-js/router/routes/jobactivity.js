/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, no-use-before-define: 0, new-cap:0 */
"use strict";
var express = require("express");

module.exports = function() {
	var app = express.Router();
	var winston = require('winston');
	var util = require(global.__base + "utils/util");
	var bodyParser = require('body-parser');
	var jsonParser = bodyParser.json();
	var logger;

	winston.level = process.env.winston_level || 'error';
	// method will insert Job Data into Job table
	app.post('/create',jsonParser,function(req, res) {
		logger = req.loggingContext.getLogger("/jobactivity/create");
		var client = req.db;
		var query = 'select "jobId".NEXTVAL as nJobId from "DUMMY"';
		var jname = req.body.jobname;
		var jobid;
		var timestamp;
		client.exec(query, function(error, rows) {
			if (error) {
				util.callback(error, res, "");
				logger.error('Error occured' + error);
			} else {
				jobid = rows[0].NJOBID;
				timestamp = new Date().toISOString();
				query = "INSERT INTO \"Jobs.Data\" VALUES('" + jobid.toString() + "','" + jname + "','" + timestamp +
					"')";
				client.exec(query, function(error, status) {
					if (error) {
						logger.error('Error occured' + error);
						util.callback(error, res, "Job Creation Failed");

					} else {
						res.writeHead(200, {
							"Content-Type": "application/json"
						});
						res.end(JSON.stringify({
							"message": "One record inserted to Job Data table for Job " + jname
						}));

					}
				});

			}
		});

	});
	return app;
};