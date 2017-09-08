sap.ui.controller("shine.democontent.epm.poworklist.view.lightShell", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     */
    onInit: function() {
        var oAppHeader = this.byId("appHeader");
        this.getSessionInfo(this, oAppHeader);
    },


    getSessionInfo: function(oController, oAppHeader) {
        var aUrl = '/sap/hana/democontent/epm/services/poWorklistQuery.xsjs?cmd=getSessionInfo';
        jQuery.ajax({
            url: aUrl,
            method: 'GET',
            dataType: 'json',
            success: function(myJSON) {
                oController.onLoadSession(myJSON, oController, oAppHeader);
            },
            error: onErrorCall
        });
    },
    onLoadSession: function(myJSON, oController, oAppHeader) {
        {
            for (var i = 0; i < myJSON.session.length; i++) {
                oAppHeader.setUserName(myJSON.session[i].UserName);
            }
        }
    },
    handleExitShell: function(oEvent) {
        alert(oBundle.getText("logoff1"));
        jQuery(document.body).html("<span>" + oBundle.getText("logoff2") + "</span>");
    }



});


function onErrorCall(jqXHR, textStatus, errorThrown) {
    sap.ui.core.BusyIndicator.hide();
    sap.ui.commons.MessageBox.show(jqXHR.responseText,
        "ERROR",
        oBundle.getText("error_action"));
    return;
}