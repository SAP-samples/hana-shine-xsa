var express = require('express');

var router = express.Router();
var winston = require('winston');
var logging = require('@sap/logging');
var appContext = logging.createAppContext();
var logger;
winston.level = process.env.winston_level || 'error'

router.get('/search/fulltextsearch', function (req, res) {
    var reqContext = appContext.createRequestContext(req);
    logger = reqContext.getLogger("/search/fulltextsearch");
    var query = req.query.query;
    var client = req.db;
    var  queryString;
	queryString = "SELECT * FROM \"sales_fuzzy_search\"(?)";
	console.log(queryString);
	try {
		client.prepare(queryString, function(error, statement) {
			if (error) {
				logger.error("Error in executing Search" + error);
				console.log("error "+error);
			} else {
				statement.exec([query], function(err, result) {
				 if (err) {
    			    console.error("Error in executing Search:", err);
    			  }else{
                	console.log("result array of search "+JSON.stringify(result));
                	res.writeHead(200, {'Content-Type' : 'application/json'});
                	res.end(JSON.stringify(result));
    			  }
				});
                
            }
    });
	}catch (e) {
		console.log("Error occuered during Search " + e.message);
	}
});

module.exports = router;
