sap.ui.controller("shine.democontent.epm.poworklist.view.Search", {

   setFilter: function(oEvent){
       
        var terms = oEvent.getParameter("query"); 
        var attribute = "COMPANY";
        var mySplitResults = terms.split(' | ' + oBundle.getText("attribute") + ' ');
        gFilterTerms = mySplitResults[0];
        gFilterAttribute = mySplitResults[1];

        if (gFilterTerms == "*") this.emptyFilter();

        oTable = this.getOwnerComponent().getAggregation("rootControl").byId("po_table_view").byId("poTable");

        //Change from the Display Attribute Names to the property names in the ODATA service
        switch (gFilterAttribute) {
            case 'Company Name':
            case 'Firmenname':
                gFilterAttribute = 'COMPANYNAME';
                break;
            case 'Product ID':
            case 'Produkt':
                gFilterAttribute = 'PRODUCT_PRODUCTID';
                break;
            case 'Product Name':
            case 'Produkt Benennung':
                gFilterAttribute = 'ProductName';
                break;
            case 'Product Description':
            case 'Produktbeschreibung':
                gFilterAttribute = 'PRODUCTDESC';
                break;
            case 'City':
            case 'Stadt':
                gFilterAttribute = 'CITY';
                break;
            case 'Category':
            case 'Kategorie':
                gFilterAttribute = 'CATEGORY';
                break;
            case 'Purchase Order ID':
            case 'Auftragsbestätigung':
                gFilterAttribute = 'PURCHASEORDERID';
                break;
        }


        //Build OData Service Sorter by PO ID, and Item
        var sort1 = new sap.ui.model.Sorter("PURCHASEORDERID,PURCHASEORDERITEM");

        //Build the OData Service Filter Options
        if (gFilterTerms === "") {
            oTable.bindRows("/PO_WORKLIST", sort1, []);
        } else {
            var aflt1 = new sap.ui.model.Filter(escape(gFilterAttribute), sap.ui.model.FilterOperator.EQ, escape(gFilterTerms));
            oTable.bindRows("/PO_WORKLIST", sort1, [aflt1]);
        }

        //Set the Number of Rows in table header and clear the table lead selection
        var iNumberOfRows = oTable.getBinding("rows").iLength;
        oTable.setTitle(oBundle.getText("pos", [numericSimpleFormatter(iNumberOfRows)]));
        oTable.clearSelection();


        //When a new search is executed, the detail item area must be cleared
        var oView = this.getOwnerComponent().getAggregation("rootControl").byId("po_detail_view");
       

        var columns = oTable.getColumns();
        var length = columns.length;
        for (var i = 0; i < length; i++) {
            columns[i].setFilterValue('');
            columns[i].setFiltered(false);
        }

        var oTableItem = this.getOwnerComponent().getAggregation("rootControl").byId("po_detail_view").byId("poItemTable");
        
      

        var columns = oTableItem.getColumns();
        var length = columns.length;
        for (i = 0; i < length; i++) {
            columns[i].setFilterValue('');
            columns[i].setFiltered(false);
        }

    },

    emptyFilter: function() {
        gFilterTerms = "";
        gFilterAttribute = "";

        oTable = sap.ui.getCore().byId("poTable");
        var sort1 = new sap.ui.model.Sorter("PURCHASEORDERID,PURCHASEORDERITEM");
        oTable.bindRows("/PO_WORKLIST", sort1);
    },

    loadFilter: function(oEvent) {
        gSearchParam = oEvent.getParameter("value");
        if(gSearchParam.length >= 3){
        	var aUrl = '/sap/hana/democontent/epm/services/poWorklistQuery.xsjs?cmd=filter' + '&query=' + escape(oEvent.getParameter("value")) + '&page=1&start=0&limit=25';
        	jQuery.ajax({
            	url: aUrl,
            	method: 'GET',
            	dataType: 'json',
            	success: jQuery.proxy(onLoadFilter,this),
            	error: onErrorCall
        	});
        }
    },
    
    openTileDialog : function(oEvent){
        var iData = parseInt(oEvent.getSource().data("tileDialog"));
        var oTileDialog = new sap.account.TileDialog(this,iData);
        this.getView().addDependent(oTileDialog);
        oTileDialog.open();
    }
});

function onLoadFilter(myJSON) {
    var oSearchControl = this.byId("filterBy");
    var aSuggestions = [];
    for (var i = 0; i < myJSON.length; i++) {
        aSuggestions[i] = myJSON[i].terms + ' | ' + oBundle.getText("attribute") + ' ' + myJSON[i].attribute;
    }

    oSearchControl.suggest(gSearchParam, aSuggestions); //Set the found suggestions on the search control

}


function onErrorCall(jqXHR, textStatus, errorThrown) {
    sap.ui.commons.MessageBox.show(jqXHR.responseText,
        "ERROR",
        oBundle.getText("error_action"));
    return;
}
