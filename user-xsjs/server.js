/*eslint no-console: 0*/
/*eslint-env node, es6 */
"use strict";

var port = process.env.PORT || 3000;

var async_xsjs = require("@sap/async-xsjs");
var xsenv = require("@sap/xsenv");
var options = {
    //	anonymous : true, // remove to authenticate calls
    redirectUrl: "/index.xsjs"
};

// configure HANA
try {
    options = Object.assign(options, xsenv.getServices({
        hana: {
            tag: "hana"
        }
    }));

    options = Object.assign(options, xsenv.getServices({
        secureStore: {
            tag: "hana"
        }
    }));
} catch (err) {
    console.log("[WARN]", err.message);
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