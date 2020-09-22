/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, no-use-before-define: 0, new-cap:0 */
'use strict';

module.exports = function() {
	var express = require('express');
	var async = require('async');
	var util = require(global.__base + 'utils/datagen');
	var logger;
	var app = express.Router();
	app.get('/tablesize', function (req, res) {
		logger = req.loggingContext.getLogger("/tablesize");
		var client = req.db;
		var query, rs, maxId;
		query = 'SELECT * from "getTableSize"()';
		try {
			client.exec(query, function(error, result) {
				if (error) {
					logger.error('Error in getting table sizes' + error);
					console.log('error '+error);
				} else {
					console.log('result array in getTableSize '+JSON.stringify(result));
					res.writeHead(200, {'Content-Type' : 'application/json'});
					res.end(JSON.stringify(result));
				}
			});
		}catch (e) {
			console.log('inside getTableSize error ' + e.message);
		}
	});
	app.get('/tablesize1', function(req, res) {
		logger = req.loggingContext.getLogger('/get/tablesize');
		var client = req.db;
		var tableDict = [{
			"tableName": "MD.Addresses",
			"tableSynonym": "Address"
		}, {
			"tableName": "MD.BusinessPartner",
			"tableSynonym": "Business Partner"
		}, {
			"tableName": "Util.Constants",
			"tableSynonym": "Constants"
		}, {
			"tableName": "MD.Employees",
			"tableSynonym": "Employees"
		}, {
			"tableName": "Util.Messages",
			"tableSynonym": "Messages"
		}, {
			"tableName": "MD.Products",
			"tableSynonym": "Products"
		}, {
			"tableName": "PO.Header",
			"tableSynonym": "Purchase Order Headers"
		}, {
			"tableName": "PO.Item",
			"tableSynonym": "Purchase Order Items"
		}, {
			"tableName": "SO.Header",
			"tableSynonym": "Sales Order Headers"
		}, {
			"tableName": "SO.Item",
			"tableSynonym": "Sales Order Items"
		}, {
			"tableName": "Util.Texts",
			"tableSynonym": "Texts"
		}];
		async.parallel([
				function(callback) {
					util.getTableInfo(client,
						tableDict[0].tableName,
						tableDict[0].tableSynonym,
						callback);
				},
				function(callback) {
					util.getTableInfo(client,
						tableDict[1].tableName,
						tableDict[1].tableSynonym,
						callback);
				},
				function(callback) {
					util.getTableInfo(client,
						tableDict[2].tableName,
						tableDict[2].tableSynonym,
						callback);
				},
				function(callback) {
					util.getTableInfo(client,
						tableDict[3].tableName,
						tableDict[3].tableSynonym,
						callback);
				},
				function(callback) {
					util.getTableInfo(client,
						tableDict[4].tableName,
						tableDict[4].tableSynonym,
						callback);
				},
				function(callback) {
					util.getTableInfo(client,
						tableDict[5].tableName,
						tableDict[5].tableSynonym,
						callback);
				},
				function(callback) {
					util.getTableInfo(client,
						tableDict[6].tableName,
						tableDict[6].tableSynonym,
						callback);
				},
				function(callback) {
					util.getTableInfo(client,
						tableDict[7].tableName,
						tableDict[7].tableSynonym,
						callback);
				},
				function(callback) {
					util.getTableInfo(client,
						tableDict[8].tableName,
						tableDict[8].tableSynonym,
						callback);
				},
				function(callback) {
					util.getTableInfo(client,
						tableDict[9].tableName,
						tableDict[9].tableSynonym,
						callback);
				},
				function(callback) {
					util.getTableInfo(client,
						tableDict[10].tableName,
						tableDict[10].tableSynonym,
						callback);
				}
			],
			function(error, result) {
				if (error) {
					res.writeHead(500, {
						'Content-Type': 'text/plain'
					});
					//console.log(error);
					logger.info(error);
					res.end(error.message);
				} else {
					var combinedArray = [];
					for (var i = 0; i < result.length; i++) {
						combinedArray.push(result[i][0]);
					}
					res.writeHead(200, {
						'Content-Type': 'application/json'
					});
					res.end(JSON.stringify(combinedArray));
				}
			}
		);

	});

	app.get('/sessioninfo', function(req, res) {
		res.writeHead(200, {
			'Content-Type': 'application/json'
		});
		res.end(JSON.stringify({
			userEncoded: encodeURI(JSON.stringify(req.user))
		}));
	});

	return app;
};
