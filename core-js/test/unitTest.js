var expect = require("expect.js");
var sinon = require("sinon");
var util = require("../routes/util");
var reset = require("../routes/reset");
var get = require("../routes/get");
var datagen = require("../routes/datagen");

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
        util.callback(null, "", res, "SO.Header" + " reset successfully");
        expect(outputStr).to.be('{"message":"SO.Header reset successfully"}');
    });
    it('util callback for error', function(){
        util.callback("table not found", "", res, null);
        expect(outputStr).to.be('"table not found"');
    });
    it('util resetTable check truncate query', function(){
        // mock client
        req.db.exec =  function(query, callbackFn) {
            queryStr = query;
        }; 
        util.resetTable(req, res, "SO.Header", "SOShadow.Header", function(){});
        expect(queryStr).to.be('truncate table "sap.hana.democontent.epm.data::' + 'SO.Header"');
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
        util.resetTable(req, res, "SO.Header", "SOShadow.Header", function(){});
        expect(queryStrNext).to.be('insert into "sap.hana.democontent.epm.data::SO.Header" select * from "sap.hana.democontent.epm.data.shadow::SOShadow.Header"');        
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
        util.getTableInfo(req.db, "SO.Header", "Sales Header", function(){});
        expect(queryStr).to.be('SELECT "RECORD_COUNT","TABLE_SIZE" FROM "SYS"."M_TABLES" where "TABLE_NAME"=\'sap.hana.democontent.epm.data::SO.Header\'');
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
        util.getTableInfo(req.db, "SO.Header", "Sales Header", function(error, response){
            responseObj = response;
        });
        expect(responseObj[0]).to.be.ok();
        expect(responseObj[0].TABLE_SYNONYM).to.be.ok();
        expect(responseObj[0].TABLE_SYNONYM).to.be("Sales Header");
    });
});