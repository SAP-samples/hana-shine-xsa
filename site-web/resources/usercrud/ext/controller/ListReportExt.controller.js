sap.ui.controller("shine.democontent.epm.usercrud.ext.controller.ListReportExt", {
	onInit: function() {
		var oLocalUserData = {
			"FirstName": "",
			"LastName": "",
			"Email": "",
			"UserId": 1
		};
		this.oLocalUserModel = new sap.ui.model.json.JSONModel(oLocalUserData);
		this.getView().setModel(this.oLocalUserModel, "user");

		var oLocalUserBatchData = [{
			"FirstName": "",
			"LastName": "",
			"Email": "",
			"UserId": 1
		}];
		this.oBatchModel = new sap.ui.model.json.JSONModel(oLocalUserBatchData);
		this.getView().setModel(this.oBatchModel, "batch");

		//this.oBatchDialog = null;
	},
	newUser: function(oEvent) {
		if (!this.dialog) {
			this.dialog = sap.ui.xmlfragment("shine.democontent.epm.usercrud.ext.fragment.createNewUser", this);
			this.getView().addDependent(this.dialog);
		}
		this.dialog.open();
		return;
	},
	close: function(oEvent) {
		var oDialog = (oEvent.getSource()).getEventingParent();
		this.clearUIFields();
		oDialog.close();
	},
	clearUIFields: function() {
		var uiFieldsArray = [];
		var element1 = "firstNameTextField"; //sap.ui.getCore().byId("businessPartnerDropDown");
		var element2 = "lastNameTextField"; //sap.ui.getCore().byId("productDropDown");
		var element3 = "emailTextField";
		uiFieldsArray.push(element1);
		uiFieldsArray.push(element2);
		uiFieldsArray.push(element3);
		var uiFields = uiFieldsArray;
		//	console.log(uiFields);
		for (var i = 0; i < uiFields.length; i++) {
			var uiId = uiFields[i];
			var element = sap.ui.getCore().byId(uiId);
			if (element.getValue() !== "") {
				element.setValue("");
			}
			element.setValueState(sap.ui.core.ValueState.none);
		}
	},
	validateEmail : function(email){
		if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
		    return (true);
		 }
	    sap.m.MessageBox.show("You have entered an invalid email address!",
	    "ERROR",
	    "Error");
	    return (false);
	},
	validateFields: function(oEvent) {
		var doSubmit = true;
		var uiFieldsArray = [];
		var element1 = "firstNameTextField"; //sap.ui.getCore().byId("businessPartnerDropDown");
		var element2 = "lastNameTextField"; //sap.ui.getCore().byId("productDropDown");
		var element3 = "emailTextField";
		uiFieldsArray.push(element1);
		uiFieldsArray.push(element2);
		uiFieldsArray.push(element3);
		var uiFields = uiFieldsArray;
		for (var i = 0; i < uiFields.length; i++) {
			var uiId = uiFields[i];
			var element = sap.ui.getCore().byId(uiId);
			if (element.getValue() === "") {
				element.setValueState(sap.ui.core.ValueState.Error);
				doSubmit = false;
			}else {
				element.setValueState(sap.ui.core.ValueState.Success);
			}
		}
		var fn = sap.ui.getCore().byId(uiFields[0]);
		var ln = sap.ui.getCore().byId(uiFields[1]);
		var email = sap.ui.getCore().byId(uiFields[2]);
		if(fn.getValue()!=='' && ln.getValue()!==''){
			var flag = this.validateEmail(email.getValue());
			if(flag){
				email.setValueState(sap.ui.core.ValueState.Success);	
			}else{
				email.setValueState(sap.ui.core.ValueState.Error);
				doSubmit = false;
			}
		}	
		return doSubmit;
	},
	
	createUser: function(oEvent) {
		var that = this;

		var doSubmit = this.validateFields(oEvent);
		if (doSubmit === false) {
			return;
		}

		var rest_url = "/user/xsodata/user.xsodata/Users";
		var oEntry = this.getView().getModel("user").getData();
		// validate that all fields (FName, LName and EmailId) are populated
		// if (oEntry && (!oEntry.FirstName || !oEntry.LastName || !oEntry.Email)) {
		// 	sap.m.MessageBox.show("Please enter First Name,Last Name and Email",
		// 		"ERROR",
		// 		"Error");
		// 	return false;
		// }
		//sap.ui.core.BusyIndicator.show();
		var xsrf_token;
		$.ajax({
			type: "GET",
			async: false,
			url: rest_url, //"/user/odata/v4/UserData/User",
			contentType: "application/json",
			headers: {
				'x-csrf-token': 'Fetch',
				'Accept': "application/json"
			},
			success: function(data, textStatus, request) {
				xsrf_token = request.getResponseHeader('x-csrf-token');
			},
			error: function(error) {
				//sap.ui.commons.MessageBox.alert("Error occurred during user creation");
				sap.ui.core.BusyIndicator.hide();
				sap.m.MessageBox.show("Error occurred during user creation",
					"ERROR",
					"Error");
				that.clearUIFields();
				return;
			}
		});

		// var aUrl = '/user/odata/v4/UserData/User';
		jQuery.ajax({
			url: rest_url, //aUrl,
			method: 'POST',
			data: JSON.stringify(oEntry),
			contentType: "application/json",
			headers: {
				'x-csrf-token': xsrf_token,
				'Accept': "application/json"
			},
			success: function() {
				//sap.ui.commons.MessageBox.alert(oThis.getView().getModel("i18n").getProperty("USER_CREATED"));
			 sap.m.MessageToast.show('User created successfully', {
				duration: 10000, width:"20em"
			});
				that.clearUIFields();
				that.dialog.close();
				that.extensionAPI.refreshTable();
				that.resetUserModel();
				
				sap.ui.core.BusyIndicator.hide();
				
			},
			error: function(error) {
				//sap.ui.commons.MessageBox.alert(oThis.getView().getModel("i18n").getProperty("USR_CRT_ERROR"));
				sap.ui.core.BusyIndicator.hide();
				sap.m.MessageBox.show("Error occurred during user creation",
					"ERROR",
					"Error");
				that.clearUIFields();
			}
		});

	}
});
