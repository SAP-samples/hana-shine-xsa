/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, no-use-before-define: 0, new-cap:0 */
"use strict";
const express = require("express");

module.exports = () => {
	const app = express.Router();
	const util = require(global.__base + "utils/util");
	let logger;

	// method will delete all job data
	app.delete('/deletedata', (req, res) => {
		logger = req.loggingContext.getLogger("/jobs/deletedata");
		let query = 'truncate table "Jobs.Data"';
		const client = req.db;
		client.exec(query, (error, rows) => {
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

	app.get('/getalljobs', (req, res) => {
		logger = req.loggingContext.getLogger("/jobs/getalljobs");
		const client = req.db;
		const query = 'SELECT "ID","NAME", "TIMESTAMP" FROM "Jobs.Data"';
		let jobArray = [];
		let jobObj = {};
		client.exec(query, (error, rows) => {
			if (error) {
				logger.error('Error occured' + error);
				util.callback(error, res, "Job fetching failed");
			} else {
				for (let i in rows) {
					jobObj = {
						"Id": rows[i].ID,
						"Name": rows[i].NAME,
						"TimeStamp": rows[i].TIMESTAMP
					};
					jobArray.push(jobObj);
				}
				res.writeHead(200, { "Content-Type": "application/json" });
				res.end(JSON.stringify(jobArray));
			}
		});
	});

	app.get('/getjobsbyname/:name', (req, res) => {
		logger = req.loggingContext.getLogger("/jobs/getjobsbyname");
		const client = req.db;
		const name = req.params.name;
		const sql = 'SELECT "ID","NAME", "TIMESTAMP" FROM "Jobs.Data" WHERE NAME =?';
		let jobArray = [];
		let jobObj = {};
		client.prepare(sql, (error, stmt) => {
			if (error) {
				logger.error('Error occured' + error);
				util.callback(error, res, "Job fetching failed");
			} else {
				let params = [name];
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
						res.writeHead(200, { "Content-Type": "application/json" });
						res.end(JSON.stringify(jobArray));
					}
				});
			}
		});
	});
	return app;
};