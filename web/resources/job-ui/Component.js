jQuery.sap.require("jquery.sap.resources");
jQuery.sap.declare("sap.hana.democontent.epm.job.Component");

sap.app = {};

sap.ui.core.UIComponent.extend("sap.hana.democontent.epm.job.Component", {

	metadata : {
		name : "SHINE - Job Scheduling",
		version : "1.0",
		includes : [],
		dependencies : {
			libs : ["sap.m", "sap.ui.layout"],
			components : []
		},

		rootView : "sap.hana.democontent.epm.job.view.app",

		config : {
			resourceBundle : "i18n/messagebundle.hdbtextbundle",
			serviceConfig : {
               serviceUrl : "/jobschedule/getjobschedules"
           }
		}

	},
	
	init : function() {
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

		var mConfig = this.getMetadata().getConfig();

		// always use absolute paths relative to our own component
		// (relative paths will fail if running in the Fiori Launchpad)
		var oRootPath = jQuery.sap.getModulePath("sap.hana.democontent.epm.job");

		// set i18n model
		var i18nModel = new sap.ui.model.resource.ResourceModel({
			bundleUrl : [oRootPath, mConfig.resourceBundle].join("/")
		});
		this.setModel(i18nModel, "i18n");
	}
});