/*eslint no-console: 0*/
/*eslint-env node, es6 */
"use strict";

var async_xsjs = require("@sap/async-xsjs");
var xsenv = require("@sap/xsenv");
var port = process.env.PORT || 3000;
global.__base = __dirname + "/";

var options = {
    // anonymous : true, // remove to authenticate calls
    redirectUrl: "/index.xsjs",
    context: {
        base: global.__base,
        env: process.env,
        answer: 42
    }
};
try {

    var op = xsenv.filterCFServices({
        label: 'hana',
        plan: 'hdi-shared'
    })[0].credentials;

    var hana_options = { 'hana': op };

    var options = Object.assign(options, hana_options);

    var securestore_options = xsenv.filterCFServices({
        label: 'hana',
        plan: 'securestore'
    })[0].credentials;

    securestore_options = { 'secureStore': securestore_options };

    options = Object.assign(options, securestore_options);

} catch (err) {
    console.log("[ERR]", err.message);
}


// configure UAA
try {
    options = Object.assign(options, xsenv.getServices({
        uaa: {
            tag: "xsuaa"
        }
    }));
} catch (err) {
    console.log("[WARN]", err.message);
}

// configure AuditLog
try {
    options = Object.assign(options, xsenv.getServices({ auditLog: { tag: "auditlog" } }));
} catch (err) {
    console.log("[WARN]", err.message);
}


// start server
async_xsjs(options).then((async_xsjs_server)=>{
    async_xsjs_server.listen(port, (err)=>{
      if(!err) {
        console.log('Server listening on port %d', port);
      }else{
        console.log('Server failed to start on port %d', port);
      }
    });
});