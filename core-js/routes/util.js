module.exports = {
	resetTable: (req, res, origTable, shadowTable, callback) => {
		const client = req.db;
		client.exec('truncate table "' + origTable + '"', (error, response) => {
			if (error) {
				callback(error, null, res, origTable);
			} else {
				const query = 'insert into "' 
							+ origTable 
							+ '" select * from "shadow::'
							+ shadowTable + '"';
				client.exec(query, (error1, response1) => {
					callback(error1, response1, res, origTable + " reloaded successfully");
				});
			}
		});
	},

   	getMaxId: (idType, client, callback) => {
		let query, rs, maxId;
		switch (idType) {
			case "SalesOrderId":
				query = 'SELECT "SALESORDERID" FROM "PO.Header" ORDER BY "SALESORDERID" DESC';
				break;
			case "PurchaseOrderId":
				query = 'SELECT "PURCHASEORDERID" FROM "PO.Header" ORDER BY "PURCHASEORDERID" DESC';
				break;
		}
		try {
			client.exec(query, (error, result) => {
				if (error) {
					callback(error, null, result, error.message);
				} else {
					rs = result[0].PURCHASEORDERID;
					maxId=rs;
				}
			});
		} catch (e) {
			console.error("inside getMaxId function error " + e.message);
		}
		maxId = rs;
		return maxId;
	},

  	getTableInfo: (client, tableName, tableSynonym, callback) => {
    	const queryPrefix = 'SELECT "RECORD_COUNT","TABLE_SIZE" FROM "SYS"."M_TABLES" where "TABLE_NAME"=\'';
    	client.exec(queryPrefix + tableName + "'", (error, response) => {
            if (response) {
                response[0]["TABLE_SYNONYM"] = tableSynonym;
            }
            callback(error, response);
    	});
	},

  	callback: (error, response, res, message) => {
		if (error) {
			res.writeHead(500, {'Content-Type': 'application/json'});
			res.end(JSON.stringify(error));
		} else {
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(JSON.stringify({message: message, response: response}));
		}
	},

	isAlphaNumeric: (str) => {
		let code, i, len;
		for (i = 0, len = str.length; i < len; i++) {
			code = str.charCodeAt(i);
			if (!(code > 47 && code < 58) && // numeric (0-9)
				!(code > 64 && code < 91) && // upper alpha (A-Z)
				!(code > 96 && code < 123)) { // lower alpha (a-z)
				return false;
			}
		}
		return true;
	},

	isAlphaNumericAndSpace: (str) => {
		 let res = str.match(/^[a-z\d\-_\s]+$/i);
		 if(res)
		 {
		 	return true ;
		 }
		 else
		 {
		 	return false ;
		 }
		
	},

	isValidDate: (date) => {
		let timestamp = Date.parse(date);
		if (isNaN(timestamp) === true) {
			return false;
		}
		return true;
	},

	getBuinessPartners: (client, callback1) => {
    	let query = "SELECT \"PARTNERID\" FROM \"MD.BusinessPartner\"";
		client.exec(query, (error,response) => {
    		callback1(error, response);
    	});
	},

 	getProducts: (client, callback2) => {
		let query = "SELECT \"PRODUCTID\", \"PRICE\" FROM \"MD.Products\"";
		client.exec(query, (error, response) => {
			callback2(error, response);
		});
	}
};
