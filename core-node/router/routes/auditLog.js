/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, no-use-before-define: 0, new-cap:0 */
/*eslint-env node, es6 */
'use strict';
var express = require('express');

module.exports = function() {
	var app = express.Router();

	var xsenv = require('@sap/xsenv');
	xsenv.loadEnv();
	var credentials = xsenv.getServices({
		auditlog: 'shine-auditlog'
	}).auditlog;

	var auditLog = require('@sap/audit-logging')
	var auditLogGlobal = null;
	auditLog.v2(credentials, function(err, audLog) {
		if (err) return console.log(err);
		auditLogGlobal = audLog
	});

	//TOC
	app.get('/', (req, res) => {
		var output = `<H1>Audit Log Examples</H1></br>
			<a href="${req.baseUrl}/example1">/example1</a> - Simple Audit Log Example</br>` +
			require(global.__base + "utils/exampleTOC").fill();
		res.type("text/html").status(200).send(output);
	});

	//Simple AuditLog Example
	app.get('/example1', (req, res) => {
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		if (req.headers['x-forwarded-for']) {
			ip = req.headers['x-forwarded-for'].split(",")[0];
		} else if (req.connection && req.connection.remoteAddress) {
			ip = req.connection.remoteAddress;
		} else {
			ip = req.ip;
		}

		auditLogGlobal.securityMessage('%d unsuccessful login attempts', 3)
		.by(req.user.id)
		.externalIP(ip)
		.log(function(err) {
			if (err) {
				res.type("text/plain").status(500).send("ERROR: " + err.toString());
				return;
			}
			res.type("application/json").status(200).send(JSON.stringify(`Log Entry Saved`));
		});
	});

	return app;
};
