sap.ui.controller("shine.democontent.epm.poworklist.view.Detail", {
    
    onInit : function(){
      
      this.getOwnerComponent().attachEvent("poTableRowSelectionChange",jQuery.proxy(this.onRowSelect,this));
      
      var oModel = new sap.ui.model.odata.ODataModel("/sap/hana/democontent/epm/services/poWorklist.xsodata/", true);
      this.getView().setModel(oModel);
      oModel.setDefaultCountMode("Inline");
      
      var oController = this;
    
    var oReportsTab = this.byId("tabStripDetail-3");
    oReportsTab.addEventDelegate({
        onclick : once(function(){
            sap.ui.getCore().loadLibrary("sap.viz");
            var oTabContent = sap.ui.xmlfragment("shine.democontent.epm.poworklist.view.ReportsTab",oController);
            oController.getView().addDependent(oTabContent);
            oReportsTab.addContent(oTabContent);
            var data = [{
                label: oBundle.getText("empty"),
                data: 1
            }];
            oPieModel.setData({
                modelData: data
            });
        
            sap.ui.getCore().byId("myPie").setModel(oPieModel,"piemodel");
            sap.ui.getCore().byId("lblPie").setText(oBundle.getText("sum_gross", ["EUR "]));
        
            var oGroupBy = sap.ui.getCore().byId("DDLBGroupBy");
            oGroupBy.fireChange({
                newValue: oBundle.getText("company"),
                selectedItem: oGroupBy.getItems()[0]
            });
        })
    });
        
    },

    onRowSelect: function(oEvent) {
        var oView = this.getView();
        var oTable = oEvent.getParameter("origin").getSource();
        var data = oTable.getModel();
        var poId = data.getProperty("PURCHASEORDERID", oTable.getContextByIndex(oTable.getSelectedIndex()));
        var Context = "/PurchaseOrderHeader('" + poId + "')";
        var oLayout = this.byId("mLayout1");
        oLayout.bindContext(Context);


        var oTableItems = this.byId("poItemTable");
        var ContextItem = "/PurchaseOrderItem";
        var sort1 = new sap.ui.model.Sorter("PURCHASEORDERITEM");
        oTableItems.bindRows({
            path: ContextItem,
            parameters: {
              //  expand: "Buyer",
                select: "PURCHASEORDERITEM,PRODUCT_PRODUCTID,ProductName,CATEGORY,QUANTITY,QUANTITYUNIT,GROSSAMOUNT,CURRENCY"
            },
            sorter: sort1,
            filters:[
                new sap.ui.model.odata.Filter("PURCHASEORDERID", [{operator:"EQ",value1:poId}])
            ]
        });

        var columns = oTableItems.getColumns();
        var length = columns.length;
        for (var i = 0; i < length; i++) {
            columns[i].setFilterValue('');
            columns[i].setFiltered(false);
        }

    },

    setGroupBy: function(oEvent, oController) {
        var groupBy = oEvent.oSource.getSelectedItemId();
        groupBy  = /[^-]*$/.exec(groupBy)[0];
        var aUrl = '/sap/hana/democontent/epm/services/poWorklistQuery.xsjs?cmd=getTotalOrders' + '&groupby=' + escape(groupBy) + '&currency=USD&filterterms=';

        jQuery.ajax({
            url: aUrl,
            method: 'GET',
            dataType: 'json',
            success: onLoadTotals,
            error: onErrorCall
        });
        sap.ui.core.BusyIndicator.show();

    },
    
    /*** Numeric Formatter for Currencies ***/
    numericFormatter : function(val) {
        if (val === undefined || val === null) {
            return '0'
        } else {
            jQuery.sap.require("sap.ui.core.format.NumberFormat");
            var oNumberFormat = sap.ui.core.format.NumberFormat.getIntegerInstance({
                maxFractionDigits: 2,
                minFractionDigits: 2,
                groupingEnabled: true
            });
            return oNumberFormat.format(val);
        }
    }
});

function onLoadTotals(myJSON) {

    var data = [];
    for (var i = 0; i < myJSON.entries.length; i++) {
        data[i] = {
            label: myJSON.entries[i].name,
            data: myJSON.entries[i].value
        };
    }
    oPieModel.setData({
        modelData: data
    });
    sap.ui.core.BusyIndicator.hide();
}


function onErrorCall(jqXHR, textStatus, errorThrown) {
    sap.ui.core.BusyIndicator.hide();
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
}