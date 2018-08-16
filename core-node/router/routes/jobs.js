/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, no-use-before-define: 0, new-cap:0, linebreak-style: ["error", "windows"], no-undef:0*/
'use strict';
var express = require('express');

module.exports = function() {
	var app = express.Router();

	var winston = require('winston');
	var util = require(global.__base + "utils/util");

	var logger;

	winston.level = process.env.winston_level || 'error';

	// method will delete all job data
	app.delete('/deleteData', function(req, res) {
		logger = req.loggingContext.getLogger('/jobs/deleteData');
		var query = 'truncate table "Jobs.Data"';
		var client = req.db;
		try{
			client.exec(query, function(error, rows) {
				if (error) {
					logger.error('Error occured' + error);
					util.callback(error, res, "");
				} else {
					res.writeHead(200, {
						'Content-Type': 'application/json'
					});
					res.end(JSON.stringify({
						'message': 'All records in Jobs Data table deleted'
					}));
				}
			});
		}catch(error){
			logger.error("ERORR : "+error);
		}finally{
			client.close();
		}

	});
	app.get('/getJobsCount', function(req, res) {
		logger = req.loggingContext.getLogger('/jobs/getJobsCount');
		var client = req.db;
		var query = 'select count(*) as COUNT from "Jobs.ScheduleDetails"';
		var jobArray = [];
		var jobObj = {};
		var jsonString = '{"d":'+'{"icon": "sap-icon://time-entry-request","info":" ",';
		var jsonString3 = '"numberDigits": 1,"subtitle": "No of Jobs"}}';
		try{
			client.exec(query, function(error, rows) {
				if (error) {
					logger.error('Error occured' + error);
					util.callback(error, res, 'Data Unavailable');
				} else {
					console.log("rows"+Object.keys(rows));
					if(rows.length>=1){
						console.log("rows[0] "+rows[0]);
						var count =  rows[0].COUNT;
						console.log("rowsLength"+rows.length);
						console.log("count"+count);
						var numberStateString = '"numberState": "Positive",';
						if(count > 0){
							numberStateString = '"numberState": "Positive",';
						}else{
							numberStateString = '"numberState": "Negative",';
						}
						var jsonString2 = '"number":'+count+','+numberStateString;
						var responseString = jsonString+jsonString2+jsonString3;
						console.log("response string"+responseString);
						var Response = JSON.parse(responseString);
						console.log("Response"+Response);
						res.writeHead(200, {
							"Content-Type": "application/json"
						});
						res.end(JSON.stringify(Response));
					}
				}
			});
		}catch(error){
			logger.error("ERROR : "+error);
		}finally{
			client.close();
		}
	});

	app.get('/getAllJobs', function(req, res) {
		logger = req.loggingContext.getLogger("/jobs/getAllJobs");
		var client = req.db;
		var query = 'SELECT "ID","NAME", "TIMESTAMP" FROM "Jobs.Data"';
		var jobArray = [];
		var jobObj = {};
		try{
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
		}catch(error){
			logger.error("ERROR : "+error);
		}finally{
			client.close();
		}
	});

	app.get('/getJobsByName/:name', function(req, res) {
		logger = req.loggingContext.getLogger("/jobs/getJobsByName");
		var client = req.db;
		var name = req.params.name;
		var sql = 'SELECT "ID","NAME", "TIMESTAMP" FROM "Jobs.Data" WHERE NAME =?';
		var jobArray = [];
		var jobObj = {};
		try{
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
		}catch(error){
			logger.error("ERROR : "+error);
		}finally{
			client.close();
		}
	});
	return app;
};
