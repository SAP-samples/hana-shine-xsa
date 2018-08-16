sap.ui.controller("sap.hana.democontent.epm.salesdashboard.view.main", {

    // instantiated view will be added to the oViewCache object and retrieved from there
    oViewCache: {},

    onInit: function() {
    	 sap.app.mainController = this;
    },

    /**
     * getCachedView checks if view already exists in oViewCache object, will create it if not, and return the view
     */
    getCachedView: function(viewName) {
        if (!this.oViewCache[viewName]) {
            var fullViewName = "sap.hana.democontent.epm.salesdashboard.view" + "." + viewName;
            this.oViewCache[viewName] = sap.ui.view({
                id: viewName,
                viewName: fullViewName,
                type: sap.ui.core.mvc.ViewType.XML
            });
        }
        return this.oViewCache[viewName];
    },

    logout: function() {
        var aUrl = "/sap/hana/xs/formLogin/token.xsjs";
        jQuery.ajax({
            url: aUrl,
            method: 'GET',
            dataType: 'text',
            beforeSend: function(jqXHR) {
                jqXHR.setRequestHeader('X-CSRF-Token', 'Fetch');
            },
            success: function(arg1, arg2, jqXHR) {
                var aUrl = "/sap/hana/xs/formLogin/logout.xscfunc";
                jQuery.ajax({
                    url: aUrl,
                    type: 'POST',
                    dataType: 'text',
                    beforeSend: function(jqXHR1, settings) {
                        jqXHR1.setRequestHeader('X-CSRF-Token', jqXHR.getResponseHeader('X-CSRF-Token'));
                    },
                    success: function() {
                        location.reload();
                    },
                    error: function() {

                    }
                });

            },
            error: function() {

            }
        });
    },

    

    
    	onAfterRendering: function() {
    	    
    	    var oShell = sap.ui.getCore().byId("__xmlview0--myShell");
    	    
    		if (!sap.isSingle) {
    			oShell.addWorksetItem(new sap.ui.ux3.NavigationItem({
    				id : "nav-overview",
    				text : sap.app.i18n.getText("OVERVIEW_TITLE")
    			}));
    			oShell.addWorksetItem(new sap.ui.ux3.NavigationItem({
    				id : "nav-products",
    				text : sap.app.i18n.getText("PRODUCT_REPORTS_TITLE")
    			}));
    		}
    		
    		oShell.addWorksetItem(new sap.ui.ux3.NavigationItem({
    			id : "nav-details",
    			text : sap.app.i18n.getText("DETAILS_TITLE")
    		}));
    		
    		oShell.addStyleClass('sapDkShell');
    		
    		// action when shell workset item are clicked
    		oShell.attachWorksetItemSelected(function(oEvent) {
    			var sViewName = oEvent.getParameter("id").replace("nav-", "");
    			oShell.setContent(sap.app.mainController.getCachedView(sViewName));
    		});
    
    		// initial shell content
    		if (!sap.isSingle) {
    			oShell.addContent(sap.app.mainController.getCachedView("overview"));
    		} else {
    			oShell.addContent(sap.app.mainController.getCachedView("details"));
    		}
    	}

    

});