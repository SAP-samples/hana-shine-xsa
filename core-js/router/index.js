"use strict";

module.exports = function(app,server) {
	 app.use("/node", require("./routes/myNode")());
	// app.use("/node/excAsync", require("./routes/exerciseAsync")(server));
	 app.use("/node/textBundle", require("./routes/textBundle")());
	 //app.use("/node/chat", require("./routes/chatServer")(server));
	 app.use("/node/excel", require("./routes/excel")());
	 app.use("/node/xml", require("./routes/xml")());
	 app.use("/node/zip", require("./routes/zip")());
	 app.use("/node/cds", require("./routes/cds")());
	 app.use("/node/auditLog", require("./routes/auditLog")());
	 app.use("/replicate", require("./routes/datagen")());
	 app.use("/reset", require("./routes/reset")());
	 app.use("/get", require("./routes/get")());
	 app.use("/sap/bc/lrep", require("./routes/lrep")());
	 app.use("/node/annotations", require("./routes/annotations")());
};
