/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, no-use-before-define: 0, new-cap:0 */
"use strict";
const express = require("express");

module.exports = () => {
	const app = express.Router();
	// const util = require(global.__base + "utils/util");
	const jsonParser = require('body-parser').json();
	let logger;
    const xssec = require('@sap/xssec');
	const xsenv = require('@sap/xsenv');
	const uaaService = xsenv.getServices({
		uaa: {
			tag: "xsuaa"
		}
	});
	const xsuaaCredentials = uaaService.uaa;
	if (!xsuaaCredentials) {
		console.error('uaa service not found');
		res.status(401).json({ message: "uaa service not found" });
		//util.callback(new Error("uaa service not found"), res, "uaa service not found");
		return;
	}
	const SCOPE = xsuaaCredentials.xsappname + '.JOBSCHEDULER';
	// method will insert Job Data into Job table
	app.post('/create',jsonParser,(req, res) => {
		logger = req.loggingContext.getLogger("/jobactivity/create");
		const client = req.db;
		let query = 'select "jobId".NEXTVAL as nJobId from "DUMMY"';
		const jname = req.body.jobname;
		let jobid;
		let timestamp;
        let access_token;
		if (req.headers.authorization) {
			access_token = req.headers.authorization.split(' ')[1];
			// console.log('Access Token ======>>>>>>',access_token)
    	} else {
        	logger.error('Authorization header not found');
            res.status(401).json({ message: "Authorization header not found" });
			//util.callback(new Error("Authorization header not found"), res, "Authorization header not found");
			return;
		}
    	xssec.createSecurityContext(access_token, xsuaaCredentials, (error, securityContext) => {
			if (error) {
				logger.error('Invalid access token');
				res.status(401).json({ message: "Invalid access token" });
				//util.callback(new Error("Invalid access token"), res, "Invalid access token");
				return;
			}
        	if (securityContext.checkScope(SCOPE)) {
                client.exec(query, (error, rows) => {
					if (error) {
						//util.callback(error, res, "");
						logger.error('Error occured' + error);
					} else {
						jobid = rows[0].NJOBID;
						timestamp = new Date().toISOString();
						query = "INSERT INTO \"Jobs.Data\" VALUES('" + jobid.toString() + "','" + jname + "','" + timestamp + "')";
						client.exec(query, (error, status) => {
							if (error) {
								logger.error('Error occured' + error);
								//util.callback(error, res, "Job Creation Failed");
								res.status(401).json({ message: "couldnt insert record to SHINE" });
							} else {
								res.status(200).json({ status: 'record inserted into shine' });
							}
						});
					}
				});
        	} else {
				logger.error('Unauthorized, Scope required is missing');
				res.status(401).json({ message: "Unauthorized, Scope required is missing" });
				//util.callback(new Error("Unauthorized, Scope required is missing"), res, "Unauthorized, Scope required is missing");
				return;
			}
		});
	});
	return app;
};