const express = require('express');
const async = require('async');
const router = express.Router();
const util = require('./util');
let logger;

router.get('/get/tablesize', (req, res) => {
    logger = req.loggingContext.getLogger("/get/tablesize");
    const client = req.db;  // db client for issuing query
    let query;
	query = 'SELECT * from "getTableSize"()';
	try {
		client.exec(query, (error, result) => {
			if (error) {
				logger.error("Error in getting table sizes" + error);
			} else {
                logger.info("result array in getTableSize "+JSON.stringify(result));
                res.writeHead(200, {'Content-Type' : 'application/json'});
                res.end(JSON.stringify(result));
            }
        });
	}catch (e) {
		logger.error("inside getTableSize error " + e.message);
	}
});

router.get('/get/tablesize1',  (req, res) => {
    logger = req.loggingContext.getLogger("/get/tablesize1");
    const client = req.db;
    const tableDict = [{
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
        (callback) => {
            util.getTableInfo(client, 
                tableDict[0].tableName,
                tableDict[0].tableSynonym,
                callback);
        },
        (callback) => {
            util.getTableInfo(client, 
                tableDict[1].tableName,
                tableDict[1].tableSynonym,
                callback);
        },
        (callback) => {
            util.getTableInfo(client, 
                tableDict[2].tableName,
                tableDict[2].tableSynonym,
                callback);
        },
        (callback) => {
            util.getTableInfo(client, 
                tableDict[3].tableName,
                tableDict[3].tableSynonym,
                callback);
        },
        (callback) => {
            util.getTableInfo(client, 
                tableDict[4].tableName,
                tableDict[4].tableSynonym,
                callback);
        },
        (callback) => {
            util.getTableInfo(client, 
                tableDict[5].tableName,
                tableDict[5].tableSynonym,
                callback);
        },
        (callback) => {
            util.getTableInfo(client, 
                tableDict[6].tableName,
                tableDict[6].tableSynonym,
                callback);
        },
        (callback) => {
            util.getTableInfo(client, 
                tableDict[7].tableName,
                tableDict[7].tableSynonym,
                callback);
        },
        (callback) => {
            util.getTableInfo(client, 
                tableDict[8].tableName,
                tableDict[8].tableSynonym,
                callback);
        },
        (callback) => {
            util.getTableInfo(client, 
                tableDict[9].tableName,
                tableDict[9].tableSynonym,
                callback);
        },
        (callback) => {
            util.getTableInfo(client, 
                tableDict[10].tableName,
                tableDict[10].tableSynonym,
                callback);
        }],
        (error, result) => {
            if (error) {
                res.writeHead(500, {'Content-Type' : 'text/plain'});
                logger.error(error);
                res.end(error.message);
            } else {
                let combinedArray = [];
                for (let i = 0; i < result.length; i++) {
                    combinedArray.push(result[i][0]);
                }
                res.writeHead(200, {'Content-Type' : 'application/json'});
                res.end(JSON.stringify(combinedArray));
            }
        }
    );
});

router.get('/get/sessioninfo', (req, res) => {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({userEncoded: encodeURI(JSON.stringify(req.user))})); //user info in req.user
});

module.exports = router;