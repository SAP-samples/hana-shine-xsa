/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, no-use-before-define: 0, new-cap:0, linebreak-style: ["error", "windows"], no-undef:0*/
/*eslint-env node, es6*/
'use strict';
var Promise = require('promise');

//Job Scheduler Database access using promises
class JobSchedulerDB {
	constructor(req){
		this.client = req.db;
	}
	
	//get new job id from dummy
	getNewJobId(){
		var query = 'select "jobId".NEXTVAL as nJobId from "DUMMY"';
		return new Promise((resolve,reject) => {
			this.client.exec(query,(err,rows) => {
				if(err){
					return reject(err);
				}
					return resolve(rows);
			});
		});
	}
	
	//create job schedule
	createJobSchedule(data){
		var query = 'INSERT INTO \"Jobs.ScheduleDetails\" VALUES(?,?,?,?,?,?)';
		return new Promise((resolve,reject) => {
			this.client.prepare(query,(err,stmt) => {
				if(err){
					return reject(err);
				}
				var sql = stmt;
				sql.exec(data, (err,status) => {
					if(err){
						return reject(err);
					}
					return resolve(status);
				});
			});
		});
	}
	
	//get job schedules by name
	getJobSchedulesByName(name){
		var query = 'SELECT "JOBID","NAME" FROM "Jobs.ScheduleDetails" WHERE NAME= ?';
		return new Promise((resolve,reject) => {
			this.client.prepare(query,(err,stmt) => {
				if(err){
					return reject(err);
				}
				var sql = stmt;
				sql.exec(name, (err,rows) => {
					if(err){
						return reject(err);
					}
					return resolve(rows);
				});
			});
		});
	}
	
	//get job schedules by job id
	getJobSchedulesById(id){
		var query = 'SELECT "SCHEDULE", "NAME" FROM "Jobs.ScheduleDetails" WHERE JOBID=?';
		return new Promise((resolve,reject) => {
			this.client.prepare(query,(err,stmt) => {
				if(err){
					return reject(err);
				}
				var sql = stmt;
				sql.exec(id, (err,rows) => {
					if(err){
						return reject(err);
					}
					return resolve(rows);
				});
			});
		});
	}
	
	//delete job schedules
	/*deleteJobSchedulesById(id){
		var jobId = id;
		var query = 'DELETE FROM "Jobs.ScheduleDetails" WHERE JOBID=' + jobId;
		return new Promise((resolve,reject) => {
			this.client.exec(query,(err,status) => {
				if(err){
					return reject(err);
				}
					return resolve(status);
			});
		});
	}*/
	
	deleteJobSchedulesById(scheduler,job,jobId,client){
		return new Promise((resolve,reject) => {
			scheduler.deleteJobSchedule(job, (error,response) => {
				if(error){
					return reject(error);
				}
				var query = 'DELETE FROM "Jobs.ScheduleDetails" WHERE JOBID=' + jobId;
				client.exec(query, (error,status) => {
					if(error){
						return reject(error);
					}	
					return resolve(status);
				});
			});
		});
	}
	
	//get job schedules
	getJobSchedules(){
		var query = 'SELECT "JOBID","NAME","STARTTIME","ENDTIME","CRON" FROM "Jobs.ScheduleDetails"';
		return new Promise((resolve,reject) => {
			this.client.exec(query,(err,rows) => {
				if(err){
					return reject(err);
				}
					return resolve(rows);
			});
		});
	}
	
	//create new job
	createJob(jobid,timestamp,jname){
		var query = "INSERT INTO \"Jobs.Data\" VALUES('" + jobid.toString() + "','" + jname + "','" + timestamp + "')";
		return new Promise((resolve,reject) => {
			this.client.exec(query,(err,status) => {
				if(err){
					return reject(err);
				}
					return resolve(status);
			});
		});
	}
	
	//delete all triggered jobs data 
	deleteTriggeredJobsData(){
		var query = 'truncate table "Jobs.Data"';
		return new Promise((resolve,reject) => {
			this.client.exec(query,(err,rows) => {
				if(err){
					return reject(err);
				}
					return resolve();
			});
		});
	}
	
	//get all jobs count
	getJobsCount(){
		var query = 'select count(*) as COUNT from "Jobs.ScheduleDetails"';
		return new Promise((resolve,reject) => {
			this.client.exec(query,(err,rows) => {
				if(err){
					return reject(err);
				}
					return resolve(rows);
			});
		});
	}
	
	//get jobs data
	getAllJobs(){
		var query = 'SELECT "ID","NAME", "TIMESTAMP" FROM "Jobs.Data"';
		return new Promise((resolve,reject) => {
			this.client.exec(query,(err,rows) => {
				if(err){
					return reject(err);
				}
					return resolve(rows);
			});
		});
	}
	
	//get job by name
	getJobsByName(name){
		var query = 'SELECT "ID","NAME", "TIMESTAMP" FROM "Jobs.Data" WHERE NAME =?';
		return new Promise((resolve,reject) => {
			this.client.prepare(query,(err,stmt) => {
				if(err){
					return reject(err);
				}
				var sql = stmt;
				sql.exec(name, (err,rows) => {
					if(err){
						return reject(err);
					}
					return resolve(rows);
				});
			});
		});
	}
	closeDB(){
		return new Promise((resolve,reject) => {
			this.client.close(err => {
				if(err){
					return reject(err);
				}
				resolve();	
			});	
		});
	}
}
module.exports = JobSchedulerDB;
