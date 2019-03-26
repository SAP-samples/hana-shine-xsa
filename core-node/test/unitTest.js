/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0, dot-notation:0, no-use-before-define:0, no-inner-declarations:0, no-undef:0 */
/*eslint-env node, es6 */

var expect = require('expect.js');
var util = require('../router/routes/util');
var reset = require('../router/routes/reset');
var get = require('../router/routes/get');
var datagen = require('../router/routes/datagen');

// mock objects
var res = {};
var outputStr;
res.writeHead = function(){};
res.end = function(output) {
    outputStr = output;
};

var req = {};
req.db = {};
var queryStr;
var queryStrNext;

// test suite
describe('Unit tests for Admin backend', function() {
    // util unit tests
    it('util should be present', function(){
       expect(util).to.be.ok();
	});
    it('reset should be present', function(){
       expect(reset).to.be.ok();
	});
    it('get should be present', function(){
       expect(get).to.be.ok();
	});
    it('datagen should be present', function(){
       expect(datagen).to.be.ok();
	});
    it('util callback for success', function(){
        util.callback(null, '', res, 'SO.Header' + ' reset successfully');
        expect(outputStr).to.be('{"message":"SO.Header reset successfully"}');
    });
    it('util callback for error', function(){
        util.callback('table not found', '', res, null);
        expect(outputStr).to.be('"table not found"');
    });
    it('util resetTable check truncate query', function(){
        // mock client
        req.db.exec =  function(query, callbackFn) {
            queryStr = query;
        };
		util.resetTable(req, res, 'SO.Header', 'SOShadow.Header', function(){});
        expect(queryStr).to.be('truncate table "' + 'SO.Header"');
    });
    it('util resetTable check insert query', function(){
        // mock client
        req.db.exec =  function(query, callbackFn) {
            if (queryStr)
				queryStrNext = query;
            else
                queryStr = query;
            callbackFn(null, {});
        };
		util.resetTable(req, res, 'SO.Header', 'SOShadow.Header', function(){});
        expect(queryStrNext).to.be('insert into "SO.Header" select * from "shadow::SOShadow.Header"');
	});
    it('util getTableInfo check query', function(){
        // mock client
        req.db.exec =  function(query, callbackFn) {
            queryStr = query;
            callbackFn(null, [{
                RECORD_COUNT: 1,
                TABLE_SIZE: 1
            }]);
        };
        util.getTableInfo(req.db, 'SO.Header', 'Sales Header', function(){});
        expect(queryStr).to.be('SELECT "RECORD_COUNT","TABLE_SIZE" FROM "SYS"."M_TABLES" where "TABLE_NAME"=\'SO.Header\'');
    });
    it('util getTableInfo check TABLE_SYNONYM in callback', function(){
        // mock client
        req.db.exec =  function(query, callbackFn) {
            queryStr = query;
            callbackFn(null, [{
                RECORD_COUNT: 1,
                TABLE_SIZE: 1
            }]);
        };
        var responseObj;
        util.getTableInfo(req.db, 'SO.Header', 'Sales Header', function(error, response){
            responseObj = response;
        });
        expect(responseObj[0]).to.be.ok();
        expect(responseObj[0].TABLE_SYNONYM).to.be.ok();
        expect(responseObj[0].TABLE_SYNONYM).to.be('Sales Header');
    });
});
