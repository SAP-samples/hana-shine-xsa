/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, no-use-before-define: 0, new-cap:0 */
"use strict";
var express = require("express");

module.exports = function() {
	var bodyParser = require('body-parser');
	var app = express.Router();

	var winston = require('winston');
	var util = require(global.__base + "utils/util");
	var jobsc = require('@sap/jobs-client');
	var jsonParser = bodyParser.json();
	
	var logger;

	winston.level = process.env.winston_level || 'error';

	app.post('/createjobschedule',jsonParser, function(req, res) {
		logger = req.loggingContext.getLogger("/schedules/createjobschedule");
		logger.error('info' + req.body);
		var jname = req.body.jobname;
		if (!(util.isAlphaNumeric(jname))) {
			// throw new Error("Invalid Job Name");
			logger.error('inside job name error');
			util.callback(new Error("Invalid Job Name"), res, "Invalid Job Name");
			return;
		}
		var description = req.body.description;
		if (!(util.isAlphaNumericAndSpace(description))) {
			util.callback(new Error("Invalid Job Description"), res, "Invalid Job Description");
			return;
		}
		//var juser = req.body.user;
		//if (juser == null || juser === undefined || juser === "") {
		//	util.callback(new Error("Invalid User"), res, "Invalid User");
		//	return;
		//}
		var startTime = req.body.starttime;
		if (!(util.isValidDate(startTime))) {
			util.callback(new Error("Invalid Start Time"), res, "Invalid Start Time");
			return;
		}
		var endTime = req.body.endtime;
		if (!(util.isValidDate(endTime))) {
			util.callback(new Error("Invalid End Time"), res, "Invalid End Time");
			return;
		}
		var cron = req.body.cron;
		if (cron == null || cron === undefined || cron === "") {
			util.callback(new Error("Invalid CRON"), res, "Invalid CRON");
			return;
		}

		var jobid;
		var options = util.appconfig();
		var appUrl = req.body.appurl;
		var client = req.db;
		var scheduleId;
		//var dePwd = new Buffer(req.body.password, 'base64');
		//var jpwd = dePwd.toString();
		var myJob = {
			"name": jname,
			"description": description,
			"action": appUrl,
			"active": true,
			"httpMethod": "POST",
			"schedules": [{
				"cron": cron,
				"description": description,
				"data": {
					"jobname": jname
				},
				"active": true,
				"startTime": {
					"date": startTime,
					"format": "YYYY-MM-DD HH:mm:ss Z"
				},
				"endTime": {
					"date": endTime,
					"format": "YYYY-MM-DD HH:mm:ss Z"
				}
			}]
		};
		var scheduler = new jobsc.Scheduler(options);
		var scJob = {
			job: myJob
		};
		scheduler.createJob(scJob, function(error, body) {
			if (error) {
				if((error.message).includes("xscron")){
					util.callback(error, res, "Invalid xscron");
				}else{
					util.callback(error, res, "Error registering new job ");
				}
				logger.error('Error occured' + error);
			} else {
				jobid = body._id;
				scheduleId = body.schedules[0].scheduleId;

				var upJob = {
					"jobId": jobid,
					"job": {
						"active": true
						//"user": juser,
						//"password": jpwd
					}
				};
				//scheduler.updateJob(upJob, function(error, body) {
				//	if (error) {
				//		util.callback(error, res, "Error registering new job ");
				//		logger.error('Error occured' + error);
				//	} else {
						var sql = "INSERT INTO \"Jobs.ScheduleDetails\" VALUES(?,?,?,?,?,?)";
						client.prepare(sql, function(error, stmt) {
							if (error) {
								logger.error('Error occured' + error);
								util.callback(error, res, "Unable to insert new job details to db");
							} else {
								var params = [jobid.toString(), jname, startTime, endTime, cron, scheduleId];
								stmt.exec(params, function(err, rows) {
									if (err) {
										logger.error('Error occured' + err);
										util.callback(err, res, "Unable to insert new job details to db");
									} else {
										res.status(200).send(JSON.stringify({
											JobId: jobid,
											JobName: jname,
											Desc: description,
											StartTime: startTime,
											EndTime: endTime,
											Cron: cron,
											ScheduleId: scheduleId
										}));
									}
								});
							}
						});
					}

				//});

			//}

		});

	});

	app.get('/getjobschedules', function(req, res) {
		logger = req.loggingContext.getLogger("/schedules/getjobschedules");
		var client = req.db;

		var query = 'SELECT "JOBID","NAME","STARTTIME","ENDTIME","CRON" FROM "Jobs.ScheduleDetails"';
		var jobArray = [];
		var jobObj = {};
		client.exec(query, function(error, rows) {
			if (error) {
				logger.error('Error occured' + error);
				util.callback(error, res, "Job fetching failed");
			} else {
				for (var i in rows) {
					jobObj = {
						"JobId": rows[i].JOBID,
						"JobName": rows[i].NAME,
						"StartTime": rows[i].STARTTIME,
						"EndTime": rows[i].ENDTIME,
						"Cron": rows[i].CRON
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

	app.get('/getjobschedulesbyname/:name', function(req, res) {
		logger = req.loggingContext.getLogger("/schedules/getjobschedulesbyname");
		var client = req.db;
		var name = req.params.name;
		var sql = 'SELECT "JOBID","NAME" FROM "Jobs.ScheduleDetails" WHERE NAME= ?';
		var jobArray = [];
		var jobObj = {};
		client.prepare(sql, function(error, stmt) {
			if (error) {
				logger.error('Error occured' + error);
				util.callback(error, res, "Job Schedule fetching failed");
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

	app.delete('/deletejobschedules/:jobid', function(req, res) {
		logger = req.loggingContext.getLogger("/schedules/deletejobschedules");
		var client = req.db;
		var jobId = req.params.jobid;
		var scheduleId;
		var options = util.appconfig();
		var jobName = 'Null';
		var sql = 'SELECT "SCHEDULE", "NAME" FROM "Jobs.ScheduleDetails" WHERE JOBID=?';
		client.prepare(sql, function(error, stmt) {
			if (error) {
				logger.error('Error occured' + error);
				util.callback(error, res, "Job Schedule fetching failed");
			} else {
				var params = [jobId];
				stmt.exec(params, function(err, rows) {
					if (err) {
						logger.error('Error occured' + err);
						util.callback(err, res, "Job fetching failed");
					} else {
						scheduleId = rows[0].SCHEDULE;
						jobName = rows[0].NAME;
						var myJob = {
							"jobId": jobId,
							"scheduleId": scheduleId
						};
						var scheduler = new jobsc.Scheduler(options);
						scheduler.deleteJobSchedule(myJob, function(error, body) {
							if (error) {
								util.callback(error, res, "Error deleteing new job ");
								logger.error('Error occured' + error);
							} else {
								var query = 'DELETE FROM "Jobs.ScheduleDetails" WHERE JOBID=' + jobId;
								client.exec(query, function(error, rows) {
									if (error) {
										logger.error('Error occured' + error);
										util.callback(error, res, "Job fetching failed");

									} else {
										res.writeHead(200, {
											"Content-Type": "application/json"
										});
										res.end(JSON.stringify({
											"message": "Schedule for job " + jobName + " is deleted"
										}));
									}
								});
							}
						});
					}
				});
			}
		});

	});

	return app;
};