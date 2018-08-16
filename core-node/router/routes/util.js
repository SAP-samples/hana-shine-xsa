/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, new-cap: 0, no-undef:0*/
/*eslint-env node, es6 */
'use strict';
// util.js
// ========
var xsenv = require('@sap/xsenv');
module.exports = {
  resetTable: function (req, res, origTable, shadowTable, callback) {
    var client = req.db;
    console.log('inside resetTable'+origTable+'   '+shadowTable);
    if(origTable === 'MD.BusinessPartner'|| origTable === 'MD.Addresses')
    {
		console.log('inside cond if'+origTable);
		client.exec('delete from "'
		+ origTable + '"',
		function(error, response) {
            if (error) {
				console.log('inside if '+origTable+error);
                callback(error, null, res, origTable);
            } else {
				console.log('inside cond else'+origTable);
				var query = 'insert into "'
				+ origTable
				+ '" select * from "shadow::'
				+ shadowTable + '"';
                client.exec(query, function(error1, response1){
					if(error1){
						console.log('Address insert error'+error1);
						console.log('query'+query);
					}
					callback(error1, response1, res, origTable + ' reloaded successfully');
				});
            }
    });
    }
    else
    {
    client.exec('truncate table "'
	+ origTable + '"',
	function(error, response) {
		if (error) {
			console.log('inside if '+origTable+error);
			callback(error, null, res, origTable);
            } else {
				var query = 'insert into "'
				+ origTable
				+ '" select * from "shadow::'
				+ shadowTable + '"';
                client.exec(query, function(error1, response1){
                    callback(error1, response1, res, origTable + ' reloaded successfully');
                });
            }
    });
    }
  },
  getMaxId: function(idType, client, callback) {
 //  	console.log("inside getMaxId function util" + client + " idType" + idType);
	// var query, rs, maxId = -1;
	// switch (idType) {
	// 	case "SalesOrderId":
	// 		query = 'SELECT "SALESORDERID" FROM "PO.Header" ORDER BY "SALESORDERID" DESC';
	// 		break;
	// 	case "PurchaseOrderId":
	// 		query = 'SELECT "PURCHASEORDERID" FROM "PO.Header" ORDER BY "PURCHASEORDERID" DESC';
	// 		break;
	// }
	// 	console.log( "query for purchase order max id" + query);
	// 	client.exec(query, function(error, response) {
	// 		console.log("inside getMaxId function client execution util");
	// 		if(response){
	// 			console.log("success in util" + response.length);
	// 			response = response[0].PURCHASEORDERID;
	// 			console.log("result in util" + response);
	// 			// maxId = response;
	// 		}
	// 		console.log("outside if in util");
	// 		callback(error, response);
	// 	});
	// 	console.log("maxPOid------------>" + maxId);
		console.log('inside getMaxId function idType util function' + idType);
	var query, rs, maxId;
	switch (idType) {
		case 'SalesOrderId':
			query = 'SELECT "SALESORDERID" FROM "PO.Header" ORDER BY "SALESORDERID" DESC';
			break;
		case "PurchaseOrderId":
			query = 'SELECT "PURCHASEORDERID" FROM "PO.Header" ORDER BY "PURCHASEORDERID" DESC';
			break;
	}
	try {
			console.log('client object' + Object.keys(client) + 'query for purchase order max id' + query);
			console.log('After query');
			client.exec(query, function(error, result) {
					console.log('inside else----------->');
					console.log('success' + result.length);
					rs = result[0].PURCHASEORDERID;
					maxId=rs;
					console.log('result' + rs);
			});
			console.log('After query execution');
		} catch (e) {
			console.log('inside getMaxId function error ' + e.message);
		}
		maxId = rs;
		return maxId;
  },
  getTableInfo: function(client, tableName, tableSynonym, callback) {
		var queryPrefix = 'SELECT "RECORD_COUNT","TABLE_SIZE" FROM "SYS"."M_TABLES" where "TABLE_NAME"=\'';
		client.exec(queryPrefix + tableName + "'",
		function(error, response) {
            if (response) {
				response[0]['TABLE_SYNONYM'] = tableSynonym;
            }
            callback(error, response);
    });
  },
  callback: function(error, response, res, message) {
    if (error) {
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(error));
    } else {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({message: message}));
    }
  },
		isAlphaNumeric: function(str) {
		var code, i, len;
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
	isAlphaNumericAndSpace: function(str) {
		var res = str.match(/^[a-z\d\-_\s]+$/i);
		if(res){
			return true ;
		}
		else
		{
			return false ;
		}
	},
	isValidDate: function(date) {
		console.log('date'+date);
		var timestamp = Date.parse(date);
		console.log('timsestamp'+timestamp);
		if (isNaN(timestamp) === true) {
			return false;
		}
		// if(timestamp === "NaN"){
		// 	return false;
		// }
		return true;
	},
	getBuinessPartners: function(client, callback1) {
        console.log('inside bpDict');
		var query = 'SELECT \"PARTNERID\" FROM \"MD.BusinessPartner\"';
		client.exec(query,function(error,response){
			console.log('bpDict in utils');
			callback1(error, response);
		});
	},
	getProducts: function(client, callback2) {
		//console.log("inside prodDict");
		// Select ProductId and the corresponding Price
    var query = 'SELECT \"PRODUCTID\", \"PRICE\" FROM \"MD.Products\"';
	client.exec(query, function(error, response){
		// console.log("prodDict in utils");
		callback2(error, response);
	});
}
};
