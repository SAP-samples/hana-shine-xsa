sap.ui.controller("view.main", {

	onInit: function() {
	
	},

	
	onAfterRendering: function() {

		var value = sap.app.localStorage.getPreference(sap.app.localStorage.PREF_SHOW_WELCOME);
		if (value !== 'false') {
			var welcomeDialog = new sap.account.WelcomeDialog(this);
			welcomeDialog.open();
		}
	}

	

});