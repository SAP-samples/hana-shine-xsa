/*eslint no-console: 0, no-unused-vars: 0, new-cap:0 */
"use strict";
var express = require("express");
var WebSocketServer = require("ws").Server;

module.exports = function(server) {
	var app = express.Router();
	//	var expressWs = require("express-ws")(app,server);
	var asyncLib = require(global.__base + "async/async.js");
	var dbAsync = require(global.__base + "async/databaseAsync.js");
	var dbAsync2 = require(global.__base + "async/databaseAsync2.js");
	var fileSync = require(global.__base + "async/fileSync.js");
	var fileAsync = require(global.__base + "async/fileAsync.js");
	var httpClient = require(global.__base + "async/httpClient.js");

	app.use(function(req, res) {
		var URL = encodeURI(req.baseUrl);
		var output = "<H1>Asynchronous Examples</H1></br>" +
			"<a href=\"" + URL + "/exerciseAsync\">/exerciseAsync</a> - Test Framework for Async Examples</br>" +
			require(global.__base + "utils/exampleTOC").fill();
		res.type("text/html").status(200).send(output);
	});
	/*	app.ws("/", function(ws, require) {
			ws.on("open", function() {
				log("Connected");
				ws.send(JSON.stringify({
					text: "Connected to Exercise 3"
				}), function ack(error) {
					if (!typeof error === "undefined") {
						console.log("Send Error: " + error.toString());
					}
				});
			});
			
				ws.on("message", function(message) {
						console.log("received: %s", message);
				});
		});
		var wss = expressWs.getWss();
		wss.on("connection", function(ws) {
			console.log("Connected");
			ws.send(JSON.stringify({
				text: "Connected to Exercise 3"
			}), function ack(error) {
				if (!typeof error === "undefined") {
					console.log("Send Error: " + error.toString());
				}
			});
		});
		expressWs.getWss().broadcast = function(data) {
			var message = JSON.stringify({
				text: data
			});
			expressWs.getWss().clients.forEach(function each(client) {
				try {
					client.send(message, function ack(error) {
						if (!typeof error === "undefined") {
							console.log("Send Error: " + error.toString());
						}
					});
				} catch (e) {
					console.log("Broadcast Error: %s", e.toString());
				}
			});
			console.log("sent: %s", message);
		};*/
	try {
		var wss = new WebSocketServer({
			server: server,
			path: "/node/excAsync",
			perMessageDeflate: false
		});

		wss.broadcast = function(data) {
			var message = JSON.stringify({
				text: data
			});
			wss.clients.forEach(function each(client) {
				try {
					client.send(message, function ack(error) {
						if (!typeof error === "undefined") {
							console.log("Send Error: " + error.toString());
						}
					});
				} catch (e) {
					console.log("Broadcast Error: %s", e.toString());
				}
			});
			console.log("sent: %s", message);

		};
		wss.on("error", function(error) {
			console.log("Web Socket Server Error: " + error.toString());
		});

		wss.on("connection", function(ws) {
			console.log("Connected");

			ws.on("message", function(message) {
				console.log("received: %s", message);
				var data = JSON.parse(message);
				switch (data.action) {
					case "async":
						asyncLib.asyncDemo(wss);
						break;
					case "fileSync":
						fileSync.fileDemo(wss);
						break;
					case "fileAsync":
						fileAsync.fileDemo(wss);
						break;
					case "httpClient":
						httpClient.callService(wss);
						break;
					case "dbAsync":
						dbAsync.dbCall(wss);
						break;
					case "dbAsync2":
						dbAsync2.dbCall(wss);
						break;
					default:
						wss.broadcast("Error: Undefined Action: " + data.action);
						break;
				}
			});
			ws.on("close", function() {
				console.log("Closed");
			});
			ws.on("error", function(error) {
				console.log("Web Socket Error: " + error.toString());
			});
			ws.send(JSON.stringify({
				text: "Connected to Exercise 3"
			}), function ack(error) {
				if (!typeof error === "undefined") {
					console.log("Send Error: " + error.toString());
				}
			});
		});
	} catch (e) {
		console.log("General Error: " + e.toString());
	}
	return app;
};