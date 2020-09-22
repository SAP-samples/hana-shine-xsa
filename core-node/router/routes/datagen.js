/*eslint-env node, es6*/
/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, no-use-before-define: 0, new-cap:0, no-undef:0 */
module.exports = function() {
	//var DataGeneratorDB = require('./DataGeneratorDBPromises');
	var express = require('express');
	var util = require('./util');
	var logger;
	var bodyParser = require('body-parser');
	var jsonParser = bodyParser.json();
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
	
	var app = express.Router();
	//Generate time based Data
	app.post('/timebasedPO', jsonParser, (req, res) => {
		logger = req.loggingContext.getLogger('/replicate/timebasedPO');
		logger.info('Time based Sales Data generation initiated');
		var totalRecords = encodeURI((req.body.noRec)) * 1000;
		var id = req.body.id;
		//var query;
		var procedure;
		var inputParams;

		function convertDate(d) {
			console.log("inside func");
			var parts = d.split(" ");
			var months = {
				Jan: "01",
				Feb: "02",
				Mar: "03",
				Apr: "04",
				May: "05",
				Jun: "06",
				Jul: "07",
				Aug: "08",
				Sep: "09",
				Oct: "10",
				Nov: "11",
				Dec: "12"
			};

			return parts[2] + "." + months[parts[1]] + "." + parts[3];
		}
		var aStartDate = req.body.startdate;
		aStartDate = convertDate(aStartDate);
		var aStr = aStartDate.replace(/%20/g, ' ');
		var aEndDate = req.body.enddate;
		aEndDate = convertDate(aEndDate);
		if (id === 'PurchaseOrderId') {
			//query = "CALL \"load_data_PO\"(START_DATE => '" + aStartDate + "',END_DATE => '" + aEndDate + "',ANOREC => " + totalRecords +
			//	",RES => ?)";
			procedure = "load_data_PO";
			inputParams = {
				"START_DATE":aStartDate,
				"END_DATE": aEndDate,
				"ANOREC": totalRecords
			}
		} else {
			//query = "CALL \"load_data_SO\"(START_DATE => '" + aStartDate + "',END_DATE => '" + aEndDate + "',ANOREC => " + totalRecords +
				//",RES => ?)";
			procedure = "load_data_SO";
			inputParams = {
				"START_DATE":aStartDate,
				"END_DATE": aEndDate,
				"ANOREC": totalRecords
			}
		}
		
		/*var dg = new DataGeneratorDB(req);
		dg.executeQuery(query)
			.then((status) => {
				if (id === 'PurchaseOrderId') {
					res.json({
						status: 200,
						message: 'Purchase orders generated successfully, records added: ' + totalRecords
					});
				} else {
					res.json({
						status: 200,
						message: 'Sales orders generated successfully, records added: ' + totalRecords
					});
				}
			})
			.then(() => {
				dg.closeDB();
			})
			.catch((error) => {
				dg.closeDB();
				res.json({
					status: 401,
					message: 'ERR',
					data: err
				});
			});*/
		
		const dbClass = require(global.__base + "utils/dbPromises");
		let db = new dbClass(req.db);
		let hdbext = require("@sap/hdbext");
		
		db.loadProcedurePromisified(hdbext, null, procedure)
		.then(sp => {
			db.callProcedurePromisified(sp,inputParams)
			.then(({parameters,results}) => {
				if (id === 'PurchaseOrderId') {
					res.json({
						status: 200,
						message: 'Purchase orders generated successfully, records added: ' + totalRecords
					});
				} else {
					res.json({
						status: 200,
						message: 'Sales orders generated successfully, records added: ' + totalRecords
					});
				}
			})
			.catch((error) => {
				res.json({
					status: 500,
					message: 'ERR while calling procedure',
					data: error
				});
			})
		})
		.catch((error) => {
			res.json({
				status: 500,
				message: 'ERR while loading procedure',
				data: error
			});
		})
		
	});

	// method will pick records from SOShadow.Header and add to SO.Header
	// and SOShadow.Item to SO.Item
	app.post('/sales', (req, res) => {
		// console.log('auditLogGlobal ----->>>>', auditLogGlobal)
		// console.log('req.baseUrl -------->>>>>>>', JSON.stringify(req.baseUrl,null,2))
		// console.log('req.ip -------->>>>>>>', JSON.stringify(req.ip,null,2))
		// console.log('req.body -------->>>>>>>', JSON.stringify(req.body,null,2))
		// console.log('req.user -------->>>>>>>', JSON.stringify(req.user,null,2))
		// console.log('req.db -------->>>>>>>', JSON.stringify(req.db,null,2))
		// console.log('req.connection -------->>>>>>>', req.connection)
		// console.log('req.headers -------->>>>>>>', JSON.stringify(req.headers,null,2))
		// console.log('req.loggingContext -------->>>>>>>', req.loggingContext)
		// console.log('req.authInfo -------->>>>>>>', req.authInfo)
		// console.log('req -------->>>>>>>', req)
		var usrName = req.user.id;
		var client = req.db;
		logger = req.loggingContext.getLogger('/replicate/sales');
		logger.info('Sales Data generation initiated');
		msg = auditLogGlobal.update({ type: 'Data Generator', id:{ api: '/replicate/sales'}})
			.attribute({ name:'Data generation of 1000 records initiation'})
			.dataSubject({ type: 'core-node', id: { data: 'sales' }})
			.by(usrName);
		msg.logPrepare(function(err) {
			if (err) {
				logger.info('ERROR: ' + err.toString());
			}
			msg.logSuccess(function(err) {
				if (err) {
					logger.info('ERROR: ' + err.toString());
				}
			})
		});
		var origTable = 'SO.Header';
		util.getTableInfo(client, origTable, origTable, (error, response) => {
			var tableSize = response[0].RECORD_COUNT;
			logger.info('Table size:' + tableSize);
			var usrName = req.user.id;
			var query = 'insert into "SO.Header" ' + 'SELECT TOP 1000 ' + "(\"SALESORDERID\" + " + tableSize + ') AS "SALESORDERID",' +
				' "HISTORY.CREATEDBY.EMPLOYEEID",	"HISTORY.CREATEDAT",' + ' "HISTORY.CHANGEDBY.EMPLOYEEID",	"HISTORY.CHANGEDAT",' +
				' "NOTEID", "PARTNER.PARTNERID",	"CURRENCY",	"GROSSAMOUNT",' + '	"NETAMOUNT", "TAXAMOUNT", "LIFECYCLESTATUS", "BILLINGSTATUS",' +
				'	"DELIVERYSTATUS" FROM "shadow::SOShadow.Header"';

				
			const dbClass = require(global.__base + "utils/dbPromises");
			let db = new dbClass(req.db);
			db.preparePromisified(query)
			.then(statement => {
				db.statementExecPromisified(statement,[])
				.then(results => {
					logger.info('SO header query executed successfully');
					var salesOrdersAdded = results;
					var query = 'insert into "SO.Item" ' + 'SELECT ' + "(\"SALESORDERID\" + " + tableSize + ') AS "SALESORDERID",' +
						' "SALESORDERITEM", "PRODUCT.PRODUCTID", "NOTEID",' + ' "CURRENCY", "GROSSAMOUNT", "NETAMOUNT", "TAXAMOUNT",' +
						' "ITEMATPSTATUS", "OPITEMPOS", "QUANTITY", "QUANTITYUNIT",' + ' "DELIVERYDATE" FROM "shadow::SOShadow.Item"' +
						' WHERE "SALESORDERID" < 500001000';
					db.preparePromisified(query)
					.then(statement => {
						db.statementExecPromisified(statement,[])
						.then(results => {
							logger.info('SO Item query executed successfully');
							msg = auditLogGlobal.update({ type: 'Data Generator', id:{ api: '/replicate/sales'}})
								.attribute({ name:'Data generation successful'})
								.dataSubject({ type: 'core-node', id: { data: 'sales' }})
								.by(usrName);
							msg.logPrepare(function(err) {
								if (err) {
									logger.info('ERROR: ' + err.toString());
								}
								msg.logSuccess(function(err) {
									if (err) {
										logger.info('ERROR: ' + err.toString());
									}
								})
							});
						})
						.then(() =>{
							util.callback(error, response, res,
								'Sales orders replicated successfully, records added: ' + salesOrdersAdded);
						})
						.catch((error) => {
							dg.closeDB();
							logger.error('SO Item Query execution error: ' + error);
							msg = auditLogGlobal.update({ type: 'Data Generator', id:{ api: '/replicate/sales'}})
								.attribute({ name:'Data generation failed'})
								.dataSubject({ type: 'core-node', id: { data: 'sales' }})
								.by(usrName);
							msg.logPrepare(function(err) {
								if (err) {
									res.type("text/plain").status(500).send("ERROR: " + err.toString());
									return;
								}
								msg.logFailure(function(err) {
									if (err) {
										res.type("text/plain").status(500).send("ERROR: " + err.toString());
										return;
									}
								})
							});
						})
					})
				})
				.catch((error) => {
					logger.error('SO header Query execution error: ' + error);
					util.callback(error, response, res, "");
				})
			})
			
			
			
			/*var dg = new DataGeneratorDB(req);
			dg.executeQuery(query)
				.then((response) => {
					logger.info('SO header query executed successfully');
					var salesOrdersAdded = response;
					var query = 'insert into "SO.Item" ' + 'SELECT ' + "(\"SALESORDERID\" + " + tableSize + ') AS "SALESORDERID",' +
						' "SALESORDERITEM", "PRODUCT.PRODUCTID", "NOTEID",' + ' "CURRENCY", "GROSSAMOUNT", "NETAMOUNT", "TAXAMOUNT",' +
						' "ITEMATPSTATUS", "OPITEMPOS", "QUANTITY", "QUANTITYUNIT",' + ' "DELIVERYDATE" FROM "shadow::SOShadow.Item"' +
						' WHERE "SALESORDERID" < 500001000';
					dg.executeQuery(query)
						.then((status) => {
							logger.info('SO Item query executed successfully');
							msg = auditLogGlobal.update({type:'Sales order generation successful', id:{key:'value'}})
								.attribute({name:'Data generation of 1000 records'})
								.dataSubject({ type: 'data-subject-type', id: { key: 'value' }})
								.by(usrName);
							msg.logPrepare(function(err) {
								if (err) {
									logger.info('ERROR: ' + err.toString());
								}
								msg.logSuccess(function(err){
									if (err) {
										logger.info('ERROR: ' + err.toString());
									}	
									logger.info('Log Entry Saved as: ' + id);
								})
							});
						})
						.then(() => {
							util.callback(error, response, res,
								'Sales orders replicated successfully, records added: ' + salesOrdersAdded);
							dg.closeDB();
						})
						.catch((error) => {
							dg.closeDB();
							logger.error('SO Item Query execution error: ' + error);
							msg = auditLogGlobal.update({ type:'Purchase order generation successful', id:{ key:'value' }})
								.attribute({ name: 'Data generation'})
								.dataSubject({ type: 'data-subject-type', id: { key: 'value' }})
								.by(usrName);
							msg.logPrepare(function(err) {
								if (err) {
									res.type("text/plain").status(500).send("ERROR: " + err.toString());
									return;
								}
								msg.logFailure(function(err) {
									if (err) {
										res.type("text/plain").status(500).send("ERROR: " + err.toString());
										return;
									}
									res.type("application/json").status(200).send(JSON.stringify('Log Entry Saved as: ' + id));
								})
							});
						})
						.then(() => {
							dg.closeDB();
						})
						.catch((error) => {
							dg.closeDB();
							logger.error('SO header Query execution error: ' + error);
							util.callback(error, response, res, "");
						});
				});*/

		});
	});

	// method will pick records from POShadow.Header and add to PO.Header
	// and POShadow.Item to PO.Item
	app.post('/purchase', (req, res) => {
		var usrName = req.user.id;
		logger = req.loggingContext.getLogger('/replicate/purchase');
		logger.info('Purchase Data generation initiated');
		var msg = auditLogGlobal.update({ type: 'Data Generator', id:{ api: '/replicate/purchases'}})
			.attribute({ name:'Data generation of 1000 records initiation'})
			.dataSubject({ type: 'core-node', id: { data: 'purchases' }})
			.by(usrName);
		msg.logPrepare(function(err) {
			if (err) {
				logger.info('ERROR: ' + err.toString());
			}
			msg.logSuccess(function(err) {
				if (err) {
					logger.info('ERROR: ' + err.toString());
				}
			});
		});
		var client = req.db;
		var origTable = 'PO.Header';
		util.getTableInfo(client, origTable, origTable, (error, response) => {
			var tableSize = response[0].RECORD_COUNT;
			logger.info('Table size:' + tableSize);
			var query = 'insert into "PO.Header" ' + 'SELECT ' + "(\"PURCHASEORDERID\" + " + tableSize + ') AS "PURCHASEORDERID",' +
				' "HISTORY.CREATEDBY.EMPLOYEEID",	"HISTORY.CREATEDAT",' + ' "HISTORY.CHANGEDBY.EMPLOYEEID",	"HISTORY.CHANGEDAT",' +
				' "NOTEID", "PARTNER.PARTNERID",	"CURRENCY",	"GROSSAMOUNT",' + '	"NETAMOUNT", "TAXAMOUNT", "LIFECYCLESTATUS", "APPROVALSTATUS",' +
				' "CONFIRMSTATUS", "ORDERINGSTATUS",' + '	"INVOICINGSTATUS" FROM "shadow::POShadow.Header"';
			
			const dbClass = require(global.__base + "utils/dbPromises");
			let db = new dbClass(req.db);
			
			db.preparePromisified(query)
			.then(statement => {
				db.statementExecPromisified(statement,[])
				.then(results => {
					logger.info('PO header Query execution successful');
					var purchaseOrdersAdded = results;
					var query = 'insert into "PO.Item" ' + 'SELECT ' + "(\"PURCHASEORDERID\" + " + tableSize + ') AS "PURCHASEORDERID",' +
					' "PURCHASEORDERITEM", "PRODUCT.PRODUCTID", "NOTEID",' + ' "CURRENCY", "GROSSAMOUNT", "NETAMOUNT", "TAXAMOUNT",' +
					' "QUANTITY", "QUANTITYUNIT",' + ' "DELIVERYDATE" FROM "shadow::POShadow.Item"';
					
					db.preparePromisified(query)
					.then(statement => {
						db.statementExecPromisified(statement,[])
						.then(results => {
							logger.info('PO Item query executed successfully');
							var msg = auditLogGlobal.update({ type: 'Data Generator', id:{ api: '/replicate/purchases'}})
							.attribute({ name:'Data generation of 1000 records successful'})
							.dataSubject({ type: 'core-node', id: { data: 'purchases' }})
							.by(usrName);
							msg.logPrepare(function(err) {
								if (err) {
									logger.info('ERROR: ' + err.toString());
								}
								msg.logSuccess(function(err) {
									if (err) {
										logger.info('ERROR: ' + err.toString());
									}
								});
							});
						})
						.then(() => {
							util.callback(error, response, res,
									'Purchase orders replicated successfully, records added: ' + purchaseOrdersAdded);
						})
						.catch((error) => {
							logger.error('PO Item Query execution error: ' + error);
							var msg = auditLogGlobal.update({ type: 'Data Generator', id:{ api: '/replicate/purchases'}})
							.attribute({ name:'Data generation of 1000 records failed'})
							.dataSubject({ type: 'core-node', id: { data: 'purchases' }})
							.by(usrName);
							msg.logPrepare(function(err) {
								if (err) {
									logger.info('ERROR: ' + err.toString());
								}
								msg.logFailure(function(err) {
									if (err) {
										logger.info('ERROR: ' + err.toString());
									}
								})
							});
						});
					})				
				})
				.catch((error) => {
					logger.error('PO header Query execution error: ' + error);
					util.callback(error, response, res, "");
				})
			});
			/*			
			var dg = new DataGeneratorDB(req);
			
			dg.executeQuery(query)
			.then((response) => {
				logger.info('PO header Query execution successful');
				var purchaseOrdersAdded = response;
				var query = 'insert into "PO.Item" ' + 'SELECT ' + "(\"PURCHASEORDERID\" + " + tableSize + ') AS "PURCHASEORDERID",' +
					' "PURCHASEORDERITEM", "PRODUCT.PRODUCTID", "NOTEID",' + ' "CURRENCY", "GROSSAMOUNT", "NETAMOUNT", "TAXAMOUNT",' +
					' "QUANTITY", "QUANTITYUNIT",' + ' "DELIVERYDATE" FROM "shadow::POShadow.Item"';
				
				dg.executeQuery(query)
				.then((response) => {
					logger.info('PO Item query executed successfully');
					msg = auditLogGlobal.update({ type: 'Purchase order generation successful', id: { key: 'value' }})
						.attribute({ name: 'Data generation 1000 records'})
						.dataSubject({ type: 'data-subject-type', id: { key: 'value' }})
						.by(usrName);
					msg.logPrepare(function(err) {
						if (err) {
							logger.info('ERROR: ' + err.toString());
						}
						msg.logSuccess(function(err) {
							if (err) {
								logger.info('ERROR: ' + err.toString());
							}
							logger.info('Log Entry Saved as: ' + id);
						})
					});
				})
				.then(() => {
					util.callback(error, response, res,
							'Purchase orders replicated successfully, records added: ' + purchaseOrdersAdded);
					dg.closeDB();
				})
				.catch((error) => {
					dg.closeDB();
					logger.error('PO Item Query execution error: ' + error);
					msg = auditLogGlobal.update({ type:'Purchase order generation successful', id: { key: 'value' }})
						.attribute({ name: 'Data generation'})
						.dataSubject({ type: 'data-subject-type', id: { key: 'value' }})
						.by(usrName);
					msg.logPrepare(function(err) {
						if (err) {
							logger.info('ERROR: ' + err.toString());
						}
						msg.logFailure(function(err) {
							if (err) {
								logger.info('ERROR: ' + err.toString());
							}
							logger.info('Log Entry Saved as: ' + id);
						})
					});
				});
			})
			.then(() => {
				dg.closeDB();
			})
			.catch((error) => {
				dg.closeDB();
				logger.error('PO header Query execution error: ' + error);
				util.callback(error, response, res, "");
			});*/
		});
	});
	return app;
};
