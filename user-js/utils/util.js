/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, no-use-before-define: 0, new-cap:0 */
"use strict";
const xsenv = require("@sap/xsenv");

module.exports = {
	callback: (error, res, message) => {
		if (error) {
			res.writeHead(500, {
				'Content-Type': 'application/json'
			});
			res.end(JSON.stringify({
				message: message
			}));
		} else {
			res.writeHead(200, {
				'Content-Type': 'application/json'
			});
			res.end(JSON.stringify({
				message: message
			}));
		}
	},
	appconfig: () => {
		const services = xsenv.getServices({jobscheduler:{ tag: "jobscheduler" }}).jobscheduler;
		return {
			timeout: 15000,
    		user: services.user,
    		password: services.password,
    		baseURL: services.url
		};
	},
	isAlphaNumeric: (str) => {
		let code, i, len;
		for (i = 0, len = str.length; i < len; i++) {
			code = str.charCodeAt(i);
			if (!(code > 47 && code < 58) && // numeric (0-9)
				!(code > 64 && code < 91) && // upper alpha (A-Z)
				!(code > 96 && code < 123)) { // lower alpha (a-z)
				return false;
			}
		}
		return true;
	},
	
	isAlphaNumericAndSpace: (str) => {
		 const res = str.match(/^[a-z\d\-_\s]+$/i);
		 if(res)
		 {
		 	return true ;
		 }
		 else
		 {
		 	return false ;
		 }
		
	},

	isValidDate: (date) => {
		let timestamp = Date.parse(date);
		if (isNaN(timestamp) === true) {
			return false;
		}
		// if(timestamp === "NaN"){
		// 	return false;
		// }
		return true;
	}
};