// util.js
// ========
var xsenv = require('sap-xsenv');
module.exports = {
  resetTable: function (req, res, origTable, shadowTable, callback) {
    var client = req.db;
    client.exec('truncate table "' 
        + origTable + '"', 
        function(error, response) {
            if (error) {
                callback(error, null, res, origTable);
            } else {
                var query = 'insert into "' 
                            + origTable 
                            + '" select * from "shadow::'
                            + shadowTable + '"';
                client.exec(query, function(error1, response1){
                    callback(error1, response1, res, origTable + " reloaded successfully");
                });
            }
    });
  },
  getTableInfo: function(client, tableName, tableSynonym, callback) {
    var queryPrefix = 'SELECT "RECORD_COUNT","TABLE_SIZE" FROM "SYS"."M_TABLES" where "TABLE_NAME"=\'';
    client.exec(queryPrefix + tableName + "'", 
        function(error, response) {
            if (response) {
                response[0]["TABLE_SYNONYM"] = tableSynonym;
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
		 if(res)
		 {
		 	return true ;
		 }
		 else
		 {
		 	return false ;
		 }
		
	},

	isValidDate: function(date) {
		console.log("date"+date);
		var timestamp = Date.parse(date);
		console.log("timsestamp"+timestamp);
		if (isNaN(timestamp) === true) {
			return false;
		}
		// if(timestamp === "NaN"){
		// 	return false;
		// }
		return true;
	}

};
