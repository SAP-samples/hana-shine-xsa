"use strict";
var http = require("http");

module.exports = {
	callService: function(wss) {

		wss.broadcast("Before HTTP Call\n");

		try {
			http.get({
					path: "http://www.loc.gov/pictures/search/?fo=json&q=SAP&",
					host: "www.loc.gov",
					port: "80",
					headers: {
						host: "www.loc.gov"
					}
				},
				/*http.get(
	{path: "http://www.loc.gov/pictures/search/?fo=json&q=SAP&",
     host: "proxy.wdf.sap.corp",
     port: "8080",
     headers: {
     	host: "www.loc.gov"
     }}, */
				function(response) {
					response.setEncoding("utf8");
					response.on("data", function(data) {
						wss.broadcast(data.substring(0, 100));
					});
					response.on("error", wss.broadcast);
				});
		} catch (err) {
				wss.broadcast(err.toString());
		}
		wss.broadcast("After HTTP Call\n");

	}
};