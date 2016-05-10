sap.ui.controller("shine.democontent.epm.poworklist.view.Table", {
    
    onInit : function(){
        
        var sServiceUrl = "/sap/hana/democontent/epm/services/poWorklist.xsodata/";
	   // Create and set domain model to the component
		var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
		oModel.setDefaultCountMode("Inline");
		this.getView().setModel(oModel);
		oModel.setDefaultBindingMode("TwoWay");
        var oTable = this.byId("poTable");
        oTable.getBinding("rows").attachChange(function(){
            oTable.setTitle(oBundle.getText("pos",[oTable.getBinding("rows").iLength]));
        });
        
    },

    //Toolbar Button Press Event Handler
    onTBPress: function(oEvent, oController) {

        //Excel Download
        if (oEvent.getSource() === this.byId("btnExcel")) {
            // xsjs will handle the content type and download will trigger automatically
            window.open("/sap/hana/democontent/epm/services/poWorklistQuery.xsjs?cmd=Excel");
            return;
        }

      //Zip Functionality
		 if (oEvent.getSource() === this.byId("btnZip")){
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
                        },this),
                        oBundle.getText("title_delete"));
                    break;
                case this.byId("btnEdit").getId():
                    break;
            }
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
                },this),
                oBundle.getText("confirm_title", [action]));
        }
    },

    //Table Row Select Event Handler
    onRowSelect: function(oEvent) {

    },

    //Delete Confirmation Dialog Results
    deleteConfirm: function(bResult, oController, poId) {
        if (bResult) {
            var aUrl = '/sap/hana/democontent/epm/services/poWorklistUpdate.xsjs?cmd=delete' + '&PurchaseOrderId=' + escape(poId);
            jQuery.ajax({
                url: aUrl,
                method: 'GET',
                dataType: 'text',
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
            var aUrl = '/sap/hana/democontent/epm/services/poWorklistUpdate.xsjs?cmd=approval' + '&PurchaseOrderId=' + escape(poId) + '&Action=' + escape(action);
            jQuery.ajax({
                url: aUrl,
                method: 'GET',
                dataType: 'text',
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
            sap.ui.commons.MessageBox.show(jqXHR.statusText,
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
    },

    /* Called when binding of the model is modified.
     *
     */
    onBindingChange: function(oController) {
        var view = oController.getView();
        var iNumberOfRows = view.oPHTable.getBinding("rows").iLength;
        view.oPHTable.setTitle(oBundle.getText("pos", [numericSimpleFormatter(iNumberOfRows)]));
    },
    
    onRowSelectionChange : function(oEvent){
        this.getOwnerComponent().fireEvent("poTableRowSelectionChange",{origin:oEvent});
    },
    
    openTileDialog : function(oEvent){
        var iData = parseInt(oEvent.getSource().data("tileDialog"));
        var oTileDialog = new sap.account.TileDialog(this,iData);
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
    }
});
