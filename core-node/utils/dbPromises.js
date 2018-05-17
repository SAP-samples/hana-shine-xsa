/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0, dot-notation:0, no-use-before-define:0 */
/*eslint-env node, es6 */
'use strict';

module.exports = class {
	constructor(client) {
		this.client = client;
	}

	preparePromisified(query) {
		return new Promise((resolve, reject) => {
			this.client.prepare(query, (error, statement) => {
				if (error) {
					reject(error);
				} else {
					resolve(statement);
				}
			});
		});
	}

	statementExecPromisified(statement, parameters) {
		return new Promise((resolve, reject) => {
			statement.exec(parameters, (error, results) => {
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	}

	loadProcedurePromisified(hdbext, schema, procedure) {
		return new Promise((resolve, reject) => {
			hdbext.loadProcedure(this.client, schema, procedure, (error, storedProc) => {
				if (error) {
					reject(error);
				} else {
					resolve(storedProc);
				}
			});
		});
	}

	callProcedurePromisified(storedProc, inputParams) {
		return new Promise((resolve, reject) => {
			storedProc(inputParams, (error, outputScalar, results) => {
				if (error) {
					reject(error);
				} else {
					resolve({
						outputScalar: outputScalar,
						results: results
					});
				}
			});
		});
	}
};
