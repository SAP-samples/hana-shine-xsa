sap.ui.controller("shine.democontent.epm.poworklist.view.Table", {

	onInit: function() {

		var sServiceUrl = "/sap/hana/democontent/epm/services/poWorklist.xsodata/";
		// Create and set domain model to the component
		var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
		oModel.setDefaultCountMode("Inline");
		this.getView().setModel(oModel);
		//oModel.setDefaultBindingMode("TwoWay");
		var oTable = this.byId("poTable");
		
	
		
	
		oTable.getBinding("rows").attachChange(function() {
			oTable.setTitle(oBundle.getText("pos", [oTable.getBinding("rows").iLength]));
			
			
		});

		//create and set models for create new purchase orders
		var sBusinessPartnersServiceUrl = "/sap/hana/democontent/epm/services/businessPartners.xsodata/";
		var sBusinessPartnersoModel = new sap.ui.model.odata.ODataModel(sBusinessPartnersServiceUrl, true);
		this.getView().setModel(sBusinessPartnersoModel, "bspartners");

		var sProductDetailsServiceUrl = "/sap/hana/democontent/epm/services/productDetails.xsodata/";
		var sProductDetailsoModel = new sap.ui.model.odata.ODataModel(sProductDetailsServiceUrl, true);
		this.getView().setModel(sProductDetailsoModel, "productDetails");

	},


	//Toolbar Button Press Event Handler
	onTBPress: function(oEvent, oController) {

		//on New Button Press
		if (oEvent.getSource() === this.byId("btnNew")) {
			var aViewName = this.getView().getViewName().split(".");
			aViewName.pop();
			var sViewPath = aViewName.join(".") + ".";
			if (!this.newDialog) {
				this.newDialog = sap.ui.xmlfragment("createNewPurchaseOrderDialog", sViewPath + "createNewPurchaseOrder", this);
				this.getView().addDependent(this.newDialog);
			}
			this.newDialog.open();
			return;
		}

		//Excel Download
		if (oEvent.getSource() === this.byId("btnExcel")) {
			// xsjs will handle the content type and download will trigger automatically

			window.open("/sap/hana/democontent/epm/services/poWorklistQuery.xsjs?cmd=Excel");
			return;
		}

		//Zip Functionality
		if (oEvent.getSource() === this.byId("btnZip")) {
			// xsjs will handle the content type and download will trigger automatically
			window.open("/sap/hana/democontent/epm/services/poWorklistQuery.xsjs?cmd=Zip");
			return;
		}

		//Check for selected item for all other events
		var oTable = this.byId("poTable");
		var data = oTable.getModel();
		var poId = data.getProperty("PURCHASEORDERID", oTable.getContextByIndex(oTable.getSelectedIndex()));
		if (poId === undefined || poId === null) {
			sap.ui.commons.MessageBox.show(oBundle.getText("error_select"),
				"ERROR",
				oBundle.getText("error_action"));
		} else {
			//Supported Buttons - Delete and Edit
			switch (oEvent.getSource().getId()) {
				case this.byId("btnDelete").getId():
					sap.ui.commons.MessageBox.confirm(oBundle.getText("confirm_delete", [poId]),
						jQuery.proxy(function(bResult) {
							this.deleteConfirm(bResult, this, poId);
						}, this),
						oBundle.getText("title_delete"));
					break;
				case this.byId("btnEdit").getId():
					break;
			}
		}

	},

	close: function(oEvent, oController) {
		var oDialog = (oEvent.getSource()).getEventingParent();
		this.clearUIFields();
		oDialog.close();
	},

	submit: function(oEvent, oController) {
		var doSubmit = this.validateFields(oEvent, oController);
		if (doSubmit == false) {
			return;
		}
		var uiKeyMapper = oBundle.getText("uiKeyMapper");
		var uiFieldArrayMapper = uiKeyMapper.split(",");

		var item = {};
		for (var i = 0; i < uiFieldArrayMapper.length; i++) {
			var id = (uiFieldArrayMapper[i].split(":"))[0];
			var uiId = (uiFieldArrayMapper[i].split(":"))[1];
			var element = sap.ui.getCore().byId(uiId);
			var additionalTextVariable = (uiFieldArrayMapper[i].split(":"))[2];
			if (additionalTextVariable !== undefined) {
				var value = element.getSelectedKey();
				item[id] = value;
			} else {
				item[id] = element.getValue();
			}
		}
		var KeyMapper = oBundle.getText("dummyValues");
		var arrayMapper = KeyMapper.split(",");
		for (var i = 0; i < arrayMapper.length; i++) {
			var id = (arrayMapper[i].split(":"))[0];
			var value = (arrayMapper[i].split(":"))[1];
			item[id] = value;
		}

		var xsrf_token;
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
			}
		});

		$.ajax({
			type: "POST",
			url: "/sap/hana/democontent/epm/services/poCreate.xsodata/purchaseDetails",
			headers: {
				'x-csrf-token': xsrf_token,
				'Accept': "application/json",
				'Content-Type': "application/json"
			},
			data: JSON.stringify(item),
			dataType: "json",
			success: function(data) {
				// var obj = JSON.parse(data);
				var oPurchaseOrderId = data.d.PURCHASEORDERID;
				sap.ui.commons.MessageBox.show('Purchase Order ' + oPurchaseOrderId + ' Created Successfully',
					"SUCCESS",
					"Purchase Order Id Created Successfully");
			},
			error: function(jqXHR, textStatus, errorThrown) {
				sap.ui.commons.MessageBox.show("Creation of Purchase orders failed",
					"ERROR",
					"Error");
				return;
			}
		});
		this.onRefresh(oEvent);
		this.newDialog.close();
	},

	liveChangeNewPO: function(oEvent, oController) {
		var element = sap.ui.getCore().byId(oEvent.getSource().getId());
		if (element.getValue() === "" && element.getValueState() === "Error") {
			element.setValueState(sap.ui.core.ValueState.Error);
		} else if (element.getValueState() === "Error") {
			element.setValueState(sap.ui.core.ValueState.Success);
		}
	},

	validateFields: function(oEvent, oController) {
		var doSubmit = true;
		var uiFieldsArray = oBundle.getText("uiFields");
		var uiFields = uiFieldsArray.split(",");
		for (var i = 0; i < uiFields.length; i++) {
			var uiId = uiFields[i];
			var element = sap.ui.getCore().byId(uiId);
			if (element.getValue() === "") {
				element.setValueState(sap.ui.core.ValueState.Error);
				doSubmit = false;
			} else {
				element.setValueState(sap.ui.core.ValueState.Success);
			}
		}

		return doSubmit;
	},

	onRefresh: function(oEvent) {
		// clear selection and filters
		var oPHTable = sap.ui.getCore().byId("idShellView--po_table_view--poTable");
		var oPITable = sap.ui.getCore().byId("idShellView--po_detail_view--poItemTable");

		oPHTable.clearSelection();
		var aCols = oPHTable.getColumns();
		if (aCols) {
			for (var i = aCols.length - 1; i >= 0; --i) {
				aCols[i].setFiltered(false);
				aCols[i].setFilterValue("");
			}
		}
		if (oPITable.isBound("rows")) {
			oPITable.unbindRows();
		}
		// clear filters
		aCols = oPITable.getColumns();
		if (aCols) {
			for (var i = aCols.length - 1; i >= 0; --i) {
				aCols[i].setFiltered(false);
				aCols[i].setFilterValue("");
			}
		}

		// bind with default value
		var sort1 = new sap.ui.model.Sorter("PURCHASEORDERID", true);
		oPHTable.bindRows({
			path: "/PO_WORKLIST",
			sorter: sort1
		});
			var oPaginator=this.byId("tablePaginator");
		var oTable= this.byId("poTable");
		var visibleRows = oTable.getVisibleRowCount();             
		oPaginator.setNumberOfPages(Math.ceil( parseInt(oTable.getBinding("rows").iLength)/parseInt(visibleRows)));
		oPaginator.setCurrentPage(1);
		this.clearUIFields();
	},

	clearUIFields: function() {
		var uiFieldsArray = oBundle.getText("uiFields");
		var uiFields = uiFieldsArray.split(",");
		for (var i = 0; i < uiFields.length; i++) {
			var uiId = uiFields[i];
			var element = sap.ui.getCore().byId(uiId);
			if (element.getValue() !== "") {
				element.setValue("");
			}
			element.setValueState(sap.ui.core.ValueState.none);
		}
	},

	//Toolbar Menu Select Event Handler - Reject & Accept
	onMenuSelected: function(oEvent, oController) {

		//Check for selected item for all other events		 
		var oTable = this.byId("poTable");
		var data = oTable.getModel();
		var poId = data.getProperty("PURCHASEORDERID", oTable.getContextByIndex(oTable.getSelectedIndex()));
		if (poId === undefined || poId === null) {
			sap.ui.commons.MessageBox.show(oBundle.getText("error_select"),
				"ERROR",
				oBundle.getText("error_action"));
		} else {
			var action;
			switch (oEvent.getParameter("itemId")) {
				case this.byId("itemReject").getId():
					action = "Reject";
					break;
				case this.byId("itemAccept").getId():
					action = "Accept";
					break;
			}
			sap.ui.commons.MessageBox.confirm(oBundle.getText("confirm_po", [action, poId]),
				jQuery.proxy(function(bResult) {
					this.approvalConfirm(bResult, this, poId, action);
				}, this),
				oBundle.getText("confirm_title", [action]));
		}
	},

	//Table Row Select Event Handler
	onRowSelect: function(oEvent) {

	},

	//Delete Confirmation Dialog Results
	deleteConfirm: function(bResult, oController, poId) {
		if (bResult) {
				var payload = {"payload":[{"purchaseOrderId":escape(poId)}]};
			var xsrf_token;
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
				}
			});
			var aUrl = '/sap/hana/democontent/epm/services/poWorklistUpdate.xsjs?cmd=delete';
			jQuery.ajax({
				url: aUrl,
				method: 'POST',
				headers: {
				'x-csrf-token': xsrf_token
				},
				data: JSON.stringify(payload),
				 contentType: "application/json",
				success: function(myTxt) {
					oController.onDeleteSuccess(myTxt, oController);
				},
				error: oController.onErrorCall
			});
		}
	},

	//Approve Confirmation Dialog Results
	approvalConfirm: function(bResult, oController, poId, action) {
		if (bResult) {
			var payload = {"payload":[{"purchaseOrderId":escape(poId)},
							{"Action":escape(action)}]};
				var xsrf_token;
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
				}
			});
			var aUrl = '/sap/hana/democontent/epm/services/poWorklistUpdate.xsjs?cmd=approval';
			jQuery.ajax({
				url: aUrl,
				headers: {
				'x-csrf-token': xsrf_token
				},
				method: 'POST',
				data: JSON.stringify(payload),
				 contentType: "application/json",
				success: function(myTxt) {
					oController.onApprovalSuccess(myTxt, oController, action);
				},
				error: oController.onErrorCall
			});
		}
	},

	//Delete Successful Event Handler
	onDeleteSuccess: function(myTxt, oController) {

		oController.refreshTable();
		sap.ui.commons.MessageBox.show(oBundle.getText("delete_success"),
			"SUCCESS",
			oBundle.getText("title_delete_success"));

	},

	//Approval Successful Event Handler
	onApprovalSuccess: function(myTxt, oController, action) {

		oController.refreshTable();
		sap.ui.commons.MessageBox.show(oBundle.getText("title_approve_success", [action]),
			"SUCCESS",
			oBundle.getText("title_approve_success"));

	},

	//Error Event Handler
	onErrorCall: function(jqXHR, textStatus, errorThrown) {
		if (jqXHR.status == '500') {
			sap.ui.commons.MessageBox.show(jqXHR.responseText,
				"ERROR",
				oBundle.getText("error_action"));
			return;
		} else {
			sap.ui.commons.MessageBox.show(decodeURI(jqXHR.responseText),
				"ERROR",
				oBundle.getText("error_action"));
			return;
		}
	},

	//Utility function to refresh the table & reset # of recs in title
	refreshTable: function() {
		oTable = this.byId("poTable");
		var bindingInfo = oTable.getBindingInfo("rows");
		var sort1 = new sap.ui.model.Sorter("PURCHASEORDERID");
		oTable.bindRows("/PO_WORKLIST", sort1, bindingInfo.filters);

		var columns = oTable.getColumns();
		var length = columns.length;
		for (var i = 0; i < length; i++) {
			columns[i].setFilterValue('');
			columns[i].setFiltered(false);
		}
			var oPaginator=this.byId("tablePaginator");
		var oTable= this.byId("poTable");
		var visibleRows = oTable.getVisibleRowCount();             
		oPaginator.setNumberOfPages(Math.ceil( parseInt(oTable.getBinding("rows").iLength)/parseInt(visibleRows)));
		oPaginator.setCurrentPage(1);
	},

	/* Called when binding of the model is modified.
	 *
	 */
	onBindingChange: function(oController) {
		var view = oController.getView();
		var oPHTable=view.byId("poTable");
		var iNumberOfRows = oPHTable.getBinding("rows").iLength;
		oPHTable.setTitle(oBundle.getText("pos", [numericSimpleFormatter(iNumberOfRows)]));
	},

	onRowSelectionChange: function(oEvent) {
		this.getOwnerComponent().fireEvent("poTableRowSelectionChange", {
			origin: oEvent
		});
		var	oTable = this.byId("poTable");
		var rowNum = oTable.getSelectedIndex();
		var visibleRows=oTable.getVisibleRowCount();
		this.byId("tablePaginator").setCurrentPage(Math.ceil( parseInt(rowNum)/parseInt(visibleRows))); 
		
	},

	openTileDialog: function(oEvent) {
		var iData = parseInt(oEvent.getSource().data("tileDialog"));
		var oTileDialog = new sap.account.TileDialog(this, iData);
		this.getView().addDependent(oTileDialog);
		oTileDialog.open();
	},

	onAfterRendering: function(oEvent) {
		var oController = this;
		var oModel = new sap.ui.model.odata.ODataModel("/sap/hana/democontent/epm/services/poWorklist.xsodata/", true);
		var oSHTable = sap.ui.getCore().byId("idShellView--po_table_view--poTable");
		oModel.attachRequestCompleted(function() {
			oController.onBindingChange(oController);
		});
		oSHTable.setModel(oModel);
		       
		var oPaginator=this.byId("tablePaginator");
		var oTable= this.byId("poTable");
		var visibleRows = oTable.getVisibleRowCount();             
		oPaginator.setNumberOfPages(Math.ceil( parseInt(oTable.getBinding("rows").iLength)/parseInt(visibleRows)));
		
	
		
	},
	onPageChange: function(oEvent){
		var oTable = this.byId("poTable");
		var visibleRows=oTable.getVisibleRowCount();
		var row = (parseInt(oEvent.getParameter("targetPage").toString())-1)*visibleRows;
		
		oTable.setFirstVisibleRow(row);
			
	}
});
