jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.ui.core.format.DateFormat");
jQuery.sap.require("shine.democontent.epm.job.util.utility");
jQuery.sap.require("shine.democontent.epm.job.app.tileDialog");

sap.ui.controller("shine.democontent.epm.job.view.app", {

	handlePressHome: function(oEvent) {
		sap.m.URLHelper.redirect("../launchpad/index.html", false);
	},

	onInit: function() {
		this.loadJobsTable();
		this.setDateTimeValue();
	},

	loadJobsTable: function() {
		var oTable = this.getView().byId("manageJobsTable");
		$.ajax({
			type: "GET",
			url: "/schedules/getJobSchedules",
			async: true,
			dataType:'json',
			success: function(data, textStatus, request) {
				var oModelTable = new sap.ui.model.json.JSONModel();
				oModelTable.setData({
					modelData: data
				});
				oTable.setModel(oModelTable);
				oTable.bindRows("/modelData");
			},
			error: function(jqXHR, textStatus, errorThrown) {
				sap.ui.commons.MessageBox.show("Error in loading Jobs Table",
					"ERROR",
					"Error");
				return;
			}
		});
	},
	
	setDateTimeValue: function(){
			this.getView().byId('startDateField').setDateValue(new Date());
			var tomorrow = new Date();
			var newDate = new Date(tomorrow.getTime()+1*24*60*60*1000);
			// tomorrow.setDate(tomorrow.getDate()+1);
			// tomorrow.setTime(tomorrow.getTime());  
			this.getView().byId('endDateField').setDateValue(newDate);
			this.getView().byId('startTimeField').setDateValue(new Date());
			this.getView().byId('endTimeField').setDateValue(new Date());
	},
	
	checkValue: function(oEvent){
		if(oEvent.getSource().getValue() === ""){
			oEvent.getSource().setDateValue(new Date());
		}
	},

	onButtonPress: function(oEvent, oController) {
		//on New Button Press
		// var i18n = this.getView.getModel("i18n");
		var oBundle = jQuery.sap.resources({
			url: "/resources/job/i18n/messagebundle.hdbtextbundle",
			locale: "EN"
		});
		var oThis = this;
		if (oEvent.getSource() === this.byId("btnNew")) {
			var doSubmit = this.validateFields(oEvent, oController);
			if (doSubmit === false) {
				return;
			}
			var uiKeyMapper = oBundle.getText("uiKeyMapper");
			var uiFieldArrayMapper = uiKeyMapper.split(",");

			var item = {};
			for (var i = 0; i < uiFieldArrayMapper.length; i++) {
				var id = (uiFieldArrayMapper[i].split(":"))[0];
				var uiId = (uiFieldArrayMapper[i].split(":"))[1];
				var element = this.getView().byId(uiId);
				var value = element.getValue();
				if ((uiId.indexOf("Time")>-1 || uiId.indexOf("Date")>-1) !== false) {
					var uiIdTime = uiId.replace("Date","Time");
					var elementValue = this.getView().byId(uiIdTime).getValue();
					var offset = new Date().getTimezoneOffset();
					
					// offset = ((offset<0? '+':'-')+ // Note the reversed sign!
        				offset = new Date().toString().match(/([-\+][0-9]+)\s/)[1];
					value = value+" "+elementValue+" "+offset;
				}
				item[id] = value;
			}
            // item.password= window.btoa(item.password);
             item.appurl = "https://"+window.location.hostname+":"+window.location.port+"/jobactivity/create";
			var xsrf_token;
			var jobLength;
			$.ajax({
				type: "GET",
				async: false,
				url: "/schedules/getJobSchedules",
				contentType: "application/json",
				headers: {
					'x-csrf-token': 'Fetch',
					'Accept': "application/json"
				},
				success: function(data, textStatus, request) {
					xsrf_token = request.getResponseHeader('x-csrf-token');
					jobLength = data.length;
				},
				error: function(jqXHR, textStatus, errorThrown) {
					sap.ui.commons.MessageBox.show("Error in fetching XSRF token",
						"ERROR",
						"Error");
					return;
				}
			});
			
			if(jobLength != undefined && jobLength > 4){
				sap.m.MessageBox.show("Maximum Job reached.",
						     "ERROR",
						     "Error");
				return;
			}
			
			$.ajax({
				type: "POST",
				url: "/schedules/createJobSchedule",
				headers: {
					'x-csrf-token': xsrf_token
				},
				contentType: "application/json",
				data: JSON.stringify(item),
				dataType: "json",
				success: function(data, oController) {
					// var obj = JSON.parse(data);
					var oJobName = data.JobName;
					sap.ui.commons.MessageBox.show('Job ' + oJobName + ' Created Successfully',
						"SUCCESS",
						"Job is created and scheduled successfully");
						oThis.loadJobsTable();
						oThis.clearUIFields();
				},
				error: function(jqXHR, textStatus, errorThrown) {
					var jsonMessage = JSON.parse(jqXHR.responseText);
					var message = jsonMessage.message;
					sap.ui.commons.MessageBox.show(message,
							"ERROR",
							"Error");
					return;
				}
			});
			return;
		} else if (oEvent.getSource() === this.byId("btnDeleteLogs")) {
			var xsrf_token;
			$.ajax({
				type: "GET",
				async: false,
				url: "/schedules/getjobschedules",
				contentType: "application/json",
				headers: {
					'x-csrf-token': 'Fetch',
					'Accept': "application/json"
				},
				success: function(data, textStatus, request) {
					xsrf_token = request.getResponseHeader('x-csrf-token');
				},
				error: function(jqXHR, textStatus, errorThrown) {
					sap.ui.commons.MessageBox.show("Error in fetching XSRF token",
						"ERROR",
						"Error");
					return;
				}
			});
			$.ajax({
				type: "DELETE",
				url: "/jobs/deleteData",
				headers: {
					'x-csrf-token': xsrf_token
				},
				success: function(data, textStatus, request) {
					sap.ui.commons.MessageBox.show("Job activity logs have been deleted successfully",
					"SUCCESS",
					"Job Deletion");
					oThis.loadJobActivitiesTable();
				},
				error: function(jqXHR, textStatus, errorThrown) {
					sap.ui.commons.MessageBox.show("Deletion of Job Activity Logs Failed",
						"ERROR",
						"Error");
					return;
				}
			});
		} else if (oEvent.getSource() === this.byId("btnRefreshJobActivity")) {
			this.loadJobActivitiesTable();
		} else if (oEvent.getSource() === this.byId("btnDeleteJob")) {
			this.deleteJob();
			this.loadJobsTable();
		}
	},

	validateFields: function(oEvent, oController) {
		// var i18n = this.getView.getModel("i18n");
		var oBundle = jQuery.sap.resources({
			url: "/resources/job/i18n/messagebundle.hdbtextbundle",
			locale: "EN"
		});
		var doSubmit = true;
		var uiFieldsArray = oBundle.getText("uiKeyMapper");
		var uiFields = uiFieldsArray.split(",");
		for (var i = 0; i < uiFields.length; i++) {
			var uiId = (uiFields[i].split(":"))[1];
			var element = this.getView().byId(uiId);
			if (element.getValue() === "") {
					element.setValueState(sap.ui.core.ValueState.Error);
					doSubmit = false;
			} else {
				element.setValueState(sap.ui.core.ValueState.None);
			}
		}
		if(doSubmit === true){
			var currentDate = new Date();
			var endDate = (this.getView().byId('endDateField')).getDateValue();
			var endTime = (this.getView().byId('endTimeField')).getDateValue();
			endDate.setHours(endTime.getHours());
			endDate.setMinutes(endTime.getMinutes());
			endDate.setSeconds(endTime.getSeconds());
			
			var startDate = (this.getView().byId('startDateField')).getDateValue();
			var startTime = (this.getView().byId('startTimeField')).getDateValue();
			startDate.setHours(startTime.getHours());
			startDate.setMinutes(startTime.getMinutes());
			startDate.setSeconds(startTime.getSeconds());
			if(startDate > endDate){
				sap.ui.commons.MessageBox.show("Enter a valid value for start date and end date",
						"ERROR",
						"Error");
				doSubmit = false;
			}
			
			if((startDate < currentDate) && (endDate < currentDate)){
					sap.ui.commons.MessageBox.show("You cannot schedule a job in the past!",
						"ERROR",
						"Error");
				doSubmit = false;
			} 
		}
		return doSubmit;
	},

	clearUIFields: function() {
		// var i18n = this.getView.getModel("i18n");
		var oBundle = jQuery.sap.resources({
			url: "/resources/job/i18n/messagebundle.hdbtextbundle",
			locale: "EN"
		});
		var uiFieldsArray = oBundle.getText("uiKeyMapper");
		var uiFields = uiFieldsArray.split(",");
		for (var i = 0; i < uiFields.length; i++) {
			var uiId = (uiFields[i].split(":"))[1];
			var element = this.getView().byId(uiId);
			if (element.getValue() !== "") {
				element.setValue("");
			}
			element.setValueState(sap.ui.core.ValueState.none);
		}
		this.setDateTimeValue();
		this.getView().byId("xsCronInput").setValue("* * * * * * */30");
	},
	
	onTabPress: function(oEvent){
		if (oEvent.getParameter("key") === "manage"){
			// this.loadJobsTable();
		}
		if (oEvent.getParameter("key") === "jobAction"){
			this.loadJobActivitiesTable();
		}
	},

	loadJobActivitiesTable: function() {
		var oTable = this.getView().byId("jobActionsTable");
		$.ajax({
			type: "GET",
			url: "/jobs/getAllJobs",
			async: true,
			dataType: 'json',
			success: function(data, textStatus, request) {
				var oModelTable = new sap.ui.model.json.JSONModel();
				oModelTable.setData({
					modelData: data
				});
				oTable.setModel(oModelTable);
				oTable.bindRows("/modelData");
			},
			error: function(jqXHR, textStatus, errorThrown) {
				sap.ui.commons.MessageBox.show("Error in fetching XSRF Token",
					"ERROR",
					"Error");
				return;
			}
		});
	},

	deleteJob: function() {
		var oTable = this.getView().byId("manageJobsTable");
		var model = oTable.getModel();
		var jobId = model.getProperty("JobId", oTable.getContextByIndex(oTable.getSelectedIndex()));
		if(jobId!="" && jobId!=null){
			var oThis = this; 
			var xsrf_token;
			$.ajax({
				type: "GET",
				async: false,
				url: "/schedules/getJobSchedules",
				contentType: "application/json",
				headers: {
					'x-csrf-token': 'Fetch',
					'Accept': "application/json"
				},
				success: function(data, textStatus, request) {
					xsrf_token = request.getResponseHeader('x-csrf-token');
				},
				error: function(jqXHR, textStatus, errorThrown) {
					sap.ui.commons.MessageBox.show("Error in fetching XSRF Token",
						"ERROR",
						"Error");
					return;
				}
			});
	
			$.ajax({
				type: "DELETE",
				url: "/schedules/deleteJobSchedules/" + jobId,
				headers: {
					'x-csrf-token': xsrf_token
				},
				success: function(data) {
					sap.ui.commons.MessageBox.show(data.message,
						"SUCCESS",
						"Schedule deleted successfully");
					oThis.loadJobsTable();
				},
				error: function(jqXHR, textStatus, errorThrown) {
					sap.ui.commons.MessageBox.show("Deletion of schedule failed",
						"ERROR",
						"Error");
					return;
				}
			});
		}else{
			sap.ui.commons.MessageBox.show("Please select a schedule to delete",
						"ERROR",
						"Error");
					return;
		}
	}

});
