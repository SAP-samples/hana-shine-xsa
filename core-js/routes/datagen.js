const express = require('express');
const router = express.Router();
const util = require('./util');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
let logger;

const getMaxId = (idType, client, callback) => {

	let query;
	switch (idType) {
		case "SalesOrderId":
			query = 'SELECT "SALESORDERID" FROM "SO.Header" ORDER BY "SALESORDERID" DESC';
			break;
		case "PurchaseOrderId":
			query = 'SELECT "PURCHASEORDERID" FROM "PO.Header" ORDER BY "PURCHASEORDERID" DESC';
			break;
	}
	try {
		client.exec(query, (error, result) => {
			if (error) {
				logger.error("Error in max orderID generation" + error);
			} else {
				if(idType === "PurchaseOrderId"){
					rs = result[0].PURCHASEORDERID;
				}else if(idType === "SalesOrderId"){
					rs = result[0].SALESORDERID;
				}
				callback(rs);
			}
		});
	} catch (e) {
		logger.error("inside getMaxId function error " + e.message);
	}

}

const createTimeBasedPO = (startDates, batchSizes, totalSize, bpDict, prodDict, client, id, res,callback) => {

	let maxPoId = '';
	let randProductIndex, randProduct, randPrice, randQuantity, randNetAmount = 0,
		randTaxAmount = 0,
		randGrossAmount = 0,
		randBPIndex, randBP;
	let items = [];
	let headers = [];
	try {
		let i;
		let queryHeaders = "";
		let queryItems = "";
		if(id === "PurchaseOrderId"){
			queryItems = "INSERT INTO \"PO.Item\" " +
				"(\"PURCHASEORDERID\", \"PURCHASEORDERITEM\", \"PRODUCT.PRODUCTID\", \"NOTEID\", \"CURRENCY\", \"GROSSAMOUNT\", \"NETAMOUNT\", \"TAXAMOUNT\", \"QUANTITY\", \"QUANTITYUNIT\", \"DELIVERYDATE\") " +
				"VALUES (?,?,?,?,?,?,?,?,?,?,?)";
			queryHeaders = "INSERT INTO \"PO.Header\"" +
			"(\"PURCHASEORDERID\", \"HISTORY.CREATEDBY.EMPLOYEEID\", \"HISTORY.CREATEDAT\", \"HISTORY.CHANGEDBY.EMPLOYEEID\", \"HISTORY.CHANGEDAT\", \"NOTEID\", \"PARTNER.PARTNERID\", \"CURRENCY\", \"GROSSAMOUNT\", \"NETAMOUNT\", \"TAXAMOUNT\", \"LIFECYCLESTATUS\", \"APPROVALSTATUS\", \"CONFIRMSTATUS\", \"ORDERINGSTATUS\", \"INVOICINGSTATUS\" )" +
				"VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
		}else if(id === "SalesOrderId"){
			queryItems = "INSERT INTO \"SO.Item\" " + "(\"SALESORDERID\", \"SALESORDERITEM\", \"PRODUCT.PRODUCTID\", \"NOTEID\", \"CURRENCY\", \"GROSSAMOUNT\", \"NETAMOUNT\", \"TAXAMOUNT\",\"QUANTITY\", \"QUANTITYUNIT\", \"DELIVERYDATE\",\"ITEMATPSTATUS\",\"OPITEMPOS\") " + "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
			queryHeaders = "INSERT INTO \"SO.Header\"" + "(\"SALESORDERID\", \"HISTORY.CREATEDBY.EMPLOYEEID\", \"HISTORY.CREATEDAT\", \"HISTORY.CHANGEDBY.EMPLOYEEID\", \"HISTORY.CHANGEDAT\", \"NOTEID\", \"PARTNER.PARTNERID\", \"CURRENCY\", \"GROSSAMOUNT\", \"NETAMOUNT\", \"TAXAMOUNT\", \"LIFECYCLESTATUS\", \"BILLINGSTATUS\", \"DELIVERYSTATUS\")" + "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
		}
		let itemCounts = [];
		let l;
		let count;
		let j;
		let StartDateStr;
		let BATCHSIZE;
		let itemCount;
		let productIDs;
		let k;
		let netAmountItem;
		let taxAmountItem;
		let grossAmountItem;

		for (l = 0; l < totalSize; l++) {
			// Decide number of items, max 5
			count = Math.floor((Math.random() * 4) + 1);
			itemCounts.push(count);
		}
		l = 0;

		//Extract the max PO Id
		getMaxId(id, client, (maxId) => {
			
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
							taxAmountItem = parseInt((netAmountItem * 0.19).toFixed(2), 10); // Taking 19% Tax
							grossAmountItem = netAmountItem + taxAmountItem;

							randNetAmount += netAmountItem;
							randTaxAmount += taxAmountItem;
							randGrossAmount += grossAmountItem;

							// prepare the insert query
							if(id === "SalesOrderId"){
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
							}
							else
							{
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
						if(id === "PurchaseOrderId"){
								headers[i][14]="I";
								headers[i][15]="I";
						}
					}
				}

				client.prepare(queryHeaders, (errHeaderPrepare, statement) => {
					if (errHeaderPrepare) {
						if(id === "PurchaseOrderId"){
							util.callback(errHeaderPrepare, statement, res, "Error in Header preparation");
							return logger.error('Prepare error in PO Headers:', errHeaderPrepare);
						}
						else
						{
							util.callback(errHeaderPrepare, statement, res, "Error in Header preparation");
							return logger.error('Prepare error in SO Headers:', errHeaderPrepare);
						}
					}

					statement.exec(headers, (errorHeaders, affectedRowsHeader) => {
						if (errorHeaders) {
						    util.callback(errorHeaders, affectedRowsHeader, res, "Error in Header insertion");
						    return logger.error('Exec error in PO Headers:'+id, errorHeaders);
						} else {
							logger.info("PoHeader row inserted");
					
							client.prepare(queryItems, (errItemsPrepare, statement1) => {
								if (errItemsPrepare) {
									util.callback(errItemsPrepare, statement1, res, "Error in Items preparation");
									return logger.error('Prepare error po Items:', errItemsPrepare);
								}
								statement1.exec(items, (errItems, affectedRowsItems) => {
									if (errItems) {
										util.callback(errItems, affectedRowsItems, res, "Error in Items insertion");
										return logger.error('Exec error in PO Items1:'+id, errItems);
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
		// flag - why xsjs code here ?
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(e.message);
	}
	finally{
		items = [];
	    headers = [];
		randProductIndex = randProduct = randPrice = randQuantity = randNetAmount = randTaxAmount =randGrossAmount = randBPIndex = randBP = null;
	     k=netAmountItem=taxAmountItem=grossAmountItem = null;
	}
}

const callCreateTimeBasedPo = (j, diffDays, thetaArray, StartDate, totalSize, dates, batchSizes, prodDict, bpDict, client, id, res, cb) => {
    
    //if thetaArray[j] === 0 and if its not the last loop then proceed to the next iteration
    try
    {
    	
    
	if (thetaArray[j] === 0) {
		j = j + 1;
		if (j <= (diffDays - 1)) {
			callCreateTimeBasedPo(j, diffDays, thetaArray, StartDate, totalSize, dates, batchSizes, prodDict, bpDict, client,id, res, cb);
		} else {
			cb();
		}
		return false;
	}

	let startDay = StartDate.getDate();
	let startMonth = StartDate.getMonth() + 1; // Jan is 0
	let startYear = StartDate.getFullYear();

	if (startDay < 10) {
		startDay = '0' + startDay;
	}
	if (startMonth < 10) {
		startMonth = '0' + startMonth;
	}
	let StartDateStr = startYear.toString() + "-" + startMonth.toString() + "-" + startDay;

	let BATCHSIZE = thetaArray[j];
	totalSize += BATCHSIZE;
	dates.push(StartDateStr);
	batchSizes.push(BATCHSIZE);
	if (totalSize < 1000 || j === (diffDays - 1) && diffDays < 1000) {
		createTimeBasedPO(dates, batchSizes, totalSize, bpDict, prodDict, client, id,res, (msg) => {
			if (msg != "Success") {
				return false;

			}

			dates = [];
			batchSizes = [];
			totalSize = 0;

			if (j < (diffDays - 1)) {
				j = j + 1;
				callCreateTimeBasedPo(j, diffDays, thetaArray, StartDate, totalSize, dates, batchSizes, prodDict, bpDict, client,id, res, cb);
			} else {
				cb();

			}

		});

	}

	// Increment Date
	StartDate.setDate(StartDate.getDate() + 1);
}
 catch(e)
    {
    		logger.error('Unexpected error occured'+e);
    }
    finally
    {
    	startDay = startMonth = startYear = BATCHSIZE = null;
    }
}


router.post('/replicate/timebasedPO', jsonParser, (req, res) => {
  let totalRecords = (req.body.noRec) * 1000;
  let startDay, startMonth, startYear, StartDateStr, BATCHSIZE;
  let randNo = 0;
  let alpha = 0;
  try
  {
	let body = '';
	let thetaArray = [];
	let i = 0;
	let j;
	let calc;
	const client = req.db;
	logger = req.loggingContext.getLogger("/replicate/timebasedPO");
	logger.info(' Time based Sales Data generation initiated');
	logger.info("Time based purchase Data generation initiated"+"+++++++++"+ req.body.id);
	let bpDict = [];
	let prodDict = [];
	let id = req.body.id;
	//get business partner details in an array bpDict
	util.getBuinessPartners(client, (errorinbp, businessPartners) => {
		if(errorinbp) logger.error("PO /replicate/timeBasedPO 1 error: " + errorinbp);
		let row;
		for (row = 0; row < businessPartners.length; row++) {
			bpDict.push(businessPartners[row].PARTNERID);
		}
      //get product details in an array prodDict
	  util.getProducts(client, (errorinprod, products) => {
			if(errorinprod) logger.error("PO /replicate/timeBasedPO 2 error: " + errorinprod);
			for (row = 0; row < products.length; row++) {
				prodDict.push([products[row].PRODUCTID, products[row].PRICE]);
			}

			let aStartDate = req.body.startdate;
			let aEndDate = req.body.enddate;
			if (aStartDate) {
				aStartDate = aStartDate.replace("'", "");
			}
			if (aEndDate) {
				aEndDate = aEndDate.replace("'", "");
			}
			let StartDate = new Date(aStartDate);
			let endDate = new Date(aEndDate);
			let timeDiff = Math.abs(endDate.getTime() - StartDate.getTime());
			let diffDays = (Math.ceil(timeDiff / (1000 * 3600 * 24))) + 1;
			let aNoRec = encodeURI(req.body.noRec);

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
			let totalSize = 0;
			let dates = [],
				batchSizes = [];
			j = 0;

			callCreateTimeBasedPo(j, diffDays, thetaArray, StartDate, totalSize, dates, batchSizes, prodDict, bpDict, client, id, res, () => {
				
				let text = "";
				if(id === "PurchaseOrderId"){
					text = "Purchase Orders";
				}else if(id === "SalesOrderId"){
					text = "Sales Orders"; 
				}
				util.callback(false, "response", res, text+" replicated successfully, records added: " + totalRecords);
				
			});

	  });
	});
  }
  catch(e)
  {
	logger.error('Unexpected error occured'+e );
  }
  finally
  {
	alpha = null;
	startDay= startMonth= startYear=StartDateStr= BATCHSIZE == null;
	randNo = null;
  }
});

router.get('/replicate/sales', (req, res) => {

	logger = req.loggingContext.getLogger("/replicate/sales");
	logger.info('Sales Data generation initiated');

	const client = req.db;
	let origTable = "SO.Header";
	util.getTableInfo(client, origTable, origTable, (error, response) => {
		if(error) logger.error("PO /replicate/sales error: " + error);
		let tableSize = response[0].RECORD_COUNT;
		logger.info('Table size:' + tableSize);
		const query = 'insert into "SO.Header" ' + 'SELECT TOP 1000 ' + "(\"SALESORDERID\" + " + tableSize + ') AS "SALESORDERID",' +
			' "HISTORY.CREATEDBY.EMPLOYEEID",	"HISTORY.CREATEDAT",' + ' "HISTORY.CHANGEDBY.EMPLOYEEID",	"HISTORY.CHANGEDAT",' +
			' "NOTEID", "PARTNER.PARTNERID",	"CURRENCY",	"GROSSAMOUNT",' + '	"NETAMOUNT", "TAXAMOUNT", "LIFECYCLESTATUS", "BILLINGSTATUS",' +
			'	"DELIVERYSTATUS" FROM "shadow::SOShadow.Header"';
		client.exec(query, (error, response) => {
			if (error) {
				logger.error("SO header Query execution error: " + error);
				util.callback(error, response, res, "");
			} else {
				logger.info('SO header query executed successfully');
				let salesOrdersAdded = response;
				const query = 'insert into "SO.Item" ' + 'SELECT ' + "(\"SALESORDERID\" + " + tableSize + ') AS "SALESORDERID",' +
					' "SALESORDERITEM", "PRODUCT.PRODUCTID", "NOTEID",' + ' "CURRENCY", "GROSSAMOUNT", "NETAMOUNT", "TAXAMOUNT",' +
					' "ITEMATPSTATUS", "OPITEMPOS", "QUANTITY", "QUANTITYUNIT",' + ' "DELIVERYDATE" FROM "shadow::SOShadow.Item"' +
					' WHERE "SALESORDERID" < 500001000';
				client.exec(query, (error, response) => {
					if (error) {
						logger.error("SO Item Query execution error: " + error);
					} else {
						logger.info('SO Item query executed successfully');
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
router.get('/replicate/purchase', (req, res) => {

	logger = req.loggingContext.getLogger("/replicate/purchase");
	logger.info('Purchase Data generation initiated');
	const client = req.db;
	let origTable = "PO.Header";
	util.getTableInfo(client, origTable, origTable, (error, response) => {
		if(error) logger.error("PO /replicate/purchase error: " + error);
		let tableSize = response[0].RECORD_COUNT;
		logger.info('Table size:' + tableSize);
		const query = 'insert into "PO.Header" ' + 'SELECT ' + "(\"PURCHASEORDERID\" + " + tableSize + ') AS "PURCHASEORDERID",' +
			' "HISTORY.CREATEDBY.EMPLOYEEID",	"HISTORY.CREATEDAT",' + ' "HISTORY.CHANGEDBY.EMPLOYEEID",	"HISTORY.CHANGEDAT",' +
			' "NOTEID", "PARTNER.PARTNERID",	"CURRENCY",	"GROSSAMOUNT",' + '	"NETAMOUNT", "TAXAMOUNT", "LIFECYCLESTATUS", "APPROVALSTATUS",' +
			' "CONFIRMSTATUS", "ORDERINGSTATUS",' + '	"INVOICINGSTATUS" FROM "shadow::POShadow.Header"';
		client.exec(query, (error, response) => {
			if (error) {
				logger.error("PO header Query execution error: " + error);
				util.callback(error, response, res, "");
			} else {
				logger.info("PO header Query execution successful");
				let purchaseOrdersAdded = response;
				const query = 'insert into "PO.Item" ' + 'SELECT ' + "(\"PURCHASEORDERID\" + " + tableSize + ') AS "PURCHASEORDERID",' +
					' "PURCHASEORDERITEM", "PRODUCT.PRODUCTID", "NOTEID",' + ' "CURRENCY", "GROSSAMOUNT", "NETAMOUNT", "TAXAMOUNT",' +
					' "QUANTITY", "QUANTITYUNIT",' + ' "DELIVERYDATE" FROM "shadow::POShadow.Item"';
				client.exec(query, (error, response) => {
					if (error) {
						logger.error("PO Item Query execution error: " + error);
					} else {
						logger.info('PO Item query executed successfully');
					}
					util.callback(error, response, res,
						"Purchase orders replicated successfully, records added: " + purchaseOrdersAdded);
				});
			}
		});
	});
});

module.exports = router;
