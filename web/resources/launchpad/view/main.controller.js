sap.ui.controller("shine.democontent.epm.launchpad.view.main", {

	onInit: function() {
		this.getView().addStyleClass("sapUiSizeCompact");
		
		// var data = [{
  //	       name:"userSession"
  //	    }];
		// var userModel = new sap.ui.model.json.JSONModel({modelData: data});
		// sap.ui.getCore().setModel(userModel, "user"); 
		// sap.ui.core.UIComponent.prototype.init.apply(this,arguments);
		// var mConfig = this.getMetadata().getConfig();
  // 	    var sServiceUrl = mConfig.serviceConfig.serviceUrl;
		
		
		// var oConfig = new sap.ui.model.json.JSONModel(sServiceUrl);
		// oConfig.attachRequestCompleted(jQuery.proxy(function(){
	 //       this.getSessionInfo();
	 //   }),this);
  //  	sap.ui.getCore().setModel(oConfig, "config");
  //  	this.setModel(oConfig, "config");

	},
	
	logout: function() {
		window.location.replace('/logout');
	},

	onAfterRendering: function() {

		var value = sap.app.localStorage.getPreference(sap.app.localStorage.PREF_SHOW_WELCOME);
		if (value !== 'false') {
			var welcomeDialog = new sap.account.WelcomeDialog(this);
			welcomeDialog.open();
		}
	},
	handlePress: function(oEvent) {
		var tileID;
		var tileId = oEvent.getSource().getId();
		if (tileId === "__xmlview0--dg") {
			tileID = 1;
		}
		if (tileId === "__xmlview0--po") {
			tileID = 2;
		}
		if (tileId === "__xmlview0--jobscheduling") {
			tileID = 3;
		}
		if (tileId === "__xmlview0--so") {
			tileID = 4;
		}
		if (tileId === "__xmlview0--uc") {
			tileID = 5;
		}
		if (tileId === "__xmlview0--spatial") {
			tileID = 8;
		}
		if (tileId === "__xmlview0--fulltextsearch") {
		 	tileID = 9;
	        }

		var value = sap.app.localStorage.getPreference(sap.app.localStorage.PREF_TILE_HELP_SHOW_PREFIX + tileID);
		if (value !== 'false') {
			var tileDialog = new sap.account.TileDialog(this);
			tileDialog.open(tileID);
		} else {
			var tileDialog = new sap.account.TileDialog(this);
			window.location = tileDialog.getHrefLocation(tileID);
		}
	},

	sourceCodeDownload: function() {
		sap.m.URLHelper.redirect("../source/sap-xsac-shine-src-code.zip", true);
	}

});
