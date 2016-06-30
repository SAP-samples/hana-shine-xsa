var express = require('express');
var router = express.Router();
var winston = require('winston');
var util = require('./util');

var logger;

winston.level = process.env.winston_level || 'error'

// method will delete all job data
router.delete('/jobs/deletedata', function(req, res) {
	logger = req.loggingContext.getLogger("/jobs/deletedata");
	var query = 'truncate table "sap.hana.democontent.epm.data::Jobs.Data"';
	var client = req.db;
	client.exec(query, function(error, rows) {
		if (error) {
			logger.error('Error occured' + error);
			util.callback(error, res, "");
		} else {
			res.writeHead(200, {
										"Content-Type": "application/json"
									});
					res.end(JSON.stringify({"message":" All records in Jobs Data table deleted"}));
		}
	});

});

router.get('/jobs/getalljobs', function(req, res) {
	logger = req.loggingContext.getLogger("/jobs/getalljobs");
	var client = req.db;
	var query = 'SELECT "ID","NAME", "TIMESTAMP" FROM "sap.hana.democontent.epm.data::Jobs.Data"';
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

router.get('/jobs/getjobsbyname/:name', function(req, res) {
	logger = req.loggingContext.getLogger("/jobs/getjobsbyname");
	var client = req.db;
	var name = req.params.name;
	var sql = 'SELECT "ID","NAME", "TIMESTAMP" FROM "sap.hana.democontent.epm.data::Jobs.Data" WHERE NAME =?';
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

module.exports = router;