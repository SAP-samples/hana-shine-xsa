/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, dot-notation: 0, new-cap: 0*/
"use strict";
var express = require("express");
var excel = require("node-xlsx");
var fs = require("fs");
var path = require("path");
//var excel2 = require("xlsx");
//var bodyParser = require("body-parser");
//var multer = require("multer");

module.exports = function() {
	var app = express.Router();

	//Hello Router
	app.get("/", function(req, res) {
		var URL = encodeURI(req.baseUrl);
		var output = "<H1>Excel Examples</H1></br>" +
			"<a href=\"" + URL + "/download\">/download</a> - Download data in Excel XLSX format</br>" +
			require(global.__base + "utils/exampleTOC").fill();
		res.type("text/html").status(200).send(output);
	});

	//Simple Database Select - In-line Callbacks
	app.get("/download", function(req, res) {
		var client = req.db;
		var query = "SELECT TOP 10 " +
			" PURCHASEORDERID as \"PurchaseOrderItemId\", " +
			" PURCHASEORDERITEM as \"ItemPos\", " +
			" \"PRODUCT.PRODUCTID\" as \"ProductID\", " +
			" GROSSAMOUNT as \"Amount\" " +
			" FROM \"PO.Item\"  ";
		client.prepare(
			query,
			function(err, statement) {
				if (err) {
					res.type("text/plain").status(500).send("ERROR: " + err.toString());
					return;
				}
				statement.exec([],
					function(err, rs) {
						if (err) {
							res.type("text/plain").status(500).send("ERROR: " + err);
						} else {
							var out = [];
							for (var i = 0; i < rs.length; i++) {
								out.push([rs[i]["PurchaseOrderItemId"], rs[i]["ItemPos"], rs[i]["ProductID"], rs[i]["Amount"]]);
							}
							var result = excel.build([{
								name: "Purchase Orders",
								data: out
							}]);
							res.header("Content-Disposition", "attachment; filename=Excel.xlsx");
							res.type("application/vnd.ms-excel").status(200).send(result);
						}
					});
			});
	});

	//Simple Database Select - In-line Callbacks
	app.get("/downloadPO", function(req, res) {
		var client = req.db;
		var query = "SELECT TOP 25000 \"PurchaseOrderId\", \"PartnerId\", \"CompanyName\", \"CreatedByLoginName\", \"CreatedAt\", \"GrossAmount\" " + "FROM \"PO.HeaderView\" order by \"PurchaseOrderId\" ";
		client.prepare(
			query,
			function(err, statement) {
				if (err) {
					res.type("text/plain").status(500).send("ERROR: " + err.toString());
					return;
				}
				statement.exec([],
					function(err, rs) {
						if (err) {
							res.type("text/plain").status(500).send("ERROR: " + err);
						} else {
							var out = [];
							for (var i = 0; i < rs.length; i++) {
								out.push([rs[i]["PurchaseOrderId"], rs[i]["PartnerId"], rs[i]["CompanyName"], rs[i]["CreatedByLoginName"],  rs[i]["CreatedAt"], rs[i]["GrossAmount"]  ]);
							}
							var result = excel.build([{
								name: "Purchase Orders",
								data: out
							}]);
							res.header("Content-Disposition", "attachment; filename=poWorklist.xlsx");
							res.type("application/vnd.ms-excel").status(200).send(result);
						}
					});
			});
	});
	


	//Upload Workshop from Client Side
	/*	var cpUpload = upload.fields([
		{name: "users", maxCount: 1	},
		{name: "users-data", maxCount: 1}
	]);*/
	/*
	var cpUpload = upload.any();
	app.route("/upload")
		.post(function(req, res) {
//	app.route("/upload")
//	   .post(cpUpload, function(err, req, res, next) {
		console.log(req.rawBody);
		console.log(req.rawBody.typeof==="string");
		var data = new Uint8Array(req.rawBody);
		var arr = new Array();
		for(var i = 0; i !== data.length; ++i){ arr[i] = String.fromCharCode(data[i]);}
		var bstr = arr.join("");
  
        var obj = excel2.read(bstr, {type: 'binary'});
		console.log(obj);
		//	var filename = req.files.displayImage.name;
		//		var obj = excel.parse(fs.readFileSync(req.files.displayImage.path));
		//		console.log("received: %s", JSON.stringify(obj));
		//		var client = req.db;
		/*	client.prepare(
				"upsert \"workshop.admin.data::exerciseMaster.workshop\" values(?,?) where WORKSHOP_ID = ?",
				function(err, statement) {
					statement.exec([workshopID, JSON_DATA, workshopID],
						function(err, results) {
							if (err) {
								res.type("text/plain").status(500).send("ERROR: " + err);
							} else {
								res.type("text/plain").status(200).send("Successful Upsert of Workshop");
							}
						}
					);
				}
			);
			
			res.type("text/plain").status(500).send("ERROR: " );
	});*/

	return app;
};