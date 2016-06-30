var express = require('express');
var router = express.Router();
var winston = require('winston');
var util = require('./util');

var logger;

winston.level = process.env.winston_level || 'error'
// method will insert Job Data into Job table
router.post('/jobactivity/create', function(req, res) {
	logger = req.loggingContext.getLogger("/jobactivity/create");
	var client = req.db;
	var query = 'select "sap.hana.democontent.epm.data::jobId".NEXTVAL as nJobId from "sap.hana.democontent.epm.data::DUMMY"';
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
			query = "INSERT INTO \"sap.hana.democontent.epm.data::Jobs.Data\" VALUES('" + jobid.toString() + "','" + jname + "','" + timestamp +
				"')";
			client.exec(query, function(error, status) {
				if (error) {
					logger.error('Error occured' + error);
					util.callback(error, res, "Job Creation Failed");

				} else {
					res.writeHead(200, {
										"Content-Type": "application/json"
									});
					res.end(JSON.stringify({"message":"One record inserted to Job Data table for Job "+jname}));

				}
			});

		}
	});

});
module.exports = router;