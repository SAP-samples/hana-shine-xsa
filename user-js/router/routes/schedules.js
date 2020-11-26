/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, no-use-before-define: 0, new-cap:0 */
"use strict";
const express = require("express");

module.exports = () => {
	const app = express.Router();
	const util = require(global.__base + "utils/util");
	const jobsc = require('@sap/jobs-client');
	const jsonParser = require('body-parser').json();	
	let logger;

	app.post('/createjobschedule',jsonParser, (req, res) => {
		// let access_token = req.headers.authorization.split(' ')[1];
		// console.log('Access Token ======>>>>>>',access_token)
		logger = req.loggingContext.getLogger("/schedules/createjobschedule");
		logger.info('req body',JSON.stringify(req.body,null,2));
		const jname = encodeURI(req.body.jobname);
		if (!(util.isAlphaNumeric(jname))) {
			logger.error('inside job name error');
			util.callback(new Error("Invalid Job Name"), res, "Invalid Job Name");
			return;
		}
		const description = req.body.description;
		if (!(util.isAlphaNumericAndSpace(description))) {
			util.callback(new Error("Invalid Job Description"), res, "Invalid Job Description");
			return;
		}
		let startTime = req.body.starttime;
		if (!(util.isValidDate(startTime))) {
			util.callback(new Error("Invalid Start Time"), res, "Invalid Start Time");
			return;
		}
		let endTime = req.body.endtime;
		if (!(util.isValidDate(endTime))) {
			util.callback(new Error("Invalid End Time"), res, "Invalid End Time");
			return;
		}
		const cron = req.body.cron;
		if (cron == null || cron === undefined || cron === "") {
			util.callback(new Error("Invalid CRON"), res, "Invalid CRON");
			return;
		}

		let jobid;
		let options = util.appconfig();
		const appUrl = req.body.appurl;
		const client = req.db;
		let scheduleId;
		const myJob = {
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
		// console.log('schedule payload', JSON.stringify(myJob,null,2))
		const scheduler = new jobsc.Scheduler(options);
		const scJob = {
			job: myJob
		};
		scheduler.createJob(scJob, (error, body) => {
			if (error) {
				if((error.message).includes("xscron")){
					util.callback(error, res, "Invalid xscron");
				}else{
					util.callback(error, res, "Error registering new job ");
				}
				logger.error('Error occured: ' + JSON.stringify(error,null,2));
			} else {
				// console.log('schedule =====>>>>',JSON.stringify(body,null,2))
				jobid = body._id;
				scheduleId = body.schedules[0].scheduleId;
				startTime = startTime.split(" ")[0] + " "+ startTime.split(" ")[1];
				endTime = endTime.split(" ")[0] + " "+ endTime.split(" ")[1];
				const sql = "INSERT INTO \"Jobs.ScheduleDetails\" VALUES(?,?,?,?,?,?)";
				client.prepare(sql, (error, stmt) => {
					if (error) {
						logger.error('Error occured: ' + JSON.stringify(error,null,2));
						util.callback(error, res, "Unable to insert new job details to db");
					} else {
						const params = [jobid.toString(), jname, startTime, endTime, cron, scheduleId];
						// console.log('jobscheduler params ====>>>>', params)
						stmt.exec(params, (err, rows) => {
							if (err) {
								logger.error('Error occured =>' + JSON.stringify(err,null,2));
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
	});

	app.get('/getjobschedules', (req, res) => {
		logger = req.loggingContext.getLogger("/schedules/getjobschedules");
		const client = req.db;

		const query = 'SELECT "JOBID","NAME","STARTTIME","ENDTIME","CRON" FROM "Jobs.ScheduleDetails"';
		let jobArray = [];
		let jobObj = {};
		client.exec(query, (error, rows) => {
			if (error) {
				logger.error('Error occured' + error);
				util.callback(error, res, "Job fetching failed");
			} else {
				for (let i in rows) {
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

	app.get('/getjobschedulesbyname/:name', (req, res) => {
		logger = req.loggingContext.getLogger("/schedules/getjobschedulesbyname");
		const client = req.db;
		const name = req.params.name;
		const sql = 'SELECT "JOBID","NAME" FROM "Jobs.ScheduleDetails" WHERE NAME= ?';
		let jobArray = [];
		let jobObj = {};
		client.prepare(sql, (error, stmt) => {
			if (error) {
				logger.error('Error occured' + error);
				util.callback(error, res, "Job Schedule fetching failed");
			} else {
				const params = [name];
				stmt.exec(params, (err, rows) => {
					if (err) {
						logger.error('Error occured' + err);
						util.callback(err, res, "Job fetching failed");
					} else {
						for (let i in rows) {
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

	app.delete('/deletejobschedules/:jobid', (req, res) => {
		logger = req.loggingContext.getLogger("/schedules/deletejobschedules");
		const client = req.db;
		const jobId = req.params.jobid;
		let scheduleId;
		const options = util.appconfig();
		let jobName = 'Null';
		const sql = 'SELECT "SCHEDULE", "NAME" FROM "Jobs.ScheduleDetails" WHERE JOBID=?';
		client.prepare(sql, (error, stmt) => {
			if (error) {
				logger.error('Error occured' + error);
				util.callback(error, res, "Job Schedule fetching failed");
			} else {
				const params = [jobId];
				stmt.exec(params, (err, rows) => {
					if (err) {
						logger.error('Error occured' + err);
						util.callback(err, res, "Job fetching failed");
					} else {
						scheduleId = rows[0].SCHEDULE;
						jobName = rows[0].NAME;
						const myJob = {
							"jobId": jobId,
							"scheduleId": scheduleId
						};
						const scheduler = new jobsc.Scheduler(options);
						scheduler.deleteJobSchedule(myJob, (error, body) => {
							if (error) {
								util.callback(error, res, "Error deleteing new job ");
								logger.error('Error occured' + error);
							} else {
								const query = 'DELETE FROM "Jobs.ScheduleDetails" WHERE JOBID=' + jobId;
								client.exec(query, (error, rows) => {
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