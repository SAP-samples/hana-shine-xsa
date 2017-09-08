/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, no-use-before-define: 0, new-cap:0 */
"use strict";
var express = require("express");

module.exports = function() {
	var app = express.Router();

	var winston = require('winston');
	var util = require(global.__base + "utils/util");

	var logger;

	winston.level = process.env.winston_level || 'error';

	// method will delete all job data
	app.delete('/deletedata', function(req, res) {
		logger = req.loggingContext.getLogger("/jobs/deletedata");
		var query = 'truncate table "Jobs.Data"';
		var client = req.db;
		client.exec(query, function(error, rows) {
			if (error) {
				logger.error('Error occured' + error);
				util.callback(error, res, "");
			} else {
				res.writeHead(200, {
					"Content-Type": "application/json"
				});
				res.end(JSON.stringify({
					"message": " All records in Jobs Data table deleted"
				}));
			}
		});

	});

	app.get('/getalljobs', function(req, res) {
		logger = req.loggingContext.getLogger("/jobs/getalljobs");
		var client = req.db;
		var query = 'SELECT "ID","NAME", "TIMESTAMP" FROM "Jobs.Data"';
		var jobArray = [];
		var jobObj = {};
		client.exec(query, function(error, rows) {
			if (error) {
				logger.error('Error occured' + error);
				util.callback(error, res, "Job fetching failed");
			} else {
				for (var i in rows) {
					jobObj = {
						"Id": rows[i].ID,
						"Name": rows[i].NAME,
						"TimeStamp": rows[i].TIMESTAMP
					};
					jobArray.push(jobObj);
				}
				res.writeHead(200, {
					"Content-Type": "application/json"
				});
				res.end(JSON.stringify(jobArray));
			}
		});
	});

	app.get('/getjobsbyname/:name', function(req, res) {
		logger = req.loggingContext.getLogger("/jobs/getjobsbyname");
		var client = req.db;
		var name = req.params.name;
		var sql = 'SELECT "ID","NAME", "TIMESTAMP" FROM "Jobs.Data" WHERE NAME =?';
		var jobArray = [];
		var jobObj = {};
		client.prepare(sql, function(error, stmt) {
			if (error) {
				logger.error('Error occured' + error);
				util.callback(error, res, "Job fetching failed");
			} else {
				var params = [name];
				stmt.exec(params, function(err, rows) {
					if (err) {
						logger.error('Error occured' + err);
						util.callback(err, res, "Job fetching failed");
					} else {
						for (var i in rows) {
							jobObj = {
								"Id": rows[i].ID,
								"Name": rows[i].NAME,
								"TimeStamp": rows[i].TIMESTAMP
							};
							jobArray.push(jobObj);
						}
						res.writeHead(200, {
							"Content-Type": "application/json"
						});
						res.end(JSON.stringify(jobArray));
					}
				});
			}
		});
	});
	return app;
};