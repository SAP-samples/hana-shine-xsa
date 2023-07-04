/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, no-use-before-define: 0, new-cap:0, no-undef:0 */
/*eslint-env node, es6*/

'use strict';
var express = require('express');
//var JobSchedulerDB = require('./JobSchedulerDBPromises');

module.exports = function() {
	var bodyParser = require('body-parser');
	var app = express.Router();
	var util = require(global.__base + 'utils/util');
	var jobsc = require('@sap/jobs-client');
	var jsonParser = bodyParser.json();
	var logger;

	app.post('/createJobSchedule', jsonParser, function(req, res) {
		logger = req.loggingContext.getLogger('/schedules/createJobSchedule');
		var jname = encodeURI(req.body.jobname);
		if (!(util.isAlphaNumeric(jname))) {
			logger.error('inside job name error');
			util.callback(new Error('Invalid Job Name'), res, 'Invalid Job Name');
			return;
		}
		var description = req.body.description;
		if (!(util.isAlphaNumericAndSpace(description))) {
			util.callback(new Error('Invalid Job Description'), res, 'Invalid Job Description');
			return;
		}
		var startTime = req.body.starttime;
		if (!(util.isValidDate(startTime))) {
			util.callback(new Error('Invalid Start Time'), res, 'Invalid Start Time');
			return;
		}
		var endTime = req.body.endtime;
		if (!(util.isValidDate(endTime))) {
			util.callback(new Error('Invalid End Time'), res, 'Invalid End Time');
			return;
		}
		var cron = req.body.cron;
		if (cron === null || cron === undefined || cron === "") {
			util.callback(new Error('Invalid CRON'), res, 'Invalid CRON');
			return;
		}

		var jobid;
		var options = util.appconfig();
		var appUrl = req.body.appurl;
		var scheduleId;
		var myJob = {
			'name': jname,
			'description': description,
			'action': appUrl,
			'active': true,
			'httpMethod': 'POST',
			'schedules': [{
				'cron': cron,
				'description': description,
				'data': {
					'jobname': jname
				},
				'active': true,
				'startTime': {
					'date': startTime,
					'format': 'YYYY-MM-DD HH:mm:ss Z'
				},
				'endTime': {
					'date': endTime,
					'format': 'YYYY-MM-DD HH:mm:ss Z'
				}
			}]
		};
		
		const dbClass = require(global.__base + "utils/dbPromises");
		let db = new dbClass(req.db);
		
		var scheduler = new jobsc.Scheduler(options);
		var scJob = {
			job: myJob
		};
		scheduler.createJob(scJob, function(error, body) {
			if (error) {
				if ((error.message).includes('xscron')) {
					util.callback(error, res, 'Invalid xscron');
				} else {
					util.callback(error, res, 'Error registering new job, Please check if a Job with the same name already exists in the Dashboard');
				}
				logger.error('Error occured' + error);
			} else {
				jobid = body._id;
				scheduleId = body.schedules[0].scheduleId;
				
				startTime = startTime.split(" ")[0] + " "+ startTime.split(" ")[1];
				endTime = endTime.split(" ")[0] + " "+ endTime.split(" ")[1];
				var params = [jobid.toString(), jname, startTime, endTime, cron, scheduleId];
				
				var query = 'INSERT INTO \"Jobs.ScheduleDetails\" VALUES(?,?,?,?,?,?)';
				db.preparePromisified(query)
				.then(statement => {
					db.statementExecPromisified(statement, params)
					.then(results => {
						res.status(200).send(JSON.stringify({
							JobId: jobid,
							JobName: jname,
							Desc: description,
							StartTime: startTime,
							EndTime: endTime,
							Cron: cron,
							ScheduleId: scheduleId
						}));
					})
					.catch((error) => {
						logger.error('Error occured: ' + JSON.stringify(error));
						util.callback(error, res, 'Unable to insert new job details to db');
					})
				})
				.catch((error) => {
					logger.error(error);
					logger.error('Error occured : ' + JSON.stringify(error));
					util.callback(error, res, 'Unable to prepare statement to insert new job details to db');
				})
			}
		});
	});

	app.get('/getJobSchedules', function(req, res) {
		logger = req.loggingContext.getLogger('/schedules/getJobSchedules');
		var jobArray = [];
		var jobObj = {};

		const dbClass = require(global.__base + "utils/dbPromises");
		let db = new dbClass(req.db);
		
		var query = 'SELECT "JOBID","NAME","STARTTIME","ENDTIME","CRON" FROM "Jobs.ScheduleDetails"';
		db.preparePromisified(query)
		.then(statement => {
			db.statementExecPromisified(statement, [])
			.then(rows => {
				for (var i in rows) {
					jobObj = {
						'JobId': rows[i].JOBID,
						'JobName': rows[i].NAME,
						'StartTime': rows[i].STARTTIME,
						'EndTime': rows[i].ENDTIME,
						'Cron': rows[i].CRON
					};
					jobArray.push(jobObj);
				}
				res.writeHead(200, {
					'Content-Type': 'application/json'
				});
				res.end(JSON.stringify(jobArray));
			})
			.catch((error) => {
				logger.error('Error occured' + error);
				util.callback(error, res, 'Job fetching failed');
			})
		})
		.catch((error) => {
			logger.error('Error occured' + error);
			util.callback(error, res, 'Job fetching failed');
		})
		
		/*var js = new JobSchedulerDB(req);
		js.getJobSchedules()
			.then((rows) => {
				for (var i in rows) {
					jobObj = {
						'JobId': rows[i].JOBID,
						'JobName': rows[i].NAME,
						'StartTime': rows[i].STARTTIME,
						'EndTime': rows[i].ENDTIME,
						'Cron': rows[i].CRON
					};
					jobArray.push(jobObj);
				}
				res.writeHead(200, {
					'Content-Type': 'application/json'
				});
				res.end(JSON.stringify(jobArray));
			})
			.then(() => {
				js.closeDB();
			})
			.catch((error) => {
				js.closeDB();
				logger.error('Error occured' + error);
				util.callback(error, res, 'Job fetching failed');
			});*/

	});

	app.get('/getJobSchedulesByName/:name', function(req, res) {
		logger = req.loggingContext.getLogger('/schedules/getJobSchedulesByName');
		var name = req.params.name;
		var jobArray = [];
		var jobObj = {};
		var params = [name];

		
		const dbClass = require(global.__base + "utils/dbPromises");
		let db = new dbClass(req.db);
		
		var query = 'SELECT "JOBID","NAME" FROM "Jobs.ScheduleDetails" WHERE NAME= ?';
		db.preparePromisified(query)
		.then(statement => {
			db.statementExecPromisified(statement, params)
			.then(rows => {
				for (var i in rows) {
					jobObj = {
						'Id': rows[i].ID,
						'Name': rows[i].NAME,
						'TimeStamp': rows[i].TIMESTAMP
					};
					jobArray.push(jobObj);
				}
				res.writeHead(200, {
					'Content-Type': 'application/json'
				});
				res.end(JSON.stringify(jobArray));
			})
			.catch((error) => {
				logger.error('Error occured' + error);
				util.callback(error, res, 'Job Schedule fetching failed');
			})
		})
		.catch((error) => {
			logger.error('Error occured' + error);
			util.callback(error, res, 'Job Schedule fetching failed');
		})
		
		/*var js = new JobSchedulerDB(req);

		js.getJobSchedulesByName(params)
			.then((rows) => {
				for (var i in rows) {
					jobObj = {
						'Id': rows[i].ID,
						'Name': rows[i].NAME,
						'TimeStamp': rows[i].TIMESTAMP
					};
					jobArray.push(jobObj);
				}
				res.writeHead(200, {
					'Content-Type': 'application/json'
				});
				res.end(JSON.stringify(jobArray));
			})
			.then(() => {
				js.closeDB();
			})
			.catch((error) => {
				js.closeDB();
				logger.error('Error occured' + error);
				util.callback(error, res, 'Job Schedule fetching failed');
			});*/
	});

	app.delete('/deleteJobSchedules/:jobid', function(req, res) {
		logger = req.loggingContext.getLogger('/schedules/deleteJobSchedules');
		var client = req.db;
		var jobId = req.params.jobid;
		var scheduleId;
		var options = util.appconfig();
		var jobName = 'Null';
	
			
		const dbClass = require(global.__base + "utils/dbPromises");
		let db = new dbClass(req.db);
		var query = 'SELECT "SCHEDULE", "NAME" FROM "Jobs.ScheduleDetails" WHERE JOBID=?';
		var params = [jobId];
			
		db.preparePromisified(query)
		.then(statement => {
			db.statementExecPromisified(statement, params)
			.then(rows => {
				scheduleId = rows[0].SCHEDULE;
				jobName = rows[0].NAME;
				var myJob = {
					'jobId': jobId,
					'scheduleId': scheduleId
				};
				var scheduler = new jobsc.Scheduler(options);
				scheduler.deleteJobSchedule(myJob, function(error, body) {
					if (error) {
						util.callback(error, res, 'Error deleteing new job ');
						logger.error('Error occured' + error);
					}else{
						var query = 'DELETE FROM "Jobs.ScheduleDetails" WHERE JOBID=' + jobId;
						db.preparePromisified(query)
						.then(statement => {
							db.statementExecPromisified(statement, [])
							.then(rows => {
								res.writeHead(200, {
									'Content-Type': 'application/json'
								});
								res.end(JSON.stringify({
									'message': 'Schedule for job ' + jobName + ' is deleted'
								}));
							})
							.catch((error) => {
								logger.error('Error occured' + err);
								util.callback(err, res, 'Deleting Job schedule failed');
							})
						})
						.catch((error) => {
							logger.error('Error occured' + err);
							util.callback(err, res, 'Deleting Job schedule failed');
						})
					}
				});
			})
			.catch((error) => {
				logger.error('Error occured' + err);
				util.callback(err, res, 'Job fetching failed');
			})
		})
		.catch((error) => {
			logger.error('Error occured' + error);
			util.callback(error, res, 'Job Schedule fetching failed');
		})
			
			
			
			
			
		//need to comment this section
		/*var sql = 'SELECT "SCHEDULE", "NAME" FROM "Jobs.ScheduleDetails" WHERE JOBID=?';
		try{
			client.prepare(sql, function(error, stmt) {
				if (error) {
					logger.error('Error occured' + error);
					util.callback(error, res, 'Job Schedule fetching failed');
				} else {
					var params = [jobId];
					stmt.exec(params, function(err, rows) {
						if (err) {
							logger.error('Error occured' + err);
							util.callback(err, res, 'Job fetching failed');
						} else {
							scheduleId = rows[0].SCHEDULE;
							jobName = rows[0].NAME;
							var myJob = {
								'jobId': jobId,
								'scheduleId': scheduleId
							};
							var scheduler = new jobsc.Scheduler(options);
							scheduler.deleteJobSchedule(myJob, function(error, body) {
								if (error) {
									util.callback(error, res, 'Error deleteing new job ');
									logger.error('Error occured' + error);
								} else {
									var query = 'DELETE FROM "Jobs.ScheduleDetails" WHERE JOBID=' + jobId;
									client.exec(query, function(error, rows) {
										if (error) {
											logger.error('Error occured' + error);
											client.close();
											util.callback(error, res, 'Job fetching failed');

										} else {
											res.writeHead(200, {
												'Content-Type': 'application/json'
											});
											res.end(JSON.stringify({
												'message': 'Schedule for job ' + jobName + ' is deleted'
											}));
											client.close();
										}
									});
								}
							});
						}
					});
				}
			});
		}catch(error){
			logger.error(error);
		}finally{
			
		}*/

	});

	return app;
};
