// util.js
// ========
module.exports = {
  resetTable: function (req, res, origTable, shadowTable, callback) {
    var client = req.db;
    client.exec('truncate table "sap.hana.democontent.epm.data::' 
        + origTable + '"', 
        function(error, response) {
            if (error) {
                callback(error, null, res, origTable);
            } else {
                var query = 'insert into "sap.hana.democontent.epm.data::' 
                            + origTable 
                            + '" select * from "sap.hana.democontent.epm.data.shadow::'
                            + shadowTable + '"';
                client.exec(query, function(error1, response1){
                    callback(error1, response1, res, origTable + " reloaded successfully");
                });
            }
    });
  },
  getTableInfo: function(client, tableName, tableSynonym, callback) {
    var queryPrefix = 'SELECT "RECORD_COUNT","TABLE_SIZE" FROM "SYS"."M_TABLES" where "TABLE_NAME"=\'sap.hana.democontent.epm.data::';
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
  }
};
