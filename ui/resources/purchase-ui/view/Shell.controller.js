sap.ui.controller("shine.democontent.epm.poworklist.view.Shell", {

    onInit : function(){
        
        var oShell = this.byId("myShell"); 
        oShell._getPersonalization().attachPersonalizationChange(this.handlePersonalizeShellChange);
       // initialize settings
        if (JSON && window["localStorage"]) { // only in browsers with native JSON
        // and offline storage support
            var sSettings = localStorage.getItem("sapUiShellTestSettings");
            if (sSettings) {
                oShell.initializePersonalization(JSON.parse(sSettings));
            }
        }
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

    getSessionInfo: function(oController, oUserTxt) {
        var aUrl = '/sap/hana/democontent/epm/services/poWorklistQuery.xsjs?cmd=getSessionInfo';

        jQuery.ajax({
            url: aUrl,
            method: 'GET',
            dataType: 'json',
            success: function(myJSON) {
                oController.onLoadSession(myJSON, oController, oUserTxt);
            },
            error: onErrorCall
        });
    },
    onLoadSession: function(myJSON, oController, oUserTxt) {
        for (var i = 0; i < myJSON.session.length; i++) {
            oUserTxt.setText(myJSON.session[i].UserName);
        }
    },
    handleExitShell: function(oEvent) {
        alert(oBundle.getText("logoff1"));
        oEvent.getSource().forceInvalidation();
        oEvent.getSource().destroy();
        sap.ui.getCore().applyChanges();
        jQuery(document.body).html("<span>" + oBundle.getText("logoff2") + "</span>");
    },

    handlePersonalizeShell: function(oEvent) {
        oEvent.getSource().getParent().openPersonalizationDialog();
    },

    handlePersonalizeShellChange: function(oEvent) {
        var data = oEvent.getParameter("settings"); // retrieve the personalization data object
        // ...now persist this data on the server or wherever personalization data is stored
        // (in-browser is not enough because the user wants his settings when logging in from another browser as well)
        // browser-only:
        if (JSON && window["localStorage"]) { // only in browsers with native JSON and offline storage support
            var string = JSON.stringify(data);
            localStorage.setItem("sapUiShellTestSettings", string);
        }
    }


});

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