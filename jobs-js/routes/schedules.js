var express = require('express');
var router = express.Router();
var winston = require('winston');
var util = require('./util');
var jobsc = require('sap-jobs-client');

var logger;

winston.level = process.env.winston_level || 'error'

router.post('/schedules/createjobschedule', function(req, res) {
	logger = req.loggingContext.getLogger("/schedules/createjobschedule");
	logger.error('info' + req.body);
var jname = req.body.jobname;
	if(!(util.isAlphaNumeric(jname))){
		throw new Error("Invalid Job Name");
	}
	var description = req.body.description;
	if(!(util.isAlphaNumericAndSpace(description))){
		throw new Error("Invalid Job Description");
	}
	var juser = req.body.user;
	if(juser==null || juser===undefined || juser===""){
		throw new Error("Invalid Job User");
	}
	var startTime = req.body.starttime;
	if(!(util.isValidDate(startTime))){
		throw new Error("Invalid Start Time");
	}
	var endTime = req.body.endtime;
	if(!(util.isValidDate(endTime))){
		throw new Error("Invalid End Time");
	}
	var cron = req.body.cron;
	if(cron==null || cron===undefined || cron===""){
		throw new Error("Invalid Job User");
	}
	var jobid;
	var options = util.appconfig();
	var appUrl = req.body.appurl;
	var client = req.db;
	var scheduleId;
	var dePwd = new Buffer(req.body.password, 'base64');
	var jpwd = dePwd.toString();
	var myJob = {
		"name": jname,
		"description": description,
		"action": appUrl,
		"active": false,
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
			util.callback(error, res, "Error registering new job ");
			logger.error('Error occured' + error);
		} else {
			jobid = body._id;
			scheduleId = body.schedules[0].scheduleId;

			var upJob = {
				"jobId": jobid,
				"job": {
					"active": true,
					"user": juser,
					"password": jpwd
				}
			};
			scheduler.updateJob(upJob, function(error, body) {
				if (error) {
					util.callback(error, res, "Error registering new job ");
					logger.error('Error occured' + error);
				} else {
					var sql = "INSERT INTO \"sap.hana.democontent.epm.data::Jobs.ScheduleDetails\" VALUES(?,?,?,?,?,?)";
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

			});

		}

	});

});

router.get('/schedules/getjobschedules', function(req, res) {
	logger = req.loggingContext.getLogger("/schedules/getjobschedules");
	var client = req.db;

	var query = 'SELECT "JOBID","NAME","STARTTIME","ENDTIME","CRON" FROM "sap.hana.democontent.epm.data::Jobs.ScheduleDetails"';
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

router.get('/schedules/getjobschedulesbyname/:name', function(req, res) {
	logger = req.loggingContext.getLogger("/schedules/getjobschedulesbyname");
	var client = req.db;
	var name = req.params.name;
	var sql = 'SELECT "JOBID","NAME" FROM "sap.hana.democontent.epm.data::Jobs.ScheduleDetails" WHERE NAME= ?';
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

router.delete('/schedules/deletejobschedules/:jobid', function(req, res) {
	logger = req.loggingContext.getLogger("/schedules/deletejobschedules");
	var client = req.db;
	var jobId = req.params.jobid;
	var scheduleId;
	var options = util.appconfig();
	var jobName='Null';
	var sql = 'SELECT "SCHEDULE", "NAME" FROM "sap.hana.democontent.epm.data::Jobs.ScheduleDetails" WHERE JOBID=?';
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
					jobName= rows[0].NAME;
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
							var query = 'DELETE FROM "sap.hana.democontent.epm.data::Jobs.ScheduleDetails" WHERE JOBID=' + jobId;
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

module.exports = router;
