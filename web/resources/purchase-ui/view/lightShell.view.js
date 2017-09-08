sap.ui.jsview("epm_po_worklist.lightShell", {

    getControllerName: function() {
        return "epm_po_worklist.lightShell";
    },

    createContent: function(oController) {
        var oSearchView = sap.ui.view({
            id: "po_search_view",
            viewName: "epm_po_worklist.Search",
            type: sap.ui.core.mvc.ViewType.JS
        });
        var oTableView = sap.ui.view({
            id: "po_table_view",
            viewName: "epm_po_worklist.Table",
            type: sap.ui.core.mvc.ViewType.JS
        });
        var oDetailView = sap.ui.view({
            id: "po_detail_view",
            viewName: "epm_po_worklist.Detail",
            type: sap.ui.core.mvc.ViewType.JS
        });

        var oLayout = new sap.ui.commons.layout.MatrixLayout();
        //create the ApplicationHeader control
        var oAppHeader = new sap.ui.commons.ApplicationHeader("appHeader");

        //configure the branding area
        oAppHeader.setLogoSrc("./images/sap_18.png");
        oAppHeader.setLogoText(oBundle.getText("worklist"));

        //configure the welcome area
        oAppHeader.setDisplayWelcome(true);
        //oAppHeader.setUserName(oBundle.getText("attendee"));
        oController.getSessionInfo(oController, oAppHeader);

        //configure the log off area
        oAppHeader.setDisplayLogoff(true);
        oAppHeader.attachLogoff(oController.handleExitShell);

        oLayout.createRow(oAppHeader);
        oLayout.createRow(oSearchView);
        oLayout.createRow(oTableView);
        oLayout.createRow(oDetailView);

        return oLayout;
    }
});