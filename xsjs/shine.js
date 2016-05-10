'use strict';

var xsjs = require('sap-xsjs');
var xsenv = require('sap-xsenv');
var port = process.env.PORT || 3000;

var options = xsenv.getServices({hana:{tag:'hana'}, uaa:{name:process.env.UAA_SERVICE_NAME}});
console.log(JSON.stringify(options));

xsjs(options).listen(port);
console.log('Server listening on port %d', port);
