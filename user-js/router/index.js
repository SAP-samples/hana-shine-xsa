"use strict";

module.exports = function(app,server) {
	app.use("/jobactivity", require("./routes/jobactivity")());
	app.use("/jobs", require("./routes/jobs")());
	app.use("/schedules", require("./routes/schedules")());	
};