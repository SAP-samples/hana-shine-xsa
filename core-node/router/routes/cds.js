/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, no-use-before-define: 0, new-cap:0 */
'use strict';
var express = require('express');

module.exports = function() {
	var app = express.Router();

/*	var cds = require("@sap/cds");
	var client = null;
	var oEmployee = null;
	cds.$importEntities([{
		$entity: "MD.Employees"
	}], function(error, entities) {
		oEmployee = entities["MD.Employees"];
	});*/

	//Hello Router
	app.get('/', function(req, res) {
		var output = '<H1>Obsolete - Removed: Node-CDS Examples</H1></br>' +
/*			"<a href=\"" + req.baseUrl + "/example1\">/example1</a> - Unmanaged Query</br>" +
			"<a href=\"" + req.baseUrl + "/example2\">/example2</a> - Managed Find</br>" +
			"<a href=\"" + req.baseUrl + "/example3\">/example3</a> - Managed Get</br>" +
			"<a href=\"" + req.baseUrl + "/example4\">/example4</a> - Managed Update/Save</br>" +*/
			require(global.__base + 'utils/exampleTOC').fill();
		res.type('text/html').status(200).send(output);
	});

/*	// //Unmanaged Query
	// app.get("/example1", function(req, res) {
	// 	oEmployee.$query().$project({
	// 		LOGINNAME: true
	// 	}).$execute({}, function(error, results) {
	// 		if (error) {
	// 			res.type("text/plain").status(500).send("ERROR: " + error.toString());
	// 			return;
	// 		}
	// 		res.type("application/json").status(200).send(JSON.stringify(results));
	// 	});
	// });

	// //Managed Find
	// app.get("/example2", function(req, res) {

	// 	cds.$getTransaction(req.db, function(error, tx) {
	// 		if (error) {
	// 			res.type("text/plain").status(500).send("ERROR: " + error.toString());
	// 			return;
	// 		}
	// 		client = tx;
	// 		client.$find(oEmployee, {
	// 				LOGINNAME: {
	// 					$ne: "SPRINGS"
	// 				}
	// 			},
	// 			function(error, instances) {
	// 				if (error) {
	// 					res.type("text/plain").status(500).send("ERROR: " + error.toString());
	// 					return;
	// 				}
	// 				res.type("application/json").status(200).send(JSON.stringify(instances));
	// 				client.$close();
	// 			});
	// 	});

	// });

	// //Managed Get
	// app.get("/example3", function(req, res) {

	// 	cds.$getTransaction(req.db, function(error, tx) {
	// 		if (error) {
	// 			res.type("text/plain").status(500).send("ERROR: " + error.toString());
	// 			return;
	// 		}
	// 		client = tx;
	// 		client.$get(oEmployee, {
	// 				EMPLOYEEID: "1"
	// 			},
	// 			function(error, instance) {
	// 				if (error) {
	// 					res.type("text/plain").status(500).send("ERROR: " + error.toString());
	// 					return;
	// 				}
	// 				res.type("application/json").status(200).send(JSON.stringify(instance));
	// 				client.$close();
	// 			});
	// 	});

	// });

	// //Managed Get and Update
	// app.get("/example4", function(req, res) {

	// 	cds.$getTransaction(req.db, function(error, tx) {
	// 		if (error) {
	// 			res.type("text/plain").status(500).send("ERROR: " + error.toString());
	// 			return;
	// 		}
	// 		client = tx;
	// 		client.$get(oEmployee, {
	// 				EMPLOYEEID: "1"
	// 			},
	// 			function(error, instance) {
	// 				if (error) {
	// 					res.type("text/plain").status(500).send("ERROR: " + error.toString());
	// 					return;
	// 				}
	// 				instance.VALIDITY.STARTDATE = new Date();
	// 				client.$save(instance, function(error, savedInstance) {
	// 					res.type("application/json").status(200).send(JSON.stringify(savedInstance));
	// 					client.$close();
	// 				});
	// 			});
	// 	});

	});
*/
	return app;
};
