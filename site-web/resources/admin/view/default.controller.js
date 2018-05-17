var displayRecords = 0;
jQuery.sap.require("sap.ui.commons.MessageBox");
sap.ui.controller("sap.hana.democontent.epm.admin.view.default", {
	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 */
	onInit: function() {
		// attach handlers for validation errors
		sap.ui.getCore().attachValidationError(function(evt) {
			var control = evt.getParameter("element");
			if (control && control.setValueState) {
				control.setValueState("Error");
			}
		});
		sap.ui.getCore().attachValidationSuccess(function(evt) {
			var control = evt.getParameter("element");
			if (control && control.setValueState) {
				control.setValueState("None");
			}
		});

		var oVizFrame = this.getView().byId("idVizFrameBar");

		// A Dataset defines how the model data is mapped to the chart 
		var oDataset = new sap.viz.ui5.data.FlattenedDataset({
			dimensions: [{
				axis: 1,
				name: oBundle.getText("table"),
				value: "{TABLE_SYNONYM}"

			}],

			// it can show multiple measures, each results in a new set of bars in a new color 
			measures: [
				// measure 1
				{
					group: 1,
					name: oBundle.getText("size"), // 'name' is used as label in the Legend 
					value: "{RECORD_COUNT}" // 'value' defines the binding for the displayed value   
				}, {
					group: 2,
					name: oBundle.getText("size2"), // 'name' is used as label in the Legend 
					value: "{TABLE_SIZE}" // 'value' defines the binding for the displayed value   
				}
			],

			// 'data' is used to bind the whole data collection that is to be displayed in the chart 
			data: {
				path: "/modelData"
			}

		});
		oVizFrame.setDataset(oDataset);
		var data = sap.ui.getCore().getModel("chart").getData();
		oVizFrame.setModel(sap.ui.getCore().getModel("chart"));

		oVizFrame.setTitle(new sap.viz.ui5.types.Title({
			visible: true,
			text: oBundle.getText("bartitle")
		}));

		oVizFrame.setPlotArea(new sap.viz.ui5.types.VerticalBar({
			dataLabel: {
				visible: true,
				formatString: "#,##0"
			},
			isFixedDataPointSize: true
		}));

		oVizFrame.setYAxis(new sap.viz.ui5.types.Axis({
			label: {
				formatString: "u"
			}
		}));

		oVizFrame.setToolTip(new sap.viz.ui5.types.Tooltip({
			formatString: [
					[tooltipFormatString]
				] // defined in global.js
		}));

		this.getTableSizes(this);
	},

	onHelpOpen: function() {
		var view = this.getView();
		view._bDialog = sap.ui.xmlfragment(
			"sap.hana.democontent.epm.admin.view.tileDialog", this // associate controller with the fragment
		);
		view._bDialog.addStyleClass("sapUiSizeCompact");
		view.addDependent(this._bDialog);
		view._bDialog.open();

	},

	onDialogCloseButton: function() {
		this.getView()._bDialog.close();
	},

	onExecute: function() {
		// collect input controls
		var view = this.getView();
		var inputs = [
			view.byId("POVal"),
			view.byId("SOVal")

		];

		// check that inputs are not empty
		// this does not happen during data binding as this is only triggered by changes
		jQuery.each(inputs, function(i, input) {
			if (!input.getValue()) {
				input.setValueState("Error");
			}
		});

		// check states of inputs
		var canContinue = true;
		jQuery.each(inputs, function(i, input) {
			if ("Error" === input.getValueState()) {
				canContinue = false;
				return false;
			}
		});
        var oModel = sap.ui.getCore().getModel();
		var totalPO = parseInt(oModel.getProperty('/POVal'), 10);
		var totalSO = parseInt(oModel.getProperty('/SOVal'), 10);
		
		if(totalPO > 20 || totalSO > 20)
		{   canContinue = false;
			sap.ui.commons.MessageBox.show("Please enter a number between 1 and 20",sap.ui.commons.MessageBox.Icon.ERROR,"Error");
			
		}
		else  if (canContinue) {
			this.
			executeCall(this);
		} 
		 
		else {
			sap.m.MessageBox.alert(oBundle.getText("ValidNumber"));
		}
	},

	executeCall: function(oController) {
		//changes to check if DG is being executed by a different user.This would avoid simultaneous updates    		 
		var that = this;
		var xsrf_token;

		var intRegex = /^\d+$/;
		var oModel = sap.ui.getCore().getModel();
		if (oModel.getProperty('cb5') === true) {
			if (parseInt(oModel.getProperty('/POVal')) !== 0 || parseInt(oModel.getProperty('/SOVal')) !== 0) {
				oModel.setProperty('txtLog', "");
				phase1 = 0;
				phase2 = 0;
				phase3 = 0;
				phase4 = 0;
				poLoops = 0;
				soLoops = 0;
				totalOrdersCreated = 0;
				//displayRecords = 0;
				oModel.setProperty('/percentValue', 0);
				oModel.setProperty('/displayValue', "");
				sap.m.MessageBox.show(oBundle.getText("confirm_delete"), {
					icon: sap.m.MessageBox.Icon.QUESTION,
					title: oBundle.getText("title_delete"),
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					onClose: function(bResult) {
						oController.executeConfirm(bResult, oController);
					}
				});
			}

		} else {
			oModel.setProperty('/txtLog', "");
			phase1 = 0;
			phase2 = 0;
			phase3 = 0;
			phase4 = 0;
			poLoops = 0;
			soLoops = 0;
			oModel.setProperty('/percentValue', 0);
			oModel.setProperty('/displayValue', "");
			sap.m.MessageBox.show(oBundle.getText("confirm_delete"), {
				icon: sap.m.MessageBox.Icon.QUESTION,
				title: oBundle.getText("title_delete"),
				actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
				onClose: function(bResult) {
					oController.executeConfirm(bResult, oController);
				}

			});
		}

	},

	executeConfirm: function(bResult, oController) {
		if (bResult === 'CANCEL') {
			return
		};
		//ajax call to fetch the xsrf token
		additionalSession = false;
		var oModel = sap.ui.getCore().getModel();
		if (bResult) {
			if (oModel.getProperty("/cb1")) {
				var urls = [
					'/reset/addresses',
					'/reset/partners',
					'/reset/employees',
					'/reset/products',
					'/reset/constants',
					'/reset/texts',
					'/reset/notes',
					'/reset/attachments'
				];
				oController.reloadData(urls, oController, "cb1");

			} else if (oModel.getProperty("/cb2")) {
				var urls = [
					'/reset/soheader',
					'/reset/soitem',
					'/reset/poheader',
					'/reset/poitem'
				];
				oController.reloadData(urls, oController, "cb2");

			} else if (oModel.getProperty("/cb4")) {
				var oModel = sap.ui.getCore().getModel();
				oModel.setProperty('/percentValue', 0);
				oModel.setProperty('/displayValue', "");
				oModel.setProperty('/txtLog', "");
				var xsrf_token;
				soLoops = 0;
				poLoops = 0;
				soRequired = parseInt(oModel.getProperty('/SOVal'), 10);;
				poRequired = parseInt(oModel.getProperty('/POVal'), 10);;
				$.ajax({
						type: "GET",
						async: false,
						url: "/sap/hana/democontent/epm/services/poCreate.xsodata",
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
				for (var i = 0; i < soRequired; i++) {
					jQuery.ajax({
						url: '/replicate/sales',
						headers: {
								'x-csrf-token': xsrf_token
								 },
						method: 'POST',
						contentType: "application/json",
						dataType: 'json',
						success: function(myTxt) {
							oModel.setProperty('/txtLog', myTxt.message + "\n" + oModel.getProperty('/txtLog'));
							soLoops++;
							oModel.setProperty('/percentValue',
								Math.round((soLoops + poLoops) / (soRequired + poRequired) * 100));
							oModel.setProperty('/displayValue',
								oBundle.getText("generatedPG", [
									(soLoops + poLoops) * 1000,
									(soRequired + poRequired) * 1000
								]));
							if ((soLoops + poLoops) >= (soRequired + poRequired)) {
								oController.getTableSizes();
							}
						},
						error: function(jqXHR, textStatus, errorThrown) {
							onError(jqXHR.status, oBundle.getText("cb4"));
							i = soRequired + 1;
						},
						async: false
					});
				}
				for (var j = 0; j < poRequired; j++) {
					jQuery.ajax({
						url: '/replicate/purchase',
						headers: {
									'x-csrf-token': xsrf_token
								 },
						method: 'POST',
						dataType: 'json',
						success: function(myTxt) {
							oModel.setProperty('/txtLog', myTxt.message + "\n" + oModel.getProperty('/txtLog'));
							soLoops++;
							oModel.setProperty('/percentValue',
								Math.round((soLoops + poLoops) / (soRequired + poRequired) * 100));
							oModel.setProperty('/displayValue',
								oBundle.getText("generatedPG", [
									(soLoops + poLoops) * 1000,
									(soRequired + poRequired) * 1000
								]));
							if ((soLoops + poLoops) >= (soRequired + poRequired)) {
								oController.getTableSizes();
							}
						},
						error: function(jqXHR, textStatus, errorThrown) {
							onError(jqXHR.status, oBundle.getText("cb4"));
							j = poRequired + 1;
						},
						async: false
					});
				}
			}
			// checkbox for time based data generator
			else if (oModel.getProperty("/cb5")) {
				totalOrdersCreated = 0;
				soLoops = 0;
				poLoops = 0;
				//displayRecords = 0;
				//oModel.setProperty('/percentValue',0);
				oModel.setProperty('/displayValue', "");
				var oModel = sap.ui.getCore().getModel();
				var soLoops = parseInt(oModel.getProperty('/SOVal'), 10);
				var poLoops = parseInt(oModel.getProperty('/POVal'), 10);
				oModel.setProperty('/percentValue', (soLoops + poLoops) * 1000);
				
				
			
					if (parseInt(oModel.getProperty('/POVal')) !== 0) {
					var noRec = oModel.getProperty('/POVal');
					var url = "/replicate/timebasedPO";
					oController.triggerReplicateTimeBasedPO(oController, noRec, url, "PurchaseOrderId");
				}
				if (parseInt(oModel.getProperty('/SOVal')) !== 0) {
					noRec = oModel.getProperty('/SOVal');
					url = "/replicate/timebasedPO";
					oController.triggerReplicateTimeBasedPO(oController, noRec, url, "SalesOrderId");
				}
				
			
			}
		}
	},

	reloadData: function(urls, oController, msg) {
		var oModel = sap.ui.getCore().getModel();
		oModel.setProperty('/percentValue', 0);
		oModel.setProperty('/displayValue', "");
		oModel.setProperty('/txtLog', "");
		resetCount = 0;
		var xsrf_token;
		resetMax = urls.length;
		//get xsrf token
			$.ajax({
			type: "GET",
			async: false,
			url: "/sap/hana/democontent/epm/services/poCreate.xsodata",
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
		for (var i = 0; i < urls.length; i++) {
			
			jQuery.ajax({
				url: urls[i],
				headers: {
						'x-csrf-token': xsrf_token
			             },
				method: 'POST',
				dataType: 'json',
				success: function(myTxt) {
					oModel.setProperty('/txtLog', myTxt.message + "\n" + oModel.getProperty('/txtLog'));
					resetCount++;
					oModel.setProperty('/percentValue',
						Math.round(resetCount / resetMax * 100));
					oModel.setProperty('/displayValue',
						oBundle.getText("reloadedPG", [resetCount, resetMax]));
					if (resetCount >= resetMax) {
						oController.getTableSizes();
					}
				},
				error: function(jqXHR, textStatus, errorThrown) {
					onError(jqXHR.status, oBundle.getText(msg));
				},
				async: false
			});
		}
	},
	
	// For time based data generation
	triggerReplicateTimeBasedPO: function(oController, noRec, url, id) {
		if (additionalSession)
			return;
		var oModel = sap.ui.getCore().getModel();
		var startdate = oModel.getProperty('/startDate').toDateString();
		var enddate = oModel.getProperty("/endDate").toDateString();
		var noRecSO = oModel.getProperty('/SOVal');
		var dummy = oController.getUniqueTime().toString();
		poLoops = parseInt(oModel.getProperty('/POVal'), 10);
		var xsrf_token;
		var item = {};
		item.startdate = startdate;
		item.enddate = enddate;
		item.noRec = noRec;
		item.dummy = dummy;
		item.id = id;
		var itemSo = {};
		itemSo.startdate = startdate;
		itemSo.enddate = enddate;
		itemSo.noRec = noRecSO;
		itemSo.dummy = dummy;
		$.ajax({
			type: "GET",
			async: false,
			url: "/sap/hana/democontent/epm/services/poCreate.xsodata",
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

		jQuery.ajax({
			url: url,
			headers: {
				'x-csrf-token': xsrf_token
			},
			method: 'POST',
			data: JSON.stringify(item),
			async: true,
			contentType: "application/json",
			dataType: 'json',
			success: function(myTxt) {
				var oModel = sap.ui.getCore().getModel();
				//var total = oModel.getProperty('/percentValue');
				oModel.setProperty('/txtLog', myTxt.message + "\n" + oModel.getProperty('/txtLog'));

				var totalPO = (parseInt(oModel.getProperty('/POVal'), 10)) * 1000;
				var totalSO = (parseInt(oModel.getProperty('/SOVal'), 10)) * 1000;
				var percentValue = totalPO + totalSO;
				var displayValue = oModel.getProperty('/displayValue');
				displayValue = parseInt(displayValue, 10);
				//oModel.setProperty('/txtLog', myTxt.message + oModel.getProperty('/txtLog'));	   
				var totalNumberOfRecordsTxt = (myTxt.message).split(":");
				var numberOfRecordsTxt = (totalNumberOfRecordsTxt[1]).trim();
				displayRecords = displayRecords + parseInt(numberOfRecordsTxt);
				if (isNaN(displayValue)) {
					displayValue = 0;
				}
				displayValue = displayValue * 1000;
				totalOrdersCreated = totalOrdersCreated + displayValue;
				oModel.setProperty('/percentValue', Math.round((displayRecords / percentValue) * 100));
				oModel.setProperty('/displayValue', oBundle.getText("generatedPG", [
					numericSimpleFormatter(displayRecords),
					numericSimpleFormatter(percentValue)
				]));
				if (displayRecords === percentValue) {
					displayRecords = 0;
					oController.getTableSizes();
				}
				//oController.onTimeBasedRequestComplete(myTxt, oController);
			},
			error: function(jqXHR, textStatus, errorThrown) {
			if (id=="PurchaseOrderId")
			{
			var errorString = "Unexpected error occured during Purchase order data generation.Please check the logs for more details";
			}
			else
			{
			var errorString = "Unexpected error occured during sales order data generation.Please check the logs for more details";
			}
			sap.ui.commons.MessageBox.show(errorString,sap.ui.commons.MessageBox.Icon.ERROR,"Error");
				// onError(jqXHR.status, oBundle.getText("purchase_order"));
			}

		});
	},

	toggleGenerate: function(selected, oController) {
		var oModel = sap.ui.getCore().getModel();
		oModel.setProperty("/POVal", 0);
		oModel.setProperty("/SOVal", 0);
		oModel.setProperty("/listVisible", selected);

	},

	toggleDateGenerateFalse: function() {
		this.toggleDateGenerate(false, this);
	},
	toggleDateGenerateExt: function() {
		this.toggleDateGenerate(false, this);
		this.toggleGenerate(true, this);
	},
	toggleDateGenerateExt2: function() {
		this.toggleGenerate(false, this);
		this.toggleDateGenerate(true, this);
	},
	// For time based data generation
	toggleDateGenerate: function(selected, oController) {
		var oModel = sap.ui.getCore().getModel();
		oModel.setProperty("/listVisible", selected);
		oModel.setProperty("/listDateVisible", selected);
		if (selected) {
			var now = new Date();
			var startDate = new Date();
			startDate.setMonth(now.getMonth() - 1);
			var todayDate = new Date();
			oModel.setProperty("/startDate", startDate);
			oModel.setProperty("/endDate", todayDate);
		}
	},
	
	getUniqueTime: function() {
		var time = new Date().getTime();
		while (time == new Date().getTime())
		;
		return new Date().getTime();
	},

	handleDateChange: function(evt) {
		// collect input controls
		var from = evt.getParameter('from');
		var to = evt.getParameter('to');
		var valid = evt.getParameter('valid');
		var view = this.getView();

	},

	getTableSizes: function(oController) {
		var aUrl = '/get/tablesize';

		jQuery.ajax({
			url: aUrl,
			method: 'GET',
			dataType: 'json',
			success: onLoadSizes,
			error: function(jqXHR, textStatus, errorThrown) {
				onError(jqXHR.status, oBundle.getText("table_size"));
			}
		});
	}
});

function onLoadSizes(myJSON) {
	var oBarModel = sap.ui.getCore().getModel("chart");
	oBarModel.setData({
		modelData: myJSON
	});
	oBarModel.refresh();
}
