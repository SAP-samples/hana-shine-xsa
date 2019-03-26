/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, no-use-before-define: 0, new-cap:0, linebreak-style: ["error", "windows"], no-undef:0*/
/*eslint-env node, es6*/
'use strict';
var Promise = require('promise');

//Data Generator Database access using promises
class DataGeneratorDB {
	constructor(req){
		this.client = req.db;
	}
	
	//execute query
	executeQuery(query){
		return new Promise((resolve,reject) => {
			this.client.exec(query,(err,rows) => {
				if(err){
					return reject(err);
				}
					return resolve(rows);
			});
		});
	}
	
	//close connections
	closeDB(){
		return new Promise((resolve,reject) => {
			this.client.close(err => {
				if(err){
					return reject(err);
				}
				resolve();	
			});	
		});
	}
	
}
module.exports = DataGeneratorDB;
