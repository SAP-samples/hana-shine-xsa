/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0, dot-notation:0, no-use-before-define:0, no-inner-declarations:0, no-undef:0 */
/*eslint-env node, es6 */
module.exports = class {
	constructor(db) {
		this.db = db;
	}
	getFlightDetails(carrierId, connectionId, flightDate) {
		let dbPromises = require(global.__base + 'utils/dbPromises');
		let dbConn = new dbPromises(this.db);
		return new Promise((resolve, reject) => {
			dbConn.preparePromisified('select * from SFLIGHT WHERE CARRID = ? AND CONNID = ? and FLDATE = ? ')
				.then(statement => {
					dbConn.statementExecPromisified(statement, [carrierId, connectionId, flightDate])
						.then(results => {
							resolve(results);
						})
						.catch(err => {
							let error = {};
							error.message = 'Invalid Flight';
							error.carrierId = carrierId;
							error.connectionId = connectionId;
							error.flightDate = flightDate;
							reject(error);
						});
				})
				.catch(err => {
					reject(error);
				});
		});
	}

	calculateFlightPrice(carrierId, connectionId, flightDate) {
		let dbPromises = require(global.__base + 'utils/dbPromises');
		let dbConn = new dbPromises(this.db);
		return new Promise((resolve, reject) => {
			dbConn.preparePromisified('select PRICE, CURRENCY, PLANETYPE from SFLIGHT WHERE CARRID = ? AND CONNID = ? and FLDATE = ? ')
				.then(statement => {
					dbConn.statementExecPromisified(statement, [carrierId, connectionId, flightDate])
						.then(results => {
							let price;
							switch (results[0].PLANETYPE) {
								case '747-400':
									price = results[0].PRICE + 40;
									break;
								case 'A310-300':
									price = results[0].PRICE + 25;
									break;
								default:
									price = results[0].PRICE + 10;
									break;
							}
							resolve(price);
						})
						.catch(err => {
							let error = {};
							error.message = 'Invalid Flight';
							error.carrierId = carrierId;
							error.connectionId = connectionId;
							error.flightDate = flightDate;
							reject(error);
						});
				})
				.catch(err => {
					reject(err);
				});
		});
	}
};
