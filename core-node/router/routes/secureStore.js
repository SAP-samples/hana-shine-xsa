/*eslint-env node, es6*/
/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, no-use-before-define: 0, new-cap:0, no-undef:0 */
"use strict";
const express = require("express");

module.exports = () => {
	const app = express.Router();

	const bodyParser = require("body-parser");
	//app.use(bodyParser.json());
	app.use(bodyParser.raw({
		type: "text/plain"
	})); //Process request Body and return a Buffer

	function getSecureStore() {
		return new Promise((resolve, reject) => {
			const xsenv = require("@sap/xsenv");
			
			var hanaOptions = xsenv.filterCFServices({
						  plan: 'securestore'
        	})[0].credentials;
        	hanaOptions = { 'secureStore': hanaOptions };
			var hdbext = require("@sap/hdbext");
			hdbext.createConnection(hanaOptions.secureStore, (error, client) => {
				if (error) {
					reject(error);
				} else {
					resolve(client);
				}
			});
		});
	}


	//Secure Store Insert
	app.post("/:key?", async(req, res) => {
		const hdbext = require("@sap/hdbext");
		const key = req.params.key;
		let inputParams = "";
		if (typeof key === "undefined" || key === null) {
			res.type("text/plain").status(500).send("ERROR: No Secure Store Key Input Parameter Specified");
			return;
		} else {
			inputParams = {
				KEY: key
			};
		}
		inputParams.STORE_NAME = "SHINE_STORE";
		inputParams.FOR_XS_APPLICATIONUSER = true;
		inputParams.VALUE = req.body;
		const client = await getSecureStore();
		//(client, Schema, Procedure, callback)
		hdbext.loadProcedure(client, "SYS", "USER_SECURESTORE_INSERT", (err, sp) => {
			if (err) {
				res.type("text/plain").status(500).send(`ERROR: ${err.toString()}`);
				return;
			}
			//(Input Parameters, callback(errors, Output Scalar Parameters, [Output Table Parameters])
			sp(inputParams, (err, parameters, results) => {
				if (err) {
					res.type("text/plain").status(500).send(`ERROR: ${err.message.toString()}`);
					return;
				}
				res.type("application/json").status(200).send(
					`Entry in secure store successsfully created for key: ${key} and value: ${req.body.toString("utf8")} `);
			});
		});
	});

	//Secure Store Retrieve
	app.get("/:key?", async(req, res) => {
		const hdbext = require("@sap/hdbext");
		const key = req.params.key;
		let inputParams = "";
		if (typeof key === "undefined" || key === null) {
			res.type("text/plain").status(500).send("ERROR: No Secure Store Key Input Parameter Specified");
			return;
		} else {
			inputParams = {
				KEY: key
			};
		}
		inputParams.STORE_NAME = "SHINE_STORE";
		inputParams.FOR_XS_APPLICATIONUSER = true;
		const client = await getSecureStore();
		//(client, Schema, Procedure, callback)
		hdbext.loadProcedure(client, "SYS", "USER_SECURESTORE_RETRIEVE", (err, sp) => {
			if (err) {
				res.type("text/plain").status(500).send(`ERROR: ${err.toString()}`);
				return;
			}
			//(Input Parameters, callback(errors, Output Scalar Parameters, [Output Table Parameters])
			sp(inputParams, (err, parameters, results) => {
				if (err) {
					res.type("text/plain").status(500).send(`ERROR: ${err.message.toString()}`);
					return;
				}
				if(parameters.VALUE != null){
					console.log(`Results: ${parameters.VALUE.toString("utf8")} `);
					res.type("application/json").status(200).send(`Entry in secure store successsfully retrieved for key: ${key} and value: ${parameters.VALUE.toString("utf8")} `);
					return;
				}
				console.log("Results: "+parameters.VALUE);
				res.status(200).send(`Entry in secure store successsfully retrieved for key: ${key} and value: ${parameters.VALUE}`);
			});
		});
	});

	//Secure Store Delete
	app.delete("/:key?", async(req, res) => {
		const hdbext = require("@sap/hdbext");
		const key = req.params.key;
		let inputParams = "";
		if (typeof key === "undefined" || key === null) {
			res.type("text/plain").status(500).send("ERROR: No Secure Store Key Input Parameter Specified");
			return;
		} else {
			inputParams = {
				KEY: key
			};
		}
		inputParams.STORE_NAME = "SHINE_STORE";
		inputParams.FOR_XS_APPLICATIONUSER = true;
		const client = await getSecureStore();
		//(client, Schema, Procedure, callback)
		hdbext.loadProcedure(client, "SYS", "USER_SECURESTORE_DELETE", (err, sp) => {
			if (err) {
				res.type("text/plain").status(500).send(`ERROR: ${err.toString()}`);
				return;
			}
			//(Input Parameters, callback(errors, Output Scalar Parameters, [Output Table Parameters])
			sp(inputParams, (err, parameters, results) => {
				if (err) {
					res.type("text/plain").status(500).send(`ERROR: ${err.message.toString()}`);
					return;
				}
				res.type("application/json").status(200).send(`Entry in secure store successsfully deleted for key: ${key} `);
			});
		});
	});

	return app;
};
