sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device"
], function(UIComponent, Device) {
	"use strict";

	return UIComponent.extend("shine.democontent.epm.launchpad.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// // set the device model
			// this.setModel(models.createDeviceModel(), "device");

			sap.app = {};

			jQuery.sap.registerModulePath('app', 'js');

			jQuery.sap.require("app.welcome");
			jQuery.sap.require("app.tileDialog");
			jQuery.sap.require("app.checkDialog");
			jQuery.sap.require("app.localstorage");

			// Internationalization:
			// create global i18n resource bundle for texts in application UI
			sap.app.i18n = jQuery.sap.resources({
				url: "i18n/messagebundle.hdbtextbundle",
				locale: sap.ui.getCore().getConfiguration().getLanguage()
			});
			sap.ui.getCore().setModel(sap.app.i18n, "i18n");
			
			
			
		
		
		var oConfig = new sap.ui.model.json.JSONModel();
		 
		//oConfig.attachRequestCompleted(function(){
	        //this.getSessionInfo();
	    //});
    	sap.ui.getCore().setModel(oConfig, "config");
    	this.setModel(oConfig, "config");
		console.log(oConfig);	
		this.getSessionInfo();

		},
		getSessionInfo: function() {
		var aUrl = '/user/xsjs/userSessionInfo.xsjs';
		// this.onLoadSession(
		// 	JSON.parse(jQuery.ajax({
		// 		url: aUrl,
		// 		method: 'GET',
		// 		dataType: 'json',
		// 		async: false
		// 	}).responseText));
		var that = this;
		jQuery.ajax({
			url: aUrl,
			method: 'GET',
			dataType: 'json',
			async: false,
			success: function(data){
				var mConfig = that.getModel("config");
				console.log(data);
				mConfig.setProperty("/UserName",data.session[0].UserName);
				console.log(mConfig);
			}
		});

	},

	onLoadSession: function(myJSON) {
		var mConfig = this.getModel("config");
		mConfig.setProperty("/UserName", JSON.parse(myJSON.session[0].UserName));
		console.log(mConfig);
	}
	
	});
});
