sap.ui.controller("shine.democontent.epm.spatial.view.main", {

	// instantiated view will be added to the oViewCache object and retrieved from there
	oViewCache: {},

	onInit: function() {
	 
		sap.app.mainController = this;
	},

	/**
	 * getCachedView checks if view already exists in oViewCache object, will create it if not, and return the view
	 */
	getCachedView: function(viewName) {
		if (!this.oViewCache[viewName]) {
			var fullViewName = "shine.democontent.epm.spatial.view" + "." + viewName;
			this.oViewCache[viewName] = sap.ui.view({
				id: viewName,
				viewName: fullViewName,
				type: sap.ui.core.mvc.ViewType.XML
			});
		}
		return this.oViewCache[viewName];
	},

	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	 * (NOT before the first rendering! onInit() is used for that one!).
	 * @memberOf shine_so.main
	 */
	onBeforeRendering: function() {

	},

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf shine_so.main
	 */
	onAfterRendering: function() {
		var oController = this;
		var view = this.getView();
		var oShell = view.byId("main");

		oShell.addWorksetItem(new sap.ui.ux3.NavigationItem({
			id: "nav-bpDetails",
			text: sap.app.i18n.getText("BP_DETAILS_TITLE")
		}));
		oShell.addWorksetItem(new sap.ui.ux3.NavigationItem({
			id: "nav-sales-analysis",
			text: sap.app.i18n.getText("SALES_ANALYSIS")
		}));
		oShell.addWorksetItem(new sap.ui.ux3.NavigationItem({
			id: "nav-productsHeatMap",
			text: sap.app.i18n.getText("PRODUCT_SALES")
		}));

		oShell.addStyleClass('sapDkShell');

		// action when shell workset item are clicked
		oShell.attachWorksetItemSelected(function(oEvent) {
			var sViewName = oEvent.getParameter("id").replace("nav-", "");
			sViewName = sViewName.replace("main--", "");
			oShell.setContent(sap.app.mainController.getCachedView(sViewName));
		});
	    var userId = "";		
		
		var aUrl = '/sap/hana/democontent/epm/services/poWorklistQuery.xsjs?cmd=getSessionInfo';
		var loggedUser = "";
        jQuery.ajax({
            url: aUrl,
            method: 'GET',
            dataType: 'json',
            success: function(myJSON) {
            	userId = myJSON.session[0].UserName ;
                jQuery.sap.require("jquery.sap.storage");
            	  oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
			        var appIdKey = userId+":appId";
			        var appCodeKey = userId+":appCode";
			        if(oStorage.get(appIdKey))
			        {
			        	var appId = atob(oStorage.get(appIdKey));
			         	var appCode = atob(oStorage.get(appCodeKey));
			         	var aUrl1 = "https://signature.venue.maps.api.here.com/venues/signature/v1?xnlp=CL_JSMv3.0.12.5&app_id="+appId+"&app_code="+appCode;
					jQuery.ajax({
						url: aUrl1,
						method: 'GET',
						success: function(jqXHR1){
			        			sap.app.platform = new H.service.Platform({
											'app_id': appId,
											'app_code': appCode,
											'useHTTPS': true
										});
							// initialize the view
							// add initial shell content
							oShell.setContent(sap.app.mainController.getCachedView("bpDetails"));
			        		},
			        		error: function(jqXHR, textStatus, errorThrown){
							jQuery.sap.require("sap.ui.commons.MessageBox");
							sap.ui.commons.MessageBox.show("Please enter a valid appid and appcode. Please click YES inorder to update",
									sap.ui.commons.MessageBox.Icon.ERROR,
									"Invalid Evaluation Credentials",
									[sap.ui.commons.MessageBox.Action.YES, sap.ui.commons.MessageBox.Action.NO],
									 function callback(sResult){
									 	if(sResult === "YES"){
											sap.app.mainController.openWelcomeDialog(true);
									 	}
									},
									sap.ui.commons.MessageBox.Action.YES);
							// handleError: function(){
							// 	alert("inside error");   
							// }
						}});
			        }
			        else
			        {
			        oController.openWelcomeDialog(true);
			        }
			            },
			            error: function(err)
			            {
			            	sap.ui.commons.MessageBox.alert("Unexpected error occured."+err+"Please check the application logs for more details");
			            }
			        });
		
	},
	openHelpWindow: function(){
		var oController = this; 
		oController.openWelcomeDialog(false);
	},
	
	openSettings: function(oEvent){
		var oController = this; 
		oController.openWelcomeDialog(true);
	},
	
	openWelcomeDialog: function(isSettings){
		var oController = this; 
		var welcomeDialog = new sap.account.WelcomeDialog(oController, isSettings);
		welcomeDialog.open();
	},

	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * @memberOf shine_so.main
	 */
	onExit: function() {

	}
});
