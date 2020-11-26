const express = require('express');
const router = express.Router();
const logging = require('@sap/logging');
// const appContext = logging.createAppContext();
let logger;

router.get('/search/fulltextsearch', (req, res) => {
    // const reqContext = appContext.createRequestContext(req);
	// logger = reqContext.getLogger("/search/fulltextsearch");
	logger = req.loggingContext.getLogger("/search/fulltextsearch");
    const query = req.query.query;
    const client = req.db;
    let queryString;
	queryString = "SELECT * FROM \"sales_fuzzy_search\"(?)";
	try {
		client.prepare(queryString, (error, statement) => {
			if (error) {
				logger.error("Error in executing Search" + error);
			} else {
				statement.exec([query], (err, result) => {
				 if (err) {
    			    console.error("Error in executing Search:", err);
    			  }else{
                	logger.info("result array of search "+JSON.stringify(result));
                	res.writeHead(200, {'Content-Type' : 'application/json'});
                	res.end(JSON.stringify(result));
    			  }
				});
            }
    	});
	}catch (e) {
		logger.error("Error occuered during Search " + e.message);
	}
});

module.exports = router;
