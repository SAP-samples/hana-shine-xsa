module.exports = function() {
	var express = require("express");
	var async = require('async');
	var cds = require('@sap/cds');
	var winston = require('winston');
	//var util = require(global.__base + "utils/datagen");
	var util = require("./util");
	var logging = require('@sap/logging');
	var appContext = logging.createAppContext();
	var logger;
	var bodyParser = require('body-parser');
	var jsonParser = bodyParser.json();
	var xsenv = require('@sap/xsenv');

	xsenv.loadEnv();
	var credentials = xsenv.getServices({
		auditlog: 'shine-auditlog'
	}).auditlog;
	var auditLog = require('@sap/audit-logging')(credentials);
	console.log("credentials" + credentials.user);

	var app = express.Router();
	winston.level = process.env.winston_level || 'error';
	// method will pick records from SOShadow.Header and add to SO.Header
	// and SOShadow.Item and add to SO.Item

	function getMaxId(idType, client, callback) {

		var query, rs, maxId;
		switch (idType) {
			case "SalesOrderId":
				query = 'SELECT "SALESORDERID" FROM "SO.Header" ORDER BY "SALESORDERID" DESC';
				break;
			case "PurchaseOrderId":
				query = 'SELECT "PURCHASEORDERID" FROM "PO.Header" ORDER BY "PURCHASEORDERID" DESC';
				break;
		}
		try {
			client.exec(query, function(error, result) {
				if (error) {
					logger.error("Error in max orderID generation" + error);
				} else {
					if (idType === "PurchaseOrderId") {
						rs = result[0].PURCHASEORDERID;
					} else if (idType === "SalesOrderId") {
						rs = result[0].SALESORDERID;
					}
					callback(rs);
				}
			});
		} catch (e) {
			console.log("inside getMaxId function error " + e.message);
		}

	}

	function createTimeBasedPO(startDates, batchSizes, totalSize, bpDict, prodDict, client, id, res, usrName, callback) {

		var maxPoId = '';
		var randProductIndex, randProduct, randPrice, randQuantity, randNetAmount = 0,
			randTaxAmount = 0,
			randGrossAmount = 0,
			randBPIndex, randBP;
		var items = [];
		var headers = [];
		try {
			var i;
			var queryHeaders = "";
			var queryItems = "";
			if (id === "PurchaseOrderId") {
				//Insert statement for purchaseOrderItem table
				console.log("inside poqueryheaders");
				//Insert statement for purchaseOrderItem table
				queryItems = "INSERT INTO \"PO.Item\" " +
					"(\"PURCHASEORDERID\", \"PURCHASEORDERITEM\", \"PRODUCT.PRODUCTID\", \"NOTEID\", \"CURRENCY\", \"GROSSAMOUNT\", \"NETAMOUNT\", \"TAXAMOUNT\", \"QUANTITY\", \"QUANTITYUNIT\", \"DELIVERYDATE\") " +
					"VALUES (?,?,?,?,?,?,?,?,?,?,?)";

				//Insert statement for purchaseOrderHeader table
				queryHeaders = "INSERT INTO \"PO.Header\"" +
					"(\"PURCHASEORDERID\", \"HISTORY.CREATEDBY.EMPLOYEEID\", \"HISTORY.CREATEDAT\", \"HISTORY.CHANGEDBY.EMPLOYEEID\", \"HISTORY.CHANGEDAT\", \"NOTEID\", \"PARTNER.PARTNERID\", \"CURRENCY\", \"GROSSAMOUNT\", \"NETAMOUNT\", \"TAXAMOUNT\", \"LIFECYCLESTATUS\", \"APPROVALSTATUS\", \"CONFIRMSTATUS\", \"ORDERINGSTATUS\", \"INVOICINGSTATUS\" )" +
					"VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
			} else if (id === "SalesOrderId") {
				//Insert statement for salesOrderItem table
				queryItems = "INSERT INTO \"SO.Item\" " +
					"(\"SALESORDERID\", \"SALESORDERITEM\", \"PRODUCT.PRODUCTID\", \"NOTEID\", \"CURRENCY\", \"GROSSAMOUNT\", \"NETAMOUNT\", \"TAXAMOUNT\",\"QUANTITY\", \"QUANTITYUNIT\", \"DELIVERYDATE\",\"ITEMATPSTATUS\",\"OPITEMPOS\") " +
					"VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
				//Insert statement for salesOrderHeader table
				queryHeaders = "INSERT INTO \"SO.Header\"" +
					"(\"SALESORDERID\", \"HISTORY.CREATEDBY.EMPLOYEEID\", \"HISTORY.CREATEDAT\", \"HISTORY.CHANGEDBY.EMPLOYEEID\", \"HISTORY.CHANGEDAT\", \"NOTEID\", \"PARTNER.PARTNERID\", \"CURRENCY\", \"GROSSAMOUNT\", \"NETAMOUNT\", \"TAXAMOUNT\", \"LIFECYCLESTATUS\", \"BILLINGSTATUS\", \"DELIVERYSTATUS\")" +
					"VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
			}
			var itemCounts = [];
			var l;
			var count;
			var j;
			var StartDateStr;
			var BATCHSIZE;
			var itemCount;
			var productIDs;
			var k;
			var netAmountItem;
			var taxAmountItem;
			var grossAmountItem;

			for (l = 0; l < totalSize; l++) {
				// Decide number of items, max 5
				count = Math.floor((Math.random() * 4) + 1);
				itemCounts.push(count);
			}
			l = 0;

			//Extract the max PO Id
			getMaxId(id, client, function(maxId) {

				if (maxId === -1 && maxId === undefined) {
					logger.error("Error in getMaxId" + maxId);
				} else {

					maxPoId = maxId;
					// loop for every day in the arguments
					for (j = 0; j < batchSizes.length; j++) {

						StartDateStr = startDates[j];
						BATCHSIZE = batchSizes[j];

						// batch inserts
						for (i = 0; i < BATCHSIZE; i++) {

							itemCount = itemCounts[l];
							l++;
							productIDs = [];
							// create the next purchase order ID
							maxPoId = parseInt(maxPoId, 10) + 1;
							maxPoId = maxPoId.toString();
							// reset amounts
							randNetAmount = 0;
							randTaxAmount = 0;
							randGrossAmount = 0;

							for (k = 0; k < itemCount; k++) {

								// Creating values to be inserted purchaseOrderItem table	

								// Randomly extract the product and the corresponding price of the selected product
								do {

									randProductIndex = Math.floor(Math.random() * 105);
									// to weed out duplicates
								} while (productIDs.indexOf(randProductIndex) > -1);
								productIDs.push(randProductIndex);
								randProduct = prodDict[randProductIndex][0];
								randPrice = prodDict[randProductIndex][1];

								// calculate amounts
								randQuantity = Math.floor((Math.random() * 9) + 1);
								netAmountItem = parseInt((randQuantity * randPrice).toFixed(2), 10);
								// console.log("netamountItem"+netAmountItem);
								taxAmountItem = parseInt((netAmountItem * 0.19).toFixed(2), 10); // Taking 19% Tax
								grossAmountItem = netAmountItem + taxAmountItem;

								randNetAmount += netAmountItem;
								randTaxAmount += taxAmountItem;
								randGrossAmount += grossAmountItem;

								// prepare the insert query
								if (id === "SalesOrderId") {
									items.push([maxPoId,
										"00000000" + ((k + 1) * 10),
										randProduct,
										"NoteId",
										"EUR",
										grossAmountItem,
										netAmountItem,
										taxAmountItem,
										randQuantity,
										"EA",
										"" + StartDateStr,
										"I",
										"test"
									]);
								} else {
									items.push([maxPoId,
										"00000000" + ((k + 1) * 10),
										randProduct,
										"NoteId",
										"EUR",
										grossAmountItem,
										netAmountItem,
										taxAmountItem,
										randQuantity,
										"EA",
										"" + StartDateStr
									]);
								}

							}

							//Randomly extract the business partner from businessPartnerArray
							randBPIndex = Math.floor(Math.random() * 44); // since BP is 45
							randBP = bpDict[randBPIndex];

							//Creating values to be inserted for the purchaseOrderHeader or salesOrderHeader table

							headers.push([maxPoId, //PURCHASEORDERID
								"0000000033", //HISTORY.CREATEDBY.EMPLOYEEID
								"" + StartDateStr, //HISTORY.CREATEDAT
								"0000000033", //HISTORY.CHANGEDBY.EMPLOYEEID
								"" + StartDateStr, //HISTORY.CHANGEDAT
								"NoteId", //NOTEID
								randBP, //PARTNERID.PARTNERID
								"EUR", //CURRENCY
								randGrossAmount, //GROSSAMOUNT
								randNetAmount, //NETAMOUNT
								randTaxAmount, //TAXAMOUNT
								"N", //LIFECYCLESTATUS
								"I", //APPROVALSTATUS
								"I" //CONFIRMSTATUS
							]);
							//push these two extra fields if the data generation is for purchaseorders
							if (id === "PurchaseOrderId") {
								headers[i][14] = "I";
								headers[i][15] = "I";
							}
						}
					}

					client.prepare(queryHeaders, function(errHeaderPrepare, statement) {
						if (errHeaderPrepare) {
							if (id === "PurchaseOrderId") {
								logger.error("Error in PO Header preparation");
								msg = auditLog.update('Error in PO Header preparation').attribute('PO Header preparation', false).by(usrName);
								msg.log(function(err, id) {
									if (err) {
										console.log("error" + err);
									} else {
										console.log("success" + id);
									}

								});
								util.callback(errHeaderPrepare, statement, res, "Error in Header preparation");
								return console.error('Prepare error in PO Headers:', errHeaderPrepare);

							} else {
								logger.error("Error in SO Header preparation");
								msg = auditLog.update('Error in SO Header preparation').attribute('SO Header preparation', false).by(usrName);
								msg.log(function(err, id) {
									if (err) {
										console.log("error" + err);
									} else {
										console.log("success" + id);
									}

								});
								util.callback(errHeaderPrepare, statement, res, "Error in Header preparation");
								return console.error('Prepare error in SO Headers:', errHeaderPrepare);
							}
						}

						statement.exec(headers, function(errorHeaders, affectedRowsHeader) {
							if (errorHeaders) {

								logger.error("Error in Header query execution");
								msg = auditLog.update('Error in Header query execution')
									.attribute('Header execution', false)
									.by(usrName);
								msg.log(function(err, id) {
									if (err) {
										console.log("error" + err);
									} else {
										console.log("success" + id);
									}

								});
								util.callback(errorHeaders, affectedRowsHeader, res, "Error in Header insertion");
								return logger.error('Exec error in PO Headers:' + id, errorHeaders);
							} else {
								logger.info("PoHeader row inserted");
								msg = auditLog.update('Header row inserted').attribute('PoHeader row insertion', true).by(usrName);
								msg.log(function(err, id) {
									if (err) {
										console.log("error" + err);
									} else {
										console.log("success" + id);
									}

								});

								client.prepare(queryItems, function(errItemsPrepare, statement1) {
									if (errItemsPrepare) {
										util.callback(errItemsPrepare, statement1, res, "Error in Items preparation");
										msg = auditLog.update('Error in Items preparation')
											.attribute('Items preparation', false)
											.by(usrName);
										msg.log(function(err, id) {
											if (err) {
												console.log("error" + err);
											} else {
												console.log("success" + id);
											}

										});
										return logger.error('Prepare error po Items:', errItemsPrepare);
										msg = auditLog.update('Successful Items preparation')
											.attribute('Items preparation', true)
											.by(usrName);
										msg.log(function(err, id) {
											if (err) {
												console.log("error" + err);
											} else {
												console.log("success" + id);
											}

										});
									}

									statement1.exec(items, function(errItems, affectedRowsItems) {
										if (errItems) {
											util.callback(errItems, affectedRowsItems, res, "Error in Items insertion");
											msg = auditLog.update('Error in Items insertion')
												.attribute('Items insertion', false)
												.by(usrName);
											msg.log(function(err, id) {
												if (err) {
													console.log("error" + err);
												} else {
													console.log("success" + id);
												}

											});

											return logger.error('Exec error in PO Items1:' + id, errItems);
											msg = auditLog.update('Success Items insertion')
												.attribute('Items insertion', true)
												.by(usrName);
											msg.log(function(err, id) {
												if (err) {
													console.log("error" + err);
												} else {
													console.log("success" + id);
												}

											});
										}
										callback("Success");
									});

								});
							}

						});

					});

				}
			});

		} catch (e) {
			$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
			$.response.setBody(e.message);
		} finally {
			items = [];
			headers = [];
		}
	}

	function callCreateTimeBasedPo(j, diffDays, thetaArray, StartDate, totalSize, dates, batchSizes, prodDict, bpDict, client, id, res,
		usrName, cb) {

		//if thetaArray[j] === 0 and if its not the last loop then proceed to the next iteration
		if (thetaArray[j] === 0) {
			j = j + 1;
			if (j <= (diffDays - 1)) {
				callCreateTimeBasedPo(j, diffDays, thetaArray, StartDate, totalSize, dates, batchSizes, prodDict, bpDict, client, id, res, usrName, cb);
			} else {
				cb();
			}
			return false;
		}

		var startDay = StartDate.getDate();
		var startMonth = StartDate.getMonth() + 1; // Jan is 0
		var startYear = StartDate.getFullYear();

		if (startDay < 10) {
			startDay = '0' + startDay;
		}
		if (startMonth < 10) {
			startMonth = '0' + startMonth;
		}
		var StartDateStr = startYear.toString() + "-" + startMonth.toString() + "-" + startDay;

		var BATCHSIZE = thetaArray[j];
		totalSize += BATCHSIZE;
		dates.push(StartDateStr);
		batchSizes.push(BATCHSIZE);
		if (totalSize < 1000 || j === (diffDays - 1) && diffDays < 1000) {
			createTimeBasedPO(dates, batchSizes, totalSize, bpDict, prodDict, client, id, res, usrName, function(msg) {
				if (msg != "Success") {
					return false;

				}

				dates = [];
				batchSizes = [];
				totalSize = 0;

				if (j < (diffDays - 1)) {
					j = j + 1;
					callCreateTimeBasedPo(j, diffDays, thetaArray, StartDate, totalSize, dates, batchSizes, prodDict, bpDict, client, id, res, usrName,
						cb);
				} else {
					console.log("===================== Response==============");
					cb();

				}

			});

		}

		// Increment Date
		StartDate.setDate(StartDate.getDate() + 1);

	}

	app.post('/timebasedPO', jsonParser, function(req, res) {

		var body = '';
		var alpha = 0;
		var thetaArray = [];
		var i = 0;
		var randNo = 0;
		var j;
		var calc;
		var startDay, startMonth, startYear, StartDateStr, BATCHSIZE;
		var client = req.db;
		var reqContext = appContext.createRequestContext(req);
		logger = reqContext.getLogger("/replicate/timebasedPO");
		logger.info(' Time based Sales Data generation initiated');
		console.log("Time based purchase Data generation initiated" + "+++++++++" + req.body.id);
		var bpDict = [];
		var prodDict = [];
		var totalRecords = encodeURI((req.body.noRec)) * 1000;
		var id = req.body.id;
		var usrName = req.user.id;
		//get business partner details in an array bpDict
		util.getBuinessPartners(client, function(errorinbp, businessPartners) {
			var row;
			for (row = 0; row < businessPartners.length; row++) {
				bpDict.push(businessPartners[row].PARTNERID);
			}
			//get product details in an array prodDict
			util.getProducts(client, function(errorinprod, products) {

				for (row = 0; row < products.length; row++) {
					prodDict.push([products[row].PRODUCTID, products[row].PRICE]);
				}

				var aStartDate = encodeURI(req.body.startdate);
				var aEndDate = encodeURI(req.body.enddate);
				if (aStartDate) {
					aStartDate = aStartDate.replace("'", "");
				}
				if (aEndDate) {
					aEndDate = aEndDate.replace("'", "");
				}
				var StartDate = new Date(aStartDate);
				var endDate = new Date(aEndDate);
				var timeDiff = Math.abs(endDate.getTime() - StartDate.getTime());
				var diffDays = (Math.ceil(timeDiff / (1000 * 3600 * 24))) + 1;
				var aNoRec = encodeURI(req.body.noRec);

				aNoRec = parseInt(aNoRec, 10) * 1000;
				if (aNoRec === 0) {

					return;
				}

				//Get the random number of purchase orders to be generated for each day finally stored in thetaArray[]
				if (diffDays === 1) {
					randNo = 1;
				} else {
					randNo = Math.random();
				}
				alpha = Math.round(aNoRec / diffDays);
				thetaArray[0] = Math.round(alpha * randNo);
				aNoRec = +(aNoRec - thetaArray[i]) || 0;

				for (i = 1; i <= (diffDays - 1); i++) {
					//Generate a random number
					randNo = Math.random();
					if ((diffDays - i) > 0) {
						alpha = Math.round(aNoRec / (diffDays - i));
						calc = Math.round(alpha * randNo) * Math.round(6 * randNo);
						thetaArray[i] = (calc <= aNoRec) ? calc : 0;
						aNoRec = +(aNoRec - thetaArray[i]) || 0;
					}
				}

				if (aNoRec > 0) {
					thetaArray[diffDays - 1] = +aNoRec || 0;
				}
				var totalSize = 0;
				var dates = [],
					batchSizes = [];
				j = 0;

				callCreateTimeBasedPo(j, diffDays, thetaArray, StartDate, totalSize, dates, batchSizes, prodDict, bpDict, client, id, res,
					usrName,
					function() {

						var text = "";
						if (id === "PurchaseOrderId") {
							text = "Purchase Orders";
						} else if (id === "SalesOrderId") {
							text = "Sales Orders";
						}
						util.callback(false, "response", res, text + " replicated successfully, records added: " + totalRecords);

					});

			});
		});
		thetaArray = [];
		bpDict = [];
		prodDict = [];
	});

	app.post('/sales', function(req, res) {
		var user = req.user;
		var usrName = req.user.id;
		var reqContext = appContext.createRequestContext(req);
		logger = reqContext.getLogger("/replicate/sales");
		logger.info('Sales Data generation initiated');
		var msg = auditLog.update('Sales order generation initialted ')
			.attribute('Data generation initiation', true)
			.by(usrName);

		console.log("msg----->" + Object.keys(msg));
		msg.log(function(err, id) {
			if (err) {
				console.log("error" + err);
			} else {
				console.log("success" + id);
			}

		});
		var client = req.db;
		var origTable = "SO.Header";
		util.getTableInfo(client, origTable, origTable, function(error, response) {
			var tableSize = response[0].RECORD_COUNT;
			logger.info('Table size:' + tableSize);
			var usrName = req.user.id;
			var query = 'insert into "SO.Header" ' + 'SELECT TOP 1000 ' + "(\"SALESORDERID\" + " + tableSize + ') AS "SALESORDERID",' +
				' "HISTORY.CREATEDBY.EMPLOYEEID",	"HISTORY.CREATEDAT",' + ' "HISTORY.CHANGEDBY.EMPLOYEEID",	"HISTORY.CHANGEDAT",' +
				' "NOTEID", "PARTNER.PARTNERID",	"CURRENCY",	"GROSSAMOUNT",' + '	"NETAMOUNT", "TAXAMOUNT", "LIFECYCLESTATUS", "BILLINGSTATUS",' +
				'	"DELIVERYSTATUS" FROM "shadow::SOShadow.Header"';
			client.exec(query, function(error, response) {
				if (error) {
					logger.error("SO header Query execution error: " + error);
					util.callback(error, response, res, "");
				} else {
					logger.info('SO header query executed successfully');
					var salesOrdersAdded = response;
					var query = 'insert into "SO.Item" ' + 'SELECT ' + "(\"SALESORDERID\" + " + tableSize + ') AS "SALESORDERID",' +
						' "SALESORDERITEM", "PRODUCT.PRODUCTID", "NOTEID",' + ' "CURRENCY", "GROSSAMOUNT", "NETAMOUNT", "TAXAMOUNT",' +
						' "ITEMATPSTATUS", "OPITEMPOS", "QUANTITY", "QUANTITYUNIT",' + ' "DELIVERYDATE" FROM "shadow::SOShadow.Item"' +
						' WHERE "SALESORDERID" < 500001000';
					client.exec(query, function(error, response) {
						if (error) {
							logger.error("SO Item Query execution error: " + error);
							msg = auditLog.update('Purchase order generation successful')
								.attribute('Data generation', false)
								.by(usrName);
							msg.log(function(err, id) {
								if (err) {
									console.log("error" + err);
								} else {
									console.log("success" + id);
								}

							});
						} else {
							logger.info('SO Item query executed successfully');
							msg = auditLog.update('Sales order generation successful')
								.attribute('Data generation of 1000 records', true)
								.by(usrName);
							msg.log(function(err, id) {
								if (err) {
									console.log("error" + err);
								} else {
									console.log("success" + id);
								}

							});
						}

						util.callback(error, response, res,
							"Sales orders replicated successfully, records added: " + salesOrdersAdded);
					});
				}
			});
		});
	});

	// method will pick records from POShadow.Header and add to PO.Header
	// and POShadow.Item to PO.Item
	app.post('/purchase', function(req, res) {
		var reqContext = appContext.createRequestContext(req);
		var usrName = req.user.id;
		logger = reqContext.getLogger("/replicate/purchase");
		logger.info('Purchase Data generation initiated');
		var msg = auditLog.update('Purchase order generation initiated ')
			.attribute('Data generation initiation', true)
			.by(usrName);

		console.log("msg----->" + Object.keys(msg));
		msg.log(function(err, id) {
			if (err) {
				console.log("error" + err);
			} else {
				console.log("success" + id);
			}
		});
		var client = req.db;
		var origTable = "PO.Header";
		util.getTableInfo(client, origTable, origTable, function(error, response) {
			var tableSize = response[0].RECORD_COUNT;
			var user = req.user;
			logger.info('Table size:' + tableSize);
			var query = 'insert into "PO.Header" ' + 'SELECT ' + "(\"PURCHASEORDERID\" + " + tableSize + ') AS "PURCHASEORDERID",' +
				' "HISTORY.CREATEDBY.EMPLOYEEID",	"HISTORY.CREATEDAT",' + ' "HISTORY.CHANGEDBY.EMPLOYEEID",	"HISTORY.CHANGEDAT",' +
				' "NOTEID", "PARTNER.PARTNERID",	"CURRENCY",	"GROSSAMOUNT",' + '	"NETAMOUNT", "TAXAMOUNT", "LIFECYCLESTATUS", "APPROVALSTATUS",' +
				' "CONFIRMSTATUS", "ORDERINGSTATUS",' + '	"INVOICINGSTATUS" FROM "shadow::POShadow.Header"';
			client.exec(query, function(error, response) {
				if (error) {
					logger.error("PO header Query execution error: " + error);
					util.callback(error, response, res, "");
				} else {
					logger.info("PO header Query execution successful");
					var purchaseOrdersAdded = response;
					var query = 'insert into "PO.Item" ' + 'SELECT ' + "(\"PURCHASEORDERID\" + " + tableSize + ') AS "PURCHASEORDERID",' +
						' "PURCHASEORDERITEM", "PRODUCT.PRODUCTID", "NOTEID",' + ' "CURRENCY", "GROSSAMOUNT", "NETAMOUNT", "TAXAMOUNT",' +
						' "QUANTITY", "QUANTITYUNIT",' + ' "DELIVERYDATE" FROM "shadow::POShadow.Item"';
					client.exec(query, function(error, response) {
						if (error) {
							logger.error("PO Item Query execution error: " + error);
							msg = auditLog.update('Purchase order generation successful')
								.attribute('Data generation', false)
								.by(usrName);
							msg.log(function(err, id) {
								if (err) {
									console.log("error" + err);
								} else {
									console.log("success" + id);
								}

							});
						} else {
							logger.info('PO Item query executed successfully');
							msg = auditLog.update('Purchase order generation successful')
								.attribute('Data generation 1000 records', true)
								.by(usrName);
							msg.log(function(err, id) {
								if (err) {
									console.log("error" + err);
								} else {
									console.log("success" + id);
								}

							});
						}
						util.callback(error, response, res,
							"Purchase orders replicated successfully, records added: " + purchaseOrdersAdded);
					});
				}
			});
		});
	});
	return app;
};
