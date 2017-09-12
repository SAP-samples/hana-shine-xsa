sap.ui.controller("sap.hana.democontent.epm.salesdashboard.view.search", {
	
	setFilter: function(oEvent){
		var keyWord = oEvent.getParameter("query");
		var soSearchTbl = this .byId("soSearchTable");
		var oPaginator=this.byId("tblPaginator");
			$.ajax({
				type: "GET",
				url: location.origin + "/search/fulltextsearch?query=" + keyWord,
				async: true,
				success: function(data, textStatus, request) {
					
					var jsonModel = new sap.ui.model.json.JSONModel();
					 jsonModel.setData({modelData: data});
					 
					  soSearchTbl.setModel(jsonModel);                                                                                  
			
			     soSearchTbl.bindRows("/modelData"); 
			    	var visibleRows = soSearchTbl.getVisibleRowCount(); 
			     
			     	oPaginator.setNumberOfPages(Math.ceil( data.length/parseInt(visibleRows)));
					oPaginator.setCurrentPage(1);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					sap.ui.commons.MessageBox.show("Error in loading Jobs Table",
						"ERROR",
						"Error");
					return;
				}
			});
		
	},
	
	onPageChange: function(oEvent){
		var oTable = this.byId("soSearchTable");
		var visibleRows=oTable.getVisibleRowCount();
		var row = (parseInt(oEvent.getParameter("targetPage").toString())-1)*visibleRows;
		
		oTable.setFirstVisibleRow(row);
			
	}
	
});