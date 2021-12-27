/*eslint-env node, es6 */
'use strict';
module.exports = (app, server) => {
	app.use('/node', require('./routes/myNode')());
	app.use('/node/excAsync', require('./routes/exerciseAsync')(server));
	app.use('/node/textBundle', require('./routes/textBundle')());
	app.use('/node/chat', require('./routes/chatServer')(server));
	app.use('/node/excel', require('./routes/excel')());
	app.use('/node/xml', require('./routes/xml')());
	app.use('/node/zip', require('./routes/zip')());
	app.use('/node/cds', require('./routes/cds')());
	app.use('/node/auditLog', require('./routes/auditLog')());
	app.use('/sap/bc/lrep', require('./routes/lrep')());
	app.use('/node/annotations', require('./routes/annotations')());
	app.use('/node/JavaScriptBasics', require('./routes/JavaScriptBasics')());
	app.use('/node/promises', require('./routes/promises')());
	app.use('/node/es6', require('./routes/es6')());
	app.use("/node/secureStore", require("./routes/secureStore")());
	
	app.use('/jobactivity', require('./routes/jobactivity')());
	app.use('/jobs', require('./routes/jobs')());
	app.use('/schedules', require('./routes/schedules')());
	app.use('/replicate', require('./routes/datagen')());
	app.use('/reset', require('./routes/reset')());
	app.use('/get', require('./routes/get')());
    app.use('/sap/es/odata', function (req, res, next) {
         console.log("inside call");
         var client = req.db;
         console.log("inside builtin"+client);
        
        
    client.prepare('call SYS.ESH_SEARCH (?, ?)', function (err, statement) {
        if (err) {
            return console.error('Prepare error:', err);
        }
        var request = req.path;
        var parameters = '';
        for (var n in req.query) {
            var separator;
            separator = (parameters.length === 0 ? "" : "&");
            parameters = parameters + separator + n + "=" + req.query[n];
        }
        if (parameters) {
            request = request + '/?' + parameters;
        }
	request = encodeURI(request);
        statement.exec({
                REQUEST: '["' + request + '"]'
            },
            function (err, parameters, rows) {
                if (err) {
                    return console.error('Exec error:', err);
                }
                if (req.path.indexOf('$metadata') > -1) {
                    res.set('Content-Type', 'application/xml');
                } else {
                    res.set('Content-Type', 'application/json');
                }
		 res.send(parameters[0].RESPONSE);
                //res.send(new Buffer(rows[0].RESPONSE));
            });
    });
});	
};
